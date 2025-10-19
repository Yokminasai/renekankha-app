# 🔄 Vercel KV Migration Guide

## ⚠️ IMPORTANT: This is a STEP-BY-STEP guide to migrate from JSON files to Vercel KV persistent storage

---

## 📋 What We're Doing

**Before (❌ Current):**
```
JSON files → Lost on Vercel restart
├── data/users.json
├── data/sessions.json
├── data/transactions.json
└── etc...
```

**After (✅ After Migration):**
```
Vercel KV → Persistent storage ✓
├── app:users
├── app:sessions
├── app:transactions
└── etc...
```

---

## 🎯 Migration Steps

### **Step 1: Setup Vercel KV (10 min)**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: **renekankha-1427**
3. Go to **Storage** tab
4. Click **+ Create Database** → Choose **KV**
5. Name: `renekankha-kv` (or any name)
6. Region: Choose closest to you
7. Click **Create**

### **Step 2: Connect Environment Variables (5 min)**

Vercel will automatically add:
```
KV_URL=redis://default:xxxxx@xxxxx-xxxxx.upstash.io:12345
KV_REST_API_URL=https://xxxxx-xxxxx.upstash.io
KV_REST_API_TOKEN=xxxxx
```

✅ These are already in your environment!

### **Step 3: Update server.js (Most Important Part)**

Replace file operations:

```javascript
// BEFORE ❌
const usersFile = path.join(dataDir, 'users.json');
const users = readJSON(usersFile);
writeJSON(usersFile, users);

// AFTER ✅
import { getUsers, saveUsers } from './kv-storage.js';
const users = await getUsers();
await saveUsers(users);
```

### **Step 4: Migration Script (Automated)**

```javascript
// migration.js - Run ONCE to copy data from JSON → KV
import { initializeKVStorage, getUsers, saveUsers } from './kv-storage.js';

async function migrateData() {
  console.log('🔄 Starting migration to Vercel KV...');
  
  try {
    // Initialize KV storage
    await initializeKVStorage();
    
    // Copy existing JSON data to KV (if any)
    const users = readJSON('data/users.json'); // old JSON
    if (users?.users?.length > 0) {
      await saveUsers(users);
      console.log(`✅ Migrated ${users.users.length} users`);
    }
    
    const transactions = readJSON('data/transactions.json');
    if (transactions?.transactions?.length > 0) {
      await saveTransactions(transactions);
      console.log(`✅ Migrated ${transactions.transactions.length} transactions`);
    }
    
    // ... repeat for other data types
    
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateData();
```

---

## 🔄 How to Update server.js

### **Pattern 1: User Data**

```javascript
// OLD ❌
const users = readJSON(usersFile) || { users: [] };
// ... do stuff ...
writeJSON(usersFile, users);

// NEW ✅
import { getUsers, saveUsers } from './kv-storage.js';

const users = await getUsers();
// ... do stuff ...
await saveUsers(users);
```

### **Pattern 2: Endpoint Example**

```javascript
// OLD ❌
app.post('/api/auth/anonymous-register', (req, res) => {
  const users = readJSON(usersFile) || { users: [] };
  users.users.push(user);
  writeJSON(usersFile, users);
  res.json({ ok: true });
});

// NEW ✅
app.post('/api/auth/anonymous-register', async (req, res) => {
  try {
    const users = await getUsers();
    users.users.push(user);
    await saveUsers(users);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📊 Changes Needed in server.js

| Endpoint | Status | Action |
|---|---|---|
| `/api/auth/anonymous-register` | ❌ Need async | Add `await` |
| `/api/auth/anonymous-login` | ❌ Need async | Add `await` |
| `/api/auth/me` | ❌ Need async | Add `await` |
| `/api/transactions` (POST) | ❌ Need async | Add `await` |
| `/api/transactions` (GET) | ❌ Need async | Add `await` |
| `/api/transactions/:id` (DELETE) | ❌ Need async | Add `await` |
| `/api/2fa/save` | ❌ Need async | Add `await` |
| All others | ✅ Optional | Gradual migration |

---

## ⚡ Full Implementation Example

```javascript
import { getUsers, saveUsers, getSessions, saveSessions } from './kv-storage.js';

// Initialize on startup
await initializeKVStorage();

// Example: Anonymous Register
app.post('/api/auth/anonymous-register', async (req, res) => {
  try {
    const { name, seedPhrase, hash, anonymous } = req.body || {};
    if (!seedPhrase || !hash || !anonymous) {
      return res.status(400).json({ error: 'missing fields' });
    }

    // Read from KV
    const users = await getUsers();
    
    // Check duplicate
    if (users.users.some(u => u.seedPhraseHash === hash)) {
      return res.status(409).json({ error: 'already registered' });
    }

    // Create user
    const user = { 
      id: nanoid(10), 
      name: String(name || ''),
      seedPhraseHash: hash,
      role: 'user', 
      anonymous: true,
      createdAt: new Date().toISOString() 
    };

    // Save to KV
    users.users.push(user);
    await saveUsers(users);

    // Session
    const sessions = await getSessions();
    const sessionId = nanoid(32);
    sessions.sessions.push({ 
      id: sessionId, 
      userId: user.id, 
      createdAt: new Date().toISOString() 
    });
    await saveSessions(sessions);

    setSessionCookie(res, sessionId);
    res.status(201).json({ ok: true, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'server error' });
  }
});
```

---

## 🚀 Deployment Steps

1. **Update server.js** with KV functions (step by step)
2. **Test locally** (KV will use mock storage)
3. **Commit changes**:
   ```bash
   git add .
   git commit -m "Migrate: JSON files to Vercel KV"
   git push origin main
   ```
4. **Vercel auto-deploys** ✅
5. **Check Vercel dashboard** for KV data

---

## ✅ Verification Checklist

- [ ] Vercel KV created and linked
- [ ] Environment variables loaded
- [ ] `kv-storage.js` file created
- [ ] Import statements updated in `server.js`
- [ ] All endpoints converted to `async/await`
- [ ] All `readJSON` → `await getXxx()`
- [ ] All `writeJSON` → `await saveXxx()`
- [ ] Add `try/catch` error handling
- [ ] Local testing passes
- [ ] Pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Test login/register on live site ✅

---

## 🆘 Troubleshooting

### **Error: "KV_URL is undefined"**
- Solution: Environment variables not set on Vercel
- Fix: Go to Settings → Environment Variables → Check `KV_*` vars

### **Error: "Cannot read from KV"**
- Solution: KV database not initialized
- Fix: Run initialization script first

### **Data Lost After Migration**
- Solution: Didn't run migration script
- Fix: Export JSON data, import to KV manually

### **Sessions Not Persisting**
- Solution: Using old JSON file code
- Fix: Convert to `await getSessions()` + `await saveSessions()`

---

## 📈 Benefits

| Benefit | Before | After |
|---|---|---|
| **Persistence** | ❌ Lost on restart | ✅ Permanent |
| **Scalability** | Limited | Unlimited |
| **Speed** | Slow file I/O | Fast in-memory |
| **Reliability** | ❌ Data loss risk | ✅ Enterprise grade |
| **Cost** | Free* | Free* (with limits) |

---

## 💬 Need Help?

If you get stuck:
1. Check Vercel KV docs: https://vercel.com/docs/storage/vercel-kv
2. Check logs on Vercel dashboard
3. Test with simple KV operations first

**You can do this! 💪**

