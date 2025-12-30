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

// 4. Secure Transfer Endpoint (Validation Only)
// This endpoint receives requests that have PASSED the AI Firewall.
// If the firewall blocked the request, it would never reach here (403).
// If it reaches here, we simply return 200 OK so the frontend knows to proceed.
app.post('/api/secure-transfer', (req, res) => {
    console.log("[Secure Transfer] Request passed firewall validation.");
    res.json({ success: true, message: "Request validated by firewall." });
});

// Example of a secure endpoint (placeholder)
// app.get('/api/secure-endpoint', (req, res) => { ... });

// ---- Serve static React app (must build first) ----
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`✅ Secure Server running on http://localhost:${PORT}`);
});
