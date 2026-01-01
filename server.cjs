const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { Client } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    if (req.method === 'POST' && req.path.startsWith('/api/')) {
        console.log('[DEBUG] Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Initialize Supabase client if credentials are available
let supabase = null;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
        const { createClient } = require("@supabase/supabase-js");
        supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        console.log("✅ Connected to Supabase");
    } catch (err) {
        console.warn("⚠️ Failed to initialize Supabase:", err.message);
    }
} else {
    console.warn("⚠️ Supabase credentials not found. Some features may not work.");
}

// ---- SECURE ENDPOINTS ----

// Secure Money Transfer Endpoint
// Fixes: Race condition (Finding #5) and Client-side validation bypass (Finding #9)
app.post('/api/transfer', async (req, res) => {
    const { from_account, to_account, amount, description, session_token } = req.body;

    // Validate required fields
    if (!from_account || !to_account || !amount || !session_token) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields: from_account, to_account, amount, session_token"
        });
    }

    // Validate amount is positive number
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({
            success: false,
            error: "Amount must be a positive number"
        });
    }

    if (transferAmount < 0.01) {
        return res.status(400).json({
            success: false,
            error: "Minimum transfer amount is $0.01"
        });
    }

    // Validate account number format
    if (!/^\d{10}$/.test(to_account)) {
        return res.status(400).json({
            success: false,
            error: "Recipient account number must be exactly 10 digits"
        });
    }

    if (from_account === to_account) {
        return res.status(400).json({
            success: false,
            error: "Cannot transfer to your own account"
        });
    }

    // Check Supabase is initialized
    if (!supabase) {
        return res.status(500).json({
            success: false,
            error: "Database connection not available"
        });
    }

    try {
        // Step 1: Validate session token and get user
        const { data: { user }, error: authError } = await supabase.auth.getUser(session_token);

        if (authError || !user) {
            console.log("[Secure Transfer] Invalid session token");
            return res.status(401).json({
                success: false,
                error: "Invalid or expired session. Please log in again."
            });
        }

        console.log(`[Secure Transfer] Authenticated user: ${user.id}`);

        // Step 2: Get sender profile and validate ownership
        const { data: sender, error: senderError } = await supabase
            .from("profiles")
            .select("id, account_number, balance, full_name")
            .eq("id", user.id)
            .single();

        if (senderError || !sender) {
            return res.status(404).json({
                success: false,
                error: "Sender profile not found"
            });
        }

        // Validate sender owns the from_account
        if (sender.account_number !== from_account) {
            console.log(`[Secure Transfer] Account mismatch: ${sender.account_number} vs ${from_account}`);
            return res.status(403).json({
                success: false,
                error: "You can only transfer from your own account"
            });
        }

        // Step 3: Server-side balance validation (fixes Finding #9)
        if (sender.balance < transferAmount) {
            return res.status(400).json({
                success: false,
                error: `Insufficient balance. Available: $${sender.balance.toFixed(2)}`
            });
        }

        // Step 4: Get recipient profile
        const { data: recipient, error: recipientError } = await supabase
            .from("profiles")
            .select("id, account_number, balance, full_name")
            .eq("account_number", to_account)
            .single();

        if (recipientError || !recipient) {
            return res.status(404).json({
                success: false,
                error: "Recipient account not found. Please verify the account number."
            });
        }

        // Step 5: Perform ATOMIC transaction (fixes Finding #5 - Race Condition)
        // We use a database transaction to ensure all-or-nothing execution
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            // Fallback: Use Supabase SDK (non-atomic but better than nothing)
            console.warn("[Secure Transfer] DATABASE_URL not set, using non-atomic fallback");

            // Deduct from sender
            const { error: deductError } = await supabase
                .from("profiles")
                .update({ balance: sender.balance - transferAmount })
                .eq("id", sender.id)
                .eq("balance", sender.balance); // Optimistic locking

            if (deductError) {
                return res.status(500).json({
                    success: false,
                    error: "Failed to process transfer. Please try again."
                });
            }

            // Add to recipient
            const { error: addError } = await supabase
                .from("profiles")
                .update({ balance: recipient.balance + transferAmount })
                .eq("id", recipient.id);

            if (addError) {
                // Rollback sender balance
                await supabase
                    .from("profiles")
                    .update({ balance: sender.balance })
                    .eq("id", sender.id);

                return res.status(500).json({
                    success: false,
                    error: "Failed to credit recipient. Transfer rolled back."
                });
            }

            // Create transaction record
            const { error: txError } = await supabase
                .from("transactions")
                .insert({
                    from_user_id: sender.id,
                    to_user_id: recipient.id,
                    from_account_number: from_account,
                    to_account_number: to_account,
                    amount: transferAmount,
                    transaction_type: "transfer",
                    status: "completed",
                    description: description?.trim() || "Money transfer"
                });

            if (txError) {
                console.error("[Secure Transfer] Transaction record failed:", txError);
                // Balance already transferred, just log the error
            }

            console.log(`[Secure Transfer] SUCCESS: $${transferAmount} from ${from_account} to ${to_account}`);
            return res.json({
                success: true,
                message: `Successfully transferred $${transferAmount.toFixed(2)} to ${recipient.full_name}`,
                recipient_name: recipient.full_name
            });
        }

        // Use pg client for true atomic transaction
        const pgClient = new Client({ connectionString });

        try {
            await pgClient.connect();
            await pgClient.query('BEGIN');

            // Deduct from sender with row-level locking
            const deductResult = await pgClient.query(
                `UPDATE profiles 
                 SET balance = balance - $1 
                 WHERE id = $2 AND balance >= $1 
                 RETURNING balance`,
                [transferAmount, sender.id]
            );

            if (deductResult.rowCount === 0) {
                await pgClient.query('ROLLBACK');
                await pgClient.end();
                return res.status(400).json({
                    success: false,
                    error: "Insufficient balance or concurrent modification detected"
                });
            }

            // Add to recipient
            await pgClient.query(
                `UPDATE profiles SET balance = balance + $1 WHERE id = $2`,
                [transferAmount, recipient.id]
            );

            // Insert transaction record
            await pgClient.query(
                `INSERT INTO transactions 
                 (from_user_id, to_user_id, from_account_number, to_account_number, amount, transaction_type, status, description)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [sender.id, recipient.id, from_account, to_account, transferAmount, 'transfer', 'completed', description?.trim() || 'Money transfer']
            );

            await pgClient.query('COMMIT');
            await pgClient.end();

            console.log(`[Secure Transfer] SUCCESS (atomic): $${transferAmount} from ${from_account} to ${to_account}`);
            return res.json({
                success: true,
                message: `Successfully transferred $${transferAmount.toFixed(2)} to ${recipient.full_name}`,
                recipient_name: recipient.full_name
            });

        } catch (txErr) {
            await pgClient.query('ROLLBACK').catch(() => { });
            await pgClient.end().catch(() => { });
            console.error("[Secure Transfer] Transaction error:", txErr.message);
            return res.status(500).json({
                success: false,
                error: "Transaction failed. No funds were transferred."
            });
        }

    } catch (err) {
        console.error("[Secure Transfer] FULL ERROR:", err);
        console.error("[Secure Transfer] Error stack:", err.stack);
        return res.status(500).json({
            success: false,
            error: err.message || "An unexpected error occurred. Please try again."
        });
    }
});

// ---- VULNERABLE ENDPOINTS (DEMO ONLY) ----

// 1. SQL Injection Vulnerability (Real Supabase Data)
// We use the 'pg' driver to connect directly to the database string and execute raw SQL.
// Payload example: username: "admin' OR '1'='1" (assumes a 'profiles' or 'users' table exists)

app.post('/api/login-vulnerable', async (req, res) => {
    const { username } = req.body; // Password ignored in bypass
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        return res.status(500).json({
            error: "DATABASE_URL is missing in .env",
            message: "To test real SQLi, add DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres to your .env file."
        });
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log("[SQLi Endpoint] Connected to DB (Real)");

        // VULNERABLE: Direct concatenation
        // We query the 'profiles' table which we know exists from test-connection.js
        // We assume 'email' is the username equivalent here.
        const query = `SELECT * FROM profiles WHERE email = '${username}'`;
        console.log(`[SQLi Endpoint] Executing Query: ${query}`);

        const result = await client.query(query);
        await client.end();

        if (result.rows.length > 0) {
            console.log("[SQLi Endpoint] Login Successful via injection or valid user");
            return res.json({ success: true, user: result.rows[0], message: "Logged in via Real SQL Injection!" });
        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials (or no rows found)" });
        }
    } catch (err) {
        console.error("[SQLi Endpoint] DB Error:", err.message);
        if (client) await client.end().catch(() => { }); // cleanup
        return res.status(500).json({ error: "Database error", details: err.message });
    }
});

// 2. Command Injection Vulnerability
// Payload example: host: "google.com && dir" (Windows) or "google.com; ls" (Linux/Mac)
app.post('/api/ping-vulnerable', (req, res) => {
    const { host } = req.body;

    if (!host) {
        return res.status(400).json({ error: "Host is required" });
    }

    // VULNERABLE: Direct concatenation of user input into shell command
    const command = `ping -n 1 ${host}`; // using -n for Windows (or -c for Linux, auto-detect below)

    console.log(`[Cmd Injection Endpoint] Executing: ${command}`);

    // Note: We use the platform specific ping count flag for validity, but the injection works regardless.
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`[Cmd Injection Endpoint] Error: ${error.message}`);
            // Often errors contain the output of the failed command which leaks info
            return res.json({ output: stdout || stderr || error.message });
        }
        res.json({ output: stdout });
    });
});

// 3. Reflected XSS Vulnerability
// Payload example: ?q=<script>alert(1)</script>
app.get('/api/search-vulnerable', (req, res) => {
    const query = req.query.q || "";

    // VULNERABLE: Directly returning user input in HTML without escaping
    const html = `
        <!DOCTYPE html>
        <html>
        <head><title>Vulnerable Search</title></head>
        <body>
            <h1>Search Results</h1>
            <p>You searched for: <b>${query}</b></p>
            <hr>
            <p>No results found (this is just a demo).</p>
        </body>
        </html>
    `;

    res.send(html);
});

// Example of a secure endpoint (placeholder)
// app.get('/api/secure-endpoint', (req, res) => { ... });

// ---- Serve static React app (must build first) ----
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Backend API Server running on http://localhost:${PORT}`);
});
