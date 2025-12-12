const express = require("express");
const fs = require("fs");
const path = require("path");
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
