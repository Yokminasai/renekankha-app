# Security & Auto-Username Implementation Guide

## Overview
This guide documents the RENEKANKHA authentication system with automatic sequential username assignment.

## Authentication Flow

### Registration (Anonymous Mode)
1. User enters 12-word seed phrase
2. Frontend generates SHA-256 hash
3. Backend receives: seedPhrase, hash, anonymous=true
4. Backend auto-assigns username: user_1, user_2, user_3, ...
5. User data stored with unique userId + autoUsername
6. Session created with 7-day expiry

### Login
1. User enters seed phrase
2. Frontend generates SHA-256 hash
3. Backend finds user by seedPhraseHash
4. Backend verifies seed phrase (PBKDF2 with salt)
5. Session created with userId + username
6. User can access their isolated data

## Auto-Username Assignment

### How It Works
- When user registers, count existing anonymous users
- Assign `user_N` where N = count + 1
- First user gets: `user_1`
- Second user gets: `user_2`
- Last user gets: `user_N`

### Implementation

In `server.js` - `/api/auth/anonymous-register` endpoint:

```javascript
// Get existing anonymous users count
const anonymousUsers = users.users.filter(u => u.anonymous);
const autoUsername = 'user_' + (anonymousUsers.length + 1);

// Create user object with auto-username
const user = {
  id: nanoid(10),
  username: autoUsername,        // ← NEW: Auto-assigned
  name: String(name || ''),
  seedPhraseHash: hash,
  role: 'user',
  anonymous: true,
  createdAt: new Date().toISOString()
};

// Return username in response
res.status(201).json({
  ok: true,
  user: {
    id: user.id,
    name: user.name,
    username: autoUsername,     // ← Return username to frontend
    role: user.role,
    anonymous: true
  }
});
```

## Data Isolation (Per User)

### Transactions
```javascript
// Backend filter
const userTransactions = db.transactions.filter(t => t.userId === s.userId);

// Result: Each user only sees their own transactions
- User 1 sees only their income/expenses
- User 2 sees only their income/expenses
- No data leakage between users
```

### 2FA Keys
```javascript
// Backend filter
const userKeys = keys.keys.filter(k => k.userId === s.userId);

// Result: Each user only sees their own 2FA keys
```

## Security Features

### ✅ Current Implementation
- Seed phrase validation (12 words)
- SHA-256 client-side hashing
- Duplicate seed phrase prevention
- Session with 7-day expiry
- HttpOnly + SameSite cookies
- PBKDF2 hashing (passwords)
- Per-user data filtering
- Content Security Policy
- CORS configuration

### ⏳ In Progress
- Rate limiting (5 attempts per 15 minutes)
- Session cleanup job (remove expired sessions)
- Backend seed phrase verification with PBKDF2 + salt

## User Data Model

```javascript
{
  id: "abc123def",              // Unique system ID
  username: "user_1",           // Auto-assigned sequential username
  name: "optional display name",
  seedPhraseHash: "sha256...",  // Client-side hash for lookup
  seedSalt: "base64salt...",    // Server-side salt
  seedHashVerify: "pbkdf2...",  // Server-side verification hash
  role: "user",
  anonymous: true,
  createdAt: "2025-10-18T..."
}
```

## Transaction Model

```javascript
{
  id: "xyz789abc",
  userId: "abc123def",          // ← Filter by this for data isolation
  type: "income" | "expense",
  amount: 1000,
  description: "Details...",
  date: "2025-10-18T...",
  createdAt: "2025-10-18T..."
}
```

## Session Lifecycle

1. **Registration** → Create user with auto-username
2. **Session Created** → Cookie with 7-day expiry
3. **Active Usage** → All queries filtered by userId
4. **7 Days Pass** → Session auto-expires
5. **Login Required** → User must login again with seed phrase

## Testing Checklist

- [ ] Register as user_1 with seed phrase A
- [ ] Register as user_2 with seed phrase B
- [ ] Verify user_1 username displays correctly
- [ ] Verify user_2 username displays correctly
- [ ] User_1 adds transaction with amount 500
- [ ] User_2 adds transaction with amount 300
- [ ] User_1 logs out and login again
- [ ] User_1 only sees their 500 transaction
- [ ] User_2 only sees their 300 transaction
- [ ] No data leakage between users

## Deployment

After implementation:

```bash
git add server.js register.html dashboard.html index.html username-assignment.js
git commit -m "Feature: Auto-assign sequential usernames & improve data isolation"
git push origin main
# Deploy to Vercel
```

## Next Phase: Advanced Features

### Optional Enhancements
- User profile customization (display name)
- Username change (with cost/verification)
- Multi-seed phrase support
- Account recovery (security questions)
- 2FA for authentication
- Activity logging
- Rate limiting (already coded)

## Security Warnings

⚠️ **Important**
- Seed phrase is the ONLY password
- If lost, account is unrecoverable
- Never share seed phrase
- Browser must support Web Crypto API
- HTTPS required (Vercel provides)
- No account recovery mechanism
