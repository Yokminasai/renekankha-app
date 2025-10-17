# เช็ค IP + แผนที่ + แบล็กลิสต์ + เวิร์กโฟลว์เช่า RoV + บริการเสริม

ฟีเจอร์หลัก:
- ตรวจ IP/ISP/ประเทศ/เมือง + แสดงแผนที่ (Leaflet + OSM)
- แบล็กลิสต์/รายงาน + ค้นหา IP
- เวิร์กโฟลว์ปล่อยเช่าไอดี RoV (orders + check link)
- บริการเสริม (Commercial Services): Garena, โต้แย้ง Blacklistseller, Google Removal

## การใช้งาน
- หน้าหลัก: `/index.html`
- รายงาน: `/reports.html`
- คำสั่งเช่า RoV: `/orders.html` (สร้างลิงก์ลูกค้า `/check.html?oid=...`)
- บริการ:
  - Garena: `/services-garena.html`
  - โต้แย้ง Blacklistseller: `/services-blacklist-dispute.html`
  - Google Removal: `/services-google-removal.html`

## Endpoints บริการเสริม
- POST `/api/services/garena` { kind: 'ban'|'unbind'|'unban_refund', gameId, contact, details, evidenceUrls[] }
- GET  `/api/services/garena?limit=200`
- POST `/api/services/blacklist-dispute` { platformUrl, contact, statement, evidenceUrls[] }
- GET  `/api/services/blacklist-dispute?limit=200`
- POST `/api/services/google-removal` { targetUrls[], reason, contact, details }
- GET  `/api/services/google-removal?limit=200`

## แนวทางพาณิชย์ (ย่อ)
- Free tier + Pro (สมัครสมาชิก) + Enterprise (SLA/Private deploy)
- ขายบริการเสริมแบบ per-case (Garena/Blacklist dispute/Google Removal)
- เพิ่มชำระเงิน (Stripe/PromptPay) และ Ticket tracking ในอนาคต

## รัน
```bash
npm install
npm run dev
```
เปิด `http://localhost:<port>/index.html`

## หมายเหตุความเป็นส่วนตัว
- ไม่เข้าถึง MAC/IMEI จากเบราว์เซอร์
- จำกัดการเชื่อมต่อภายนอกด้วย CSP

# การชำระเงิน (Stripe)

- ตั้งค่า ENV `STRIPE_SECRET` เป็น Secret Key ของ Stripe (เช่น sk_live_... หรือ sk_test_...)
- เรียกใช้งาน: ฟอร์มบริการจะสร้าง Ticket แล้วเรียก `/api/pay/checkout` เพื่อสร้าง Checkout Session และ redirect ไป Stripe
- หากไม่ตั้งค่า `STRIPE_SECRET` ระบบจะใช้โหมดจำลอง (mock) และพาไปหน้าสำเร็จทันทีเพื่อทดสอบฟลว์

หมายเหตุ: โปรดตั้งค่า Webhook Stripe ภายหลัง หากต้องการตัดสถานะ Ticket อัตโนมัติหลังชำระเงินสำเร็จ

# ผู้ใช้/การยืนยันตัวตน

- สมัครสมาชิก: POST /api/auth/register { email, password, name? }
- เข้าสู่ระบบ: POST /api/auth/login { email, password } (ตั้งคุกกี้ sid)
- ข้อมูลผู้ใช้ปัจจุบัน: GET /api/auth/me (credentials include)
- ออกจากระบบ: POST /api/auth/logout (ลบ session)

หมายเหตุ: เก็บผู้ใช้และเซสชันในไฟล์ JSON สำหรับการทดสอบ ควรย้ายไปฐานข้อมูลจริงเมื่อขึ้นโปรดักชัน และตั้งค่า `SESSION_SECRET` ในสภาพแวดล้อมจริง
