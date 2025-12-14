
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function reconcileBalances() {
    console.log("Starting reconciliation...");

    const { data: profiles, error: pError } = await supabase.from("profiles").select("*");
    if (pError) throw pError;

    for (const profile of profiles) {
        console.log(`Checking profile: ${profile.full_name} (${profile.account_number})`);

        // Get all completed transactions for this user
        const { data: incoming, error: iError } = await supabase
            .from("transactions")
            .select("id, amount, status, from_account_number, description")
            .eq("to_user_id", profile.id); // Removing status filter for debugging

        if (incoming && incoming.length > 0) {
            console.log("Incoming Transactions Found:", incoming);
        } else {
            console.log("No incoming transactions found via query.");
        }

        const { data: outgoing, error: oError } = await supabase
            .from("transactions")
            .select("id, amount, status")
            .eq("from_user_id", profile.id)
            .eq("status", "completed");

        const totalIncoming = (incoming || []).reduce((acc, tx) => acc + Number(tx.amount), 0);
        const totalOutgoing = (outgoing || []).reduce((acc, tx) => acc + Number(tx.amount), 0);

        console.log(`Current Balance: ${profile.balance}`);
        console.log(`Total Received: ${totalIncoming}`);
        console.log(`Total Sent: ${totalOutgoing}`);
        console.log(`Net Change from Transactions: ${totalIncoming - totalOutgoing}`);

        // Assuming 1000 base starting balance for everyone
        const calculatedBalance = 1000 + totalIncoming - totalOutgoing;
        console.log(`Calculated Balance (assuming 1000 base): ${calculatedBalance}`);

        if (Math.abs(calculatedBalance - profile.balance) > 0.01) {
            console.log(`⚠️ MISMATCH DETECTED for ${profile.full_name}!`);
            console.log(`Updating balance to ${calculatedBalance}...`);

            const { error: updateError } = await supabase
                .from("profiles")
                .update({ balance: calculatedBalance })
                .eq("id", profile.id);

            if (updateError) console.error("Update failed:", updateError);
            else console.log("✅ Balance updated.");
        } else {
            console.log("✅ Balance appears consistent (with 1000 base assumption).");
        }
        console.log("------------------------------------------------");
    }
}

reconcileBalances().catch(console.error);
