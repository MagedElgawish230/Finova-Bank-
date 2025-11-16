# Supabase Setup for Vulnerable Server

This server now connects to your real Supabase database instead of using mock data.

## Environment Variables Required

You need to set the following environment variables before running the server:

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. Copy your **Project URL** (this is your `SUPABASE_URL`)
4. Copy your **service_role** key (this is your `SUPABASE_SERVICE_ROLE_KEY`)
   - ⚠️ **IMPORTANT**: Use the `service_role` key, NOT the `anon` key
   - The service role key bypasses Row Level Security (RLS) policies

### 2. Set Environment Variables

The server automatically loads environment variables from your `.env` file using `dotenv`.

**Add to your existing `.env` file:**

```env
# Your existing variables (VITE_SUPABASE_URL, etc.)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here

# Add this new variable for server-side access:
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Note**: 
- The server uses `VITE_SUPABASE_URL` (or `SUPABASE_URL`) from your existing `.env` file
- You need to add `SUPABASE_SERVICE_ROLE_KEY` to your `.env` file
- Make sure `.env` is in your `.gitignore` to avoid committing secrets!

#### Option B: Set environment variables directly

**Windows (PowerShell):**
```powershell
$env:SUPABASE_URL="https://your-project-id.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
node server.cjs
```

**Windows (CMD):**
```cmd
set SUPABASE_URL=https://your-project-id.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
node server.cjs
```

**Linux/Mac:**
```bash
export SUPABASE_URL="https://your-project-id.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
node server.cjs
```

### 3. Run the Server

```bash
node server.cjs
```

The server will:
- ✅ Connect to Supabase if credentials are provided
- ⚠️ Use mock data fallback if credentials are missing (with a warning)

## What Data is Exposed?

The vulnerable endpoints now expose **real data** from your Supabase tables:

1. **`/api/vuln-login`** - Exposes profiles from `profiles` table
2. **`/api/vuln-profiles`** - Exposes all profiles from `profiles` table
3. **`/api/vuln-transactions`** - Exposes all transactions from `transactions` table
4. **`/api/vuln-contact-messages`** - Exposes all messages from `contact_messages` table

## Testing

Use the `test-sqli.html` file to test SQL injection attacks and see the exposed data:

1. Start the server: `node server.cjs`
2. Open `test-sqli.html` in your browser
3. Click the test buttons to see real data from your Supabase database

## Security Warning

⚠️ **This server is intentionally vulnerable for penetration testing purposes only!**

- Never use this in production
- The service role key has full database access
- All endpoints are vulnerable to SQL injection
- Real user data will be exposed during testing

