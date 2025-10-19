# Login & Database Stability Fix Guide

## 📋 Summary
ปัญหาเดิมและการแก้ไขที่เสถียรสำหรับระบบ login และ database

## 🔴 ปัญหาที่พบ

### 1. Seed Phrase Verification ไม่ทำงาน
- **เหตุการณ์**: ผู้ใช้ที่ลงทะเบียนแล้ว สามารถเข้าสู่ระบบได้ แต่วันต่อมากลับขึ้นว่า "invalid seed phrase"
- **สาเหตุ**:
  - ผู้ใช้เก่าไม่มี `seedSalt` และ `seedHashVerify` ในฐานข้อมูล
  - มี 2 endpoints `/api/auth/anonymous-login` ที่ซ้ำกัน
  - Endpoint ที่ 2 ไม่มีการตรวจสอบ seed phrase ที่เหมาะสม

### 2. Legacy User Data
- ผู้ใช้ 6 คนลงทะเบียนแต่ไม่มีการตรวจสอบ salt/hash ที่เหมาะสม
- ไม่สามารถเข้าสู่ระบบได้เพราะไม่มีข้อมูลตรวจสอบ

## ✅ การแก้ไข

### 1. Server-side Fixes (server.js)

#### ✓ Removed Duplicate Endpoint
- ลบ endpoint `/api/auth/anonymous-login` ที่ซ้ำกัน (บรรทัด 257)
- เหลือเพียง endpoint เดียว (บรรทัด 217) ที่มี verification ถูกต้อง

#### ✓ Enhanced Login Verification
```javascript
// 1. ตรวจสอบ legacy users
if (user.legacy) {
  return res.status(401).json({ 
    error: 'legacy_account',
    message: 'บัญชีของคุณเป็นบัญชีเก่า...',
    requiresReregister: true
  });
}

// 2. ตรวจสอบ seed phrase ด้วย PBKDF2
if (user.seedSalt && user.seedHashVerify) {
  const verifyHash = crypto.pbkdf2Sync(
    seedPhrase, 
    user.seedSalt, 
    100000, 
    32, 
    'sha256'
  ).toString('base64url');
  
  // Timing-safe comparison
  if (!crypto.timingSafeEqual(
    Buffer.from(verifyHash), 
    Buffer.from(user.seedHashVerify)
  )) {
    return res.status(401).json({ error: 'invalid seed phrase' });
  }
}
```

### 2. Database Migration (fix-seed-phrase.js)

#### ✓ Migrated Legacy Users
```javascript
usersData.users = usersData.users.map(user => {
  if (!user.seedSalt || !user.seedHashVerify) {
    user.legacy = true;
    user.seedSalt = 'LEGACY_NO_SALT';
    user.seedHashVerify = 'LEGACY_NO_VERIFY';
  }
  return user;
});
```

ผลลัพธ์:
- ผู้ใช้ 6 คนทั้งหมดถูกทำเครื่องหมาย `legacy: true`
- ไฟล์ `data/users.json` ได้อัปเดตแล้ว

### 3. Frontend Fixes (login.html)

#### ✓ Legacy Account Handling
```javascript
if (error.error === 'legacy_account') {
  setStatus('บัญชีของคุณเป็นบัญชีเก่า กรุณาลงทะเบียนบัญชีใหม่', 'error');
  
  setTimeout(() => {
    if (confirm('ต้องการสร้างบัญชีใหม่ใช่หรือไม่?')) {
      location.href = 'register.html';
    }
  }, 1000);
}
```

## 📊 Status

### Database State (Updated)
```
✅ 6 legacy users migrated and marked
✅ Removed duplicate endpoints
✅ Enhanced verification logic
✅ Added error handling for legacy accounts
```

### Files Modified
1. **server.js** - Enhanced login verification
2. **fix-seed-phrase.js** - Migration script (already run)
3. **login.html** - Legacy account handling
4. **data/users.json** - Updated with legacy flags

### Files Created
- **validate-db.js** - Database integrity validator

## 🚀 How to Use

### 1. Validate Database
```bash
node validate-db.js
```
ตรวจสอบความสมบูรณ์ของฐานข้อมูล

### 2. New User Registration
1. ไป https://yoursite.com/register.html
2. Seed Phrase จะถูกสร้างโดยอัตโนมัติ
3. ยืนยัน Seed Phrase และ register
4. ได้ user ใหม่พร้อม salt/hash verification

### 3. Legacy User Login
1. พยายามเข้าสู่ระบบด้วย Seed Phrase เก่า
2. ได้ข้อความ "บัญชีเป็นบัญชีเก่า"
3. คลิก "ต้องการสร้างบัญชีใหม่ใช่หรือไม่?"
4. ไปหน้า register.html
5. สร้าง Seed Phrase ใหม่ → ได้ user ใหม่

### 4. New User Login
1. เข้า https://yoursite.com/login.html
2. ใส่ Seed Phrase ที่ได้จากการ register
3. เข้าสู่ระบบสำเร็จ (verification ผ่าน)

## 🔐 Security Notes

### Seed Phrase Verification
- ใช้ PBKDF2 ด้วย 100,000 iterations
- Random salt 16 bytes ต่อ user
- Timing-safe comparison (ป้องกัน timing attacks)

### Session Management
- 7-day expiry per session
- HttpOnly cookies
- SameSite=Lax protection

## 📈 Stability Improvements

✅ Removed race conditions (duplicate endpoints)
✅ Proper error handling for legacy users
✅ Salt-based verification for new users
✅ Clear user guidance for migration
✅ Database validation tools

## ⚠️ Important Notes

### Legacy Users
- ✓ Cannot login with old seed phrase
- ✓ Must re-register to get new account
- ✓ Old data is separate from new accounts
- ✓ This is by design (for security)

### Future Improvements
1. Auto-cleanup expired sessions
2. Database backup mechanism
3. User data export before re-registration
4. Batch migration tools

## 🐛 Troubleshooting

### "Invalid Seed Phrase" Error
1. ✓ Verify seed phrase has exactly 12 words
2. ✓ Check for typos
3. ✓ If old account → must re-register

### Legacy Account Message
1. ✓ This is a legacy account from before the fix
2. ✓ Must create a new account with new seed phrase
3. ✓ Go to register.html and follow the flow

### Database Issues
```bash
# Check integrity
node validate-db.js

# See detailed output
node validate-db.js 2>&1 | less
```

---

**Last Updated**: October 19, 2025
**Status**: ✅ Stable & Ready
