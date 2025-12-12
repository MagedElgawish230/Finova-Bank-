import assert from 'assert';

async function testVulnerabilities() {
    const baseUrl = 'http://localhost:8080';
    console.log("Starting Vulnerability Verification...");

    // 1. Test SQL Injection (Real Data Mode)
    console.log("\nTesting SQL Injection...");
    try {
        // We assume 'profiles' exists. We try to select the first one.
        // Payload: ' OR '1'='1
        const res = await fetch(`${baseUrl}/api/login-vulnerable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "' OR '1'='1" }) // We inject directly into email check
        });
        const data = await res.json();
        console.log("SQLi Response:", data);
        if (data.success && data.message.includes("Real")) {
            console.log("✅ SQL Injection Verified: Retrieved real data (first profile).");
        } else if (data.error && data.error.includes("DATABASE_URL")) {
            console.warn("⚠️ SQL Injection Skipped: DATABASE_URL missing in .env (Add it to test real DB).");
        } else {
            console.error("❌ SQL Injection Failed.");
        }
    } catch (e) {
        console.error("❌ SQL Injection Error:", e.message);
    }

    // 2. Test Command Injection
    console.log("\nTesting Command Injection...");
    try {
        // We use 'echo VULNERABLE' to see if it gets executed. 
        // Windows uses & or &&. We'll try basic concatenation.
        const res = await fetch(`${baseUrl}/api/ping-vulnerable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host: "127.0.0.1 & echo VULNERABLE" })
        });
        const data = await res.json();
        console.log("Cmd Injection Response:", data);
        if (data.output && data.output.includes("VULNERABLE")) {
            console.log("✅ Command Injection Verified: 'VULNERABLE' echoed back.");
        } else {
            // It might fail if ping takes too long or different shell syntax, but let's see output.
            console.warn("⚠️ Command Injection Output needs manual check (see above).");
        }
    } catch (e) {
        console.error("❌ Command Injection Error:", e.message);
    }

    // 3. Test XSS
    console.log("\nTesting XSS...");
    try {
        const payload = "<script>alert('XSS')</script>";
        const res = await fetch(`${baseUrl}/api/search-vulnerable?q=${encodeURIComponent(payload)}`);
        const text = await res.text();
        console.log("XSS Response Preview:", text.substring(0, 100).replace(/\n/g, ' '));
        if (text.includes(payload)) {
            console.log("✅ XSS Verified: Payload reflected in response.");
        } else {
            console.error("❌ XSS Failed: Payload not found.");
        }
    } catch (e) {
        console.error("❌ XSS Error:", e.message);
    }
}

testVulnerabilities();
