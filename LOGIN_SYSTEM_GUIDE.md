# 📱 RENEKANKHA Login & Registration System Guide

## 🎯 Overview
ระบบ login และ register แบบ anonymous ใช้ Seed Phrase ที่มีการตรวจสอบความปลอดภัยด้วย PBKDF2

## 📋 Table of Contents
1. [User Registration](#user-registration)
2. [User Login](#user-login)
3. [Seed Phrase Management](#seed-phrase-management)
4. [Troubleshooting](#troubleshooting)
5. [Security](#security)

---

## 👥 User Registration

### Step 1: Go to Register Page
```
https://yoursite.com/register.html
```

### Step 2: Read Warning
ข้อความเตือนสำคัญ:
- 📌 **บันทึก Seed Phrase** ไว้ในที่ปลอดภัย
- 📌 **ไม่สามารถกู้คืน** หากสูญหาย
- 📌 **อย่าแชร์** กับผู้อื่น

### Step 3: Copy Your Seed Phrase
1. Seed Phrase 12 คำจะถูกสร้างโดยอัตโนมัติ
2. ✓ คลิก "คัดลอก Seed Phrase" เพื่อคัดลอกไปที่ clipboard
3. ✓ หรือคลิก "Export TXT" เพื่อดาวน์โหลดไฟล์

### Step 4: Confirm Seed Phrase
1. วาง Seed Phrase ลงในกล่อง "ยืนยัน Seed Phrase"
2. ✓ หรือกรอกใหม่เพื่อยืนยัน

### Step 5: Register
1. (ไม่บังคับ) ใส่ชื่อบัญชี
2. คลิก "สร้างบัญชีใหม่"
3. ✅ บัญชีถูกสร้างสำเร็จ!

### Result
```
✅ User ID: กำหนดโดยระบบ
✅ Seed Phrase: 12 คำที่คุณเลือก
✅ Verification: ✓ Enabled (PBKDF2)
✅ Session: 7 วัน
```

---

## 🔐 User Login

### Step 1: Go to Login Page
```
https://yoursite.com/login.html
```

### Step 2: Enter Seed Phrase
1. กรอก Seed Phrase ที่ได้จากการสมัครสมาชิก
2. ✓ ต้องเป็น 12 คำพอดี
3. ✓ แต่ละคำคั่นด้วยช่องว่าง

### Step 3: Click Login
- คลิก "เข้าสู่ระบบ"
- ระบบจะ:
  1. ตรวจสอบ format (12 คำ)
  2. สร้าง SHA-256 hash
  3. ส่งไปยัง server
  4. Server ตรวจสอบ PBKDF2 verification
  5. สร้าง session

### Step 4: Success
```
✅ Session ID: [generated]
✅ Cookie: HttpOnly, Secure, SameSite=Lax
✅ Expires: 7 days from login
✅ Redirected to: index.html
```

---

## 💾 Seed Phrase Management

### What is Seed Phrase?
- **12 random English words** เลือกมาจาก BIP39 word list
- **ไม่มี password** - ใช้ seed phrase แทน
- **ทำให้เป็น hash** ด้านหน้า (SHA-256)
- **ตรวจสอบด้านหลัง** ด้วย PBKDF2 + salt

### Generate New Seed Phrase
1. ไปที่ register.html
2. คลิก "สร้าง Seed Phrase ใหม่"
3. ✓ Seed Phrase ใหม่ถูกสร้าง
4. ✓ กล่องยืนยันถูกล้าง

### Backup Seed Phrase
```bash
3 วิธีการ backup:

1. 📝 Write Down
   - เขียนลงกระดาษ
   - เก็บไว้ในที่ปลอดภัย

2. 📄 Export to File
   - คลิก "Export TXT"
   - ดาวน์โหลด seed-phrase.txt
   - เก็บไว้ในที่ปลอดภัย

3. 📸 Screenshot
   - ⚠️ ไม่แนะนำ (เสี่ยงต่อ malware)
   - ⚠️ ถ้าใช้ต้องเข้ารหัส
```

### Import Seed Phrase
- ⚠️ **ไม่มี import function**
- ✓ ต้องกรอกด้วยมือทุกครั้ง
- ✓ ป้องกัน clipboard history attacks

---

## ⚠️ Troubleshooting

### Error: "Seed Phrase ต้องมี 12 คำ"

**สาเหตุ:**
- Seed phrase ไม่ครบ 12 คำ
- มี space หรือ special characters ที่ไม่ควร

**วิธีแก้:**
```
❌ Wrong: "abandon ability able"        (3 คำ)
❌ Wrong: "abandon  ability able ..." (double space)
✅ Correct: "abandon ability able ... zebra zoom zero" (12 คำ)
```

### Error: "Invalid Seed Phrase"

**สาเหตุ:**
1. ✗ Seed phrase มี typo
2. ✗ Seed phrase ไม่ตรงกับที่ลงทะเบียน
3. ✗ บัญชีเป็น legacy account (เก่า)

**วิธีแก้:**
```
1. ✓ ตรวจสอบสะกดของแต่ละคำ
2. ✓ ลองคัดลอกจากที่เก็บไว้ใหม่
3. ✓ ถ้าบัญชีเก่า ต้องสร้างบัญชีใหม่
```

### Error: "บัญชีของคุณเป็นบัญชีเก่า"

**สาเหตุ:**
- นี่คือ legacy account (ลงทะเบียนก่อน verification system)
- ไม่มี salt/hash verification ที่ปลอดภัย

**วิธีแก้:**
```
1. ✓ คลิก "ต้องการสร้างบัญชีใหม่ใช่หรือไม่?"
2. ✓ ไปที่ register.html
3. ✓ สร้าง Seed Phrase ใหม่
4. ✓ สมัครสมาชิกใหม่
5. ✓ ใช้บัญชีใหม่ในการเข้าสู่ระบบ
```

### Error: "Cannot Read Seed Phrase"

**สาเหตุ:**
- Browser ไม่รองรับ Web Crypto API
- ใช้ HTTP แทน HTTPS (บน production)

**วิธีแก้:**
```
1. ✓ ลองใช้ browser อื่น (Chrome, Firefox, Safari)
2. ✓ ตรวจสอบว่าใช้ HTTPS
3. ✓ อัปเดต browser ให้เป็นเวอร์ชั่นล่าสุด
```

### Session Expired

**สาเหตุ:**
- Session มี expiry time 7 วัน
- Cookie หมดอายุ

**วิธีแก้:**
```
1. ✓ ไปที่ login.html
2. ✓ เข้าสู่ระบบใหม่
3. ✓ ได้ session ใหม่ที่ expiry 7 วันต่อจากปัจจุบัน
```

---

## 🔒 Security

### Verification Flow
```
Frontend                          Backend
  |                                |
  ├─ Generate SHA-256 hash  ──────>
  |  of seed phrase                |
  |                                |
  ├─ Send to server        ──────>
  |  (seedPhrase, hash)            |
  |                                ├─ Find user by seedPhraseHash
  |                                ├─ Verify PBKDF2 signature
  |                                ├─ Check timing-safe equal
  |                                |
  |  <────────────────────────────┤
  |  Set-Cookie (sid)             ├─ Create session
  |                                ├─ Write to file
  |
  └─ Store cookie (HttpOnly)
     Redirect to home
```

### Security Features
✅ **PBKDF2** - 100,000 iterations
✅ **Salt** - 16 random bytes per user
✅ **Timing-safe comparison** - ป้องกัน timing attacks
✅ **HttpOnly cookies** - ป้องกัน XSS
✅ **SameSite=Lax** - ป้องกัน CSRF
✅ **SHA-256** - Frontend hashing

### What's Stored
```
users.json:
{
  "id": "unique_id",
  "name": "user_name",
  "seedPhraseHash": "sha256_hash",      ← ตรวจสอบ identity
  "seedSalt": "base64url_salt",         ← ป้องกัน rainbow tables
  "seedHashVerify": "pbkdf2_hash",      ← ตรวจสอบ possession
  "anonymous": true,
  "createdAt": "ISO_timestamp"
}
```

### NOT Stored
```
❌ Plain seed phrase
❌ Plain password
❌ Private keys
❌ Payment information
```

---

## 🔧 API Reference

### POST /api/auth/anonymous-register
```javascript
Request:
{
  "name": "optional_name",
  "seedPhrase": "word1 word2 ... word12",
  "hash": "sha256_hash",
  "anonymous": true
}

Response (201):
{
  "ok": true,
  "user": {
    "id": "abc123",
    "name": "optional_name",
    "role": "user",
    "anonymous": true
  }
}

Response (400):
{ "error": "invalid seed phrase format" }

Response (409):
{ "error": "seed phrase already registered" }
```

### POST /api/auth/anonymous-login
```javascript
Request:
{
  "seedPhrase": "word1 word2 ... word12",
  "hash": "sha256_hash",
  "anonymous": true
}

Response (200):
{
  "ok": true,
  "user": {
    "id": "abc123",
    "name": "optional_name",
    "role": "user",
    "anonymous": true
  }
}

Response (401):
{ "error": "invalid seed phrase" }

Response (401) - Legacy:
{
  "error": "legacy_account",
  "message": "บัญชีของคุณเป็นบัญชีเก่า...",
  "requiresReregister": true
}
```

### GET /api/auth/me
```javascript
Response (200):
{
  "ok": true,
  "user": {
    "id": "abc123",
    "name": "optional_name",
    "role": "user",
    "anonymous": true
  }
}

Response (200) - Not logged in:
{
  "ok": false,
  "user": null
}
```

---

## 📊 Database Structure

### users.json
```json
{
  "users": [
    {
      "id": "HIPyxUXQZ6",
      "name": "Yokminasai",
      "seedPhraseHash": "625c92e4...",
      "seedSalt": "base64url_16_bytes",
      "seedHashVerify": "pbkdf2_hash",
      "role": "user",
      "anonymous": true,
      "createdAt": "2025-10-17T09:17:55.120Z"
    }
  ],
  "updatedAt": "2025-10-17T13:19:45.726Z"
}
```

### sessions.json
```json
{
  "sessions": [
    {
      "id": "session_id_32_bytes",
      "userId": "HIPyxUXQZ6",
      "createdAt": "2025-10-17T13:19:45.726Z",
      "expiresAt": "2025-10-24T13:19:45.726Z"
    }
  ],
  "updatedAt": "2025-10-17T13:19:45.726Z"
}
```

---

## 🚀 Quick Start

### For New Users
```bash
1. Go to https://yoursite.com/register.html
2. Seed Phrase จะถูกสร้างอัตโนมัติ
3. คัดลอก/บันทึก Seed Phrase
4. ยืนยัน Seed Phrase
5. สร้างบัญชี ✓
```

### For Existing Users
```bash
1. Go to https://yoursite.com/login.html
2. ใส่ Seed Phrase ที่บันทึกไว้
3. เข้าสู่ระบบ ✓
```

### For Support
```bash
1. ตรวจสอบ Seed Phrase format
2. ตรวจสอบว่า browser รองรับ Web Crypto API
3. ลองใช้ browser อื่น
4. ติดต่อ support พร้อมข้อมูล error
```

---

**Last Updated**: October 19, 2025
**Version**: 2.0 - Stable Release
**Status**: ✅ Ready for Production
