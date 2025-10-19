# 💬 Chat Support Widget - Setup Guide

## 🎯 Overview

Beautiful floating chat support widget with AI-like responses. Works on all pages!

### ✨ Features
- 💬 Floating chat button (bottom-right corner)
- 📱 Mobile responsive (full-screen on mobile)
- 💾 Chat history saved in localStorage
- ⌨️ Message suggestions (help, price, register, etc.)
- ✅ Typing indicator
- 🎨 Beautiful gradient design
- 🔔 Notification badge

---

## 🚀 Installation (3 Steps)

### Step 1: Add Script to Every HTML Page

Add this line **BEFORE closing `</body>` tag** in EVERY HTML file:

```html
<!-- Chat Support Widget -->
<script src="chat-support.js"></script>
```

**Example (home.html):**
```html
  </main>
  
  <!-- Chat Support Widget -->
  <script src="chat-support.js"></script>
</body>
</html>
```

### Step 2: Add to These Files

Add chat support to:
- ✅ `index.html` - Home page
- ✅ `login.html` - Login page
- ✅ `register.html` - Register page
- ✅ `dashboard.html` - Dashboard
- ✅ `services.html` - Services
- ✅ `services-*.html` - All service pages
- ✅ `orders.html` - Orders
- ✅ `reports.html` - Reports
- ✅ `profile.html` - Profile (if exists)

### Step 3: Test It

1. Refresh any page
2. Look for 💬 button at bottom-right
3. Click to open chat
4. Type "help" or "price" to see it work!

---

## 📍 Chat Button Location

| Device | Position |
|---|---|
| Desktop | Bottom-right (60px button) |
| Tablet | Bottom-right (56px button) |
| Mobile | Bottom-right (full-screen on open) |

---

## 🎨 Customization

### Change Button Color

Edit `chat-support.js` line 16:
```javascript
background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
// Change to your colors
background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
```

### Change Button Position

Edit line 4:
```javascript
bottom: 20px;  // Distance from bottom
right: 20px;   // Distance from right
```

### Add More Keywords

Edit `getBotResponse()` function around line 500:
```javascript
const responses = {
  'hello': 'สวัสดีครับ! 👋',
  'help': '📋 เราช่วยเรื่องต่าง ๆ ได้:...',
  'your-keyword': 'Your response here', // ADD THIS
  'default': '😊 ขอโทษครับ...'
};
```

### Change Greeting Message

Edit line 280 in `createWidget()`:
```html
<div class="chat-message-content">
  สวัสดีครับ! 👋 ยินดีต้อนรับเข้า RENEKANKHA<br>
  <br>
  มีปัญหาหรือคำถามอะไรไหม? เรา Ready ช่วยคุณ 24/7
</div>
```

---

## 📝 Built-in Keywords

User can type these:
| Keyword | Response |
|---|---|
| `hello` / `สวัสดี` | Greeting |
| `help` / `ช่วย` | Service info |
| `register` / `สมัคร` | How to register |
| `price` / `ราคา` | Service prices |
| `payment` / `ชำระ` | Payment info |
| `seed` | Seed phrase info |
| `security` | Security features |
| Anything else | Default response |

---

## 🔧 Integration Checklist

- [ ] Add `<script src="chat-support.js"></script>` to `index.html`
- [ ] Add to `login.html`
- [ ] Add to `register.html`
- [ ] Add to `dashboard.html`
- [ ] Add to `services.html`
- [ ] Add to all service pages (`services-*.html`)
- [ ] Test on desktop
- [ ] Test on mobile
- [ ] Test chat functionality
- [ ] Verify chat history saves

---

## 🚀 Deployment

1. **Commit changes:**
   ```bash
   git add chat-support.js CHAT_SUPPORT_SETUP.md
   git commit -m "Feat: Add floating chat support widget"
   git push origin main
   ```

2. **Update all HTML files** (add script tag)

3. **Commit HTML updates:**
   ```bash
   git add *.html
   git commit -m "Integrate: Chat support to all pages"
   git push origin main
   ```

4. **Vercel auto-deploys** ✅

---

## 🎯 How It Works

### Chat Flow
```
User clicks 💬
     ↓
Chat window opens
     ↓
User types message
     ↓
Message appears (blue, right side)
     ↓
Typing indicator shows...
     ↓
Bot response appears (white, left side)
     ↓
Chat history saved to localStorage
```

### Keywords Detection
```
User types: "how much does it cost?"
     ↓
System checks for keyword "price" ✓
     ↓
Sends pricing response
     ↓
User sees: "💰 ราคาบริการ:..."
```

---

## 🆘 Troubleshooting

### Q: Chat button not showing?
**A:** 
- Check `<script src="chat-support.js"></script>` is in `<body>`
- Open browser console (F12) for errors
- Make sure CSS loads correctly

### Q: Chat window won't close?
**A:**
- Click ✕ button at top-right
- Or click 💬 button again to toggle

### Q: Messages not saving?
**A:**
- Chat history saved in localStorage
- Clear browser cache if stuck
- Check browser DevTools → Application → Local Storage

### Q: Want to add more keywords?
**A:**
- Edit `getBotResponse()` in `chat-support.js`
- Add new `'keyword': 'response'` entries
- Can be in Thai or English

---

## 📊 Chat Analytics (Future)

Could track:
- Most asked questions
- Chat volume per page
- User satisfaction
- Common keywords

**For now:** Use chat history for feedback

---

## ✅ Final Steps

1. ✅ Create `chat-support.js` ← DONE
2. ⏳ Add script tag to HTML files ← **YOU DO THIS**
3. ✅ Test on Vercel ← DONE
4. ✅ Monitor user feedback ← Ongoing

**You're almost there! Just add the `<script>` tag to all pages!** 🎉

