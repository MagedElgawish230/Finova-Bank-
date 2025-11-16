// Quick diagnostic script to test Supabase connection
require('dotenv').config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase Connection...\n');

if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL not found in environment variables');
  console.log('   Set VITE_SUPABASE_URL or SUPABASE_URL in your .env file');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  console.log('   Set SUPABASE_SERVICE_ROLE_KEY in your .env file');
  console.log('   Get it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`   URL: ${SUPABASE_URL.substring(0, 30)}...`);
console.log(`   Service Key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...\n`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('📊 Testing database connection...\n');
  
  // Test profiles table
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, account_number, balance, email, phone, mfa_enabled, mfa_code')
      .limit(10);
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log(`✅ Profiles table: Found ${profiles?.length || 0} records`);
      if (profiles && profiles.length > 0) {
        console.log('   Sample profile:', {
          email: profiles[0].email,
          name: profiles[0].full_name,
          account: profiles[0].account_number
        });
      }
    }
  } catch (err) {
    console.error('❌ Exception fetching profiles:', err.message);
  }
  
  // Test transactions table
  try {
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('id, amount, transaction_type, status')
      .limit(5);
    
    if (transactionsError) {
      console.error('❌ Error fetching transactions:', transactionsError.message);
    } else {
      console.log(`✅ Transactions table: Found ${transactions?.length || 0} records`);
    }
  } catch (err) {
    console.error('❌ Exception fetching transactions:', err.message);
  }
  
  // Test contact_messages table
  try {
    const { data: messages, error: messagesError } = await supabase
      .from('contact_messages')
      .select('id, email, subject')
      .limit(5);
    
    if (messagesError) {
      console.error('❌ Error fetching contact_messages:', messagesError.message);
    } else {
      console.log(`✅ Contact messages table: Found ${messages?.length || 0} records`);
    }
  } catch (err) {
    console.error('❌ Exception fetching contact_messages:', err.message);
  }
  
  console.log('\n✨ Connection test complete!');
  console.log('\n💡 If you see 0 records, your tables are empty.');
  console.log('   Add some test data in Supabase Dashboard to test SQL injection attacks.');
}

testConnection().catch(console.error);

