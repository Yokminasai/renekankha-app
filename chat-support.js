// Professional Chat Support Widget - Perfect Size & UX
// Add this to all HTML pages via <script src="chat-support.js"></script>

class ChatSupport {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.isMobile = window.innerWidth <= 768;
    this.init();
  }

  init() {
    this.createStyles();
    this.createWidget();
    this.attachEventListeners();
    this.loadMessages();
    this.detectDevice();
  }

  detectDevice() {
    this.isMobile = window.innerWidth <= 768;
    this.adjustForDevice();
  }

  adjustForDevice() {
    const btn = document.getElementById('chatBtn');
    const window = document.getElementById('chatWindow');
    
    if (!btn || !window) return;

    if (this.isMobile) {
      // Mobile adjustments - Center positioned
      btn.style.width = '50px';
      btn.style.height = '50px';
      btn.style.fontSize = '20px';
      btn.style.bottom = '15px';
      btn.style.left = '50%';
      btn.style.transform = 'translateX(-50%)';
      btn.style.right = 'auto';
      
      window.style.width = 'calc(100vw - 30px)';
      window.style.height = 'calc(100vh - 120px)';
      window.style.bottom = '70px';
      window.style.left = '50%';
      window.style.transform = 'translateX(-50%)';
      window.style.right = 'auto';
      window.style.borderRadius = '12px';
    } else {
      // Desktop adjustments - Right positioned
      btn.style.width = '55px';
      btn.style.height = '55px';
      btn.style.fontSize = '22px';
      btn.style.bottom = '20px';
      btn.style.right = '20px';
      btn.style.left = 'auto';
      btn.style.transform = 'none';
      
      window.style.width = '320px';
      window.style.height = '500px';
      window.style.bottom = '80px';
      window.style.right = '20px';
      window.style.left = 'auto';
      window.style.transform = 'none';
      window.style.borderRadius = '16px';
    }
  }

  createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Professional Chat Support Widget */
      
      /* Chat Support Container */
      .chat-support-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        pointer-events: none;
      }

      .chat-support-container * {
        pointer-events: auto;
      }

      /* Floating Button - Perfect Size */
      .chat-support-btn {
        width: 55px;
        height: 55px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        transition: all 0.3s ease;
        color: white;
        position: relative;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      .chat-support-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
      }

      .chat-support-btn:active {
        transform: scale(0.95);
      }

      /* Notification Badge */
      .chat-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 18px;
        height: 18px;
        background: #ff4757;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
        animation: pulse 2s infinite;
        border: 2px solid white;
      }

      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.8;
        }
      }

      /* Chat Window - Perfect Size */
      .chat-window {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 320px;
        height: 500px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: none;
        flex-direction: column;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s ease;
        overflow: hidden;
        border: 1px solid rgba(0, 0, 0, 0.08);
      }

      .chat-window.active {
        display: flex;
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      /* Chat Header */
      .chat-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 16px 16px 0 0;
      }

      .chat-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .chat-close {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: all 0.2s ease;
      }

      .chat-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      /* Chat Messages */
      .chat-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
        scroll-behavior: smooth;
      }

      .chat-message {
        display: flex;
        margin-bottom: 8px;
      }

      .chat-message.user {
        justify-content: flex-end;
      }

      .chat-message.bot {
        justify-content: flex-start;
      }

      .chat-message-content {
        max-width: 75%;
        padding: 10px 14px;
        border-radius: 16px;
        font-size: 13px;
        line-height: 1.4;
        word-wrap: break-word;
        position: relative;
      }

      .chat-message.user .chat-message-content {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-bottom-right-radius: 4px;
      }

      .chat-message.bot .chat-message-content {
        background: #f8f9fa;
        color: #333;
        border-bottom-left-radius: 4px;
        border: 1px solid #e9ecef;
      }

      .chat-message-time {
        font-size: 10px;
        opacity: 0.7;
        margin-top: 4px;
        text-align: right;
      }

      .chat-message.bot .chat-message-time {
        text-align: left;
      }

      /* Chat Input Area */
      .chat-input-area {
        padding: 12px 16px;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .chat-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #e9ecef;
        border-radius: 20px;
        font-size: 13px;
        outline: none;
        transition: all 0.2s ease;
        background: white;
      }

      .chat-input:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
      }

      .chat-send-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .chat-send-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      }

      .chat-send-btn:active {
        transform: scale(0.95);
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .chat-support-container {
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          right: auto;
        }

        .chat-window {
          width: calc(100vw - 30px);
          height: calc(100vh - 120px);
          bottom: 70px;
          left: 50%;
          transform: translateX(-50%);
          right: auto;
          border-radius: 12px;
          max-height: 85vh;
        }

        .chat-support-btn {
          width: 50px;
          height: 50px;
          font-size: 20px;
        }


        .chat-message-content {
          max-width: 85%;
          font-size: 12px;
          padding: 8px 12px;
        }

        .chat-input {
          font-size: 16px;
          padding: 8px 12px;
        }

        .chat-send-btn {
          width: 32px;
          height: 32px;
          font-size: 12px;
        }

        .chat-header {
          padding: 12px 16px;
        }

        .chat-header h3 {
          font-size: 14px;
        }

        .chat-close {
          width: 24px;
          height: 24px;
          font-size: 14px;
        }

        .chat-messages {
          padding: 12px;
        }

        .chat-input-area {
          padding: 10px 12px;
        }
      }

      /* Small Mobile */
      @media (max-width: 480px) {
        .chat-support-container {
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          right: auto;
        }

        .chat-window {
          width: calc(100vw - 20px);
          height: calc(100vh - 100px);
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          right: auto;
          border-radius: 8px;
        }

        .chat-support-btn {
          width: 45px;
          height: 45px;
          font-size: 18px;
        }

        .chat-message-content {
          font-size: 11px;
          padding: 6px 10px;
        }

        .chat-input {
          font-size: 15px;
          padding: 6px 10px;
        }

        .chat-send-btn {
          width: 28px;
          height: 28px;
          font-size: 10px;
        }
      }

      /* Touch Optimizations */
      @media (max-width: 768px) {
        .chat-input {
          -webkit-appearance: none;
          border-radius: 20px;
        }

        .chat-send-btn,
        .chat-support-btn {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .chat-messages {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        .chat-window.active {
          animation: slideUpMobile 0.3s ease;
        }

        /* Center positioning for mobile */
        .chat-window {
          left: 50% !important;
          transform: translateX(-50%) !important;
          right: auto !important;
        }

        @keyframes slideUpMobile {
          from {
            transform: translateX(-50%) translateY(100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0) scale(1);
            opacity: 1;
          }
        }
      }

      /* Scrollbar Styling */
      .chat-messages::-webkit-scrollbar {
        width: 4px;
      }

      .chat-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .chat-messages::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 2px;
      }

      .chat-messages::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }

      /* Typing Indicator */
      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 3px;
        padding: 8px 12px;
        background: #f8f9fa;
        border-radius: 16px;
        border-bottom-left-radius: 4px;
        max-width: 60px;
        border: 1px solid #e9ecef;
      }

      .typing-dot {
        width: 6px;
        height: 6px;
        background: #94a3b8;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
      }

      .typing-dot:nth-child(1) { animation-delay: -0.32s; }
      .typing-dot:nth-child(2) { animation-delay: -0.16s; }

      @keyframes typing {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }

      /* Loading Animation */
      .chat-loading {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  createWidget() {
    const container = document.createElement('div');
    container.className = 'chat-support-container';
    container.innerHTML = `
      <!-- Floating Button -->
      <button class="chat-support-btn" id="chatBtn">
        💬
        <div class="chat-badge" id="chatBadge" style="display: none;">1</div>
      </button>

      <!-- Chat Window -->
      <div class="chat-window" id="chatWindow">
        <!-- Header -->
        <div class="chat-header">
          <h3>💬 RENEKANKHA Support</h3>
          <button class="chat-close" id="chatCloseBtn">×</button>
        </div>

        <!-- Messages -->
        <div class="chat-messages" id="chatMessages">
          <div class="chat-message bot">
            <div class="chat-message-content">
              สวัสดีครับ! 👋 ยินดีต้อนรับเข้า RENEKANKHA<br><br>
              มีปัญหาหรือคำถามอะไรไหม? เรา Ready ช่วยคุณ 24/7
              <div class="chat-message-time">ขณะนี้</div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="chat-input-area">
          <input 
            type="text" 
            class="chat-input" 
            id="chatInput" 
            placeholder="พิมพ์ข้อความ..."
            autocomplete="off"
          >
          <button class="chat-send-btn" id="chatSendBtn">➤</button>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  attachEventListeners() {
    const chatBtn = document.getElementById('chatBtn');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatInput = document.getElementById('chatInput');
    const chatWindow = document.getElementById('chatWindow');

    // Open/Close Chat
    chatBtn.addEventListener('click', () => this.toggleChat());
    chatCloseBtn.addEventListener('click', () => this.closeChat());

    // Send Message
    chatSendBtn.addEventListener('click', () => this.sendMessage());
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Touch events for mobile
    chatBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      chatBtn.style.transform = 'scale(0.95)';
    });

    chatBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      chatBtn.style.transform = 'scale(1)';
      this.toggleChat();
    });

    chatSendBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      chatSendBtn.style.transform = 'scale(0.95)';
    });

    chatSendBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      chatSendBtn.style.transform = 'scale(1)';
      this.sendMessage();
    });

    // Prevent zoom on input focus (iOS)
    chatInput.addEventListener('focus', () => {
      if (this.isMobile) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
        }
      }
    });

    chatInput.addEventListener('blur', () => {
      if (this.isMobile) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.content = 'width=device-width, initial-scale=1';
        }
      }
    });

    // Close chat when clicking outside (desktop only)
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.isMobile) {
        const chatContainer = document.querySelector('.chat-support-container');
        if (!chatContainer.contains(e.target)) {
          this.closeChat();
        }
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.detectDevice();
      if (this.isOpen) {
        this.adjustForDevice();
      }
    });

    // Auto-scroll to bottom
    const observer = new MutationObserver(() => {
      const messagesContainer = document.getElementById('chatMessages');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
    observer.observe(document.getElementById('chatMessages'), { childList: true });
  }

  toggleChat() {
    this.isOpen ? this.closeChat() : this.openChat();
  }

  openChat() {
    this.isOpen = true;
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.add('active');
    document.getElementById('chatBadge').style.display = 'none';
    
    // Focus input after animation
    setTimeout(() => {
    document.getElementById('chatInput').focus();
    }, 300);
  }

  closeChat() {
    this.isOpen = false;
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.remove('active');
  }

  sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message) return;

    // Add user message
    this.addMessage(message, 'user');
    chatInput.value = '';

    // Show typing indicator
    this.showTypingIndicator();

    // Simulate bot response
    setTimeout(() => {
      this.hideTypingIndicator();
      this.addBotResponse(message);
    }, 1000 + Math.random() * 2000);
  }

  addMessage(content, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    messageDiv.innerHTML = `
      <div class="chat-message-content">
        ${content}
        <div class="chat-message-time">${timeString}</div>
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
      </div>
    `;

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  addBotResponse(userMessage) {
    const response = this.getBotResponse(userMessage);
    this.addMessage(response.text, 'bot');
  }

  getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Navigation responses
    if (lowerMessage.includes('แจ้งแบน') || lowerMessage.includes('blacklist') || lowerMessage.includes('รายงาน')) {
      return {
        text: '🚫 <strong>แจ้งแบนไอดี</strong><br><br>คุณสามารถแจ้งแบนไอดีได้ที่:<br><br>📋 <a href="/reports.html" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 600;">📊 หน้าแจ้งแบนไอดี</a><br><br>💡 <strong>วิธีใช้:</strong><br>1. กรอกข้อมูลไอดีที่ต้องการแจ้งแบน<br>2. เลือกประเภทการละเมิด<br>3. อธิบายรายละเอียดเหตุการณ์<br>4. ส่งรายงาน<br><br>⚡ <strong>ระบบจะตรวจสอบและดำเนินการภายใน 24 ชั่วโมง</strong>',
        isNavigation: true
      };
    }
    
    if (lowerMessage.includes('ตรวจสอบ') || lowerMessage.includes('check') || lowerMessage.includes('เช็ค')) {
      return {
        text: '🔍 <strong>ตรวจสอบไอดี</strong><br><br>คุณสามารถตรวจสอบไอดีได้ที่:<br><br>📋 <a href="/check.html" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 600;">🔍 หน้าตรวจสอบไอดี</a><br><br>💡 <strong>ข้อมูลที่แสดง:</strong><br>• สถานะไอดี (ปกติ/ถูกแบน)<br>• ประเภทการละเมิด<br>• วันที่ถูกแบน<br>• เหตุผลการแบน<br><br>⚡ <strong>ข้อมูลอัปเดตแบบเรียลไทม์</strong>',
        isNavigation: true
      };
    }
    
    if (lowerMessage.includes('บริการ') || lowerMessage.includes('service') || lowerMessage.includes('ฟีเจอร์')) {
      return {
        text: '🛠️ <strong>บริการของเรา</strong><br><br>เรามีบริการครบครัน:<br><br>📋 <a href="/services.html" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 600;">🛠️ หน้าบริการทั้งหมด</a><br><br>💡 <strong>บริการหลัก:</strong><br>• 🔍 ตรวจสอบไอดี<br>• 🚫 แจ้งแบนไอดี<br>• 📊 Dashboard<br>• 🔐 2FA Generator<br>• 📈 Profit Calculator<br><br>⚡ <strong>ใช้งานฟรี 100%</strong>',
        isNavigation: true
      };
    }
    
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('แดชบอร์ด') || lowerMessage.includes('สถิติ')) {
      return {
        text: '📊 <strong>Dashboard</strong><br><br>ดูสถิติและข้อมูลได้ที่:<br><br>📋 <a href="/dashboard.html" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 600;">📊 Dashboard</a><br><br>💡 <strong>ข้อมูลที่แสดง:</strong><br>• สถิติการใช้งาน<br>• จำนวนไอดีที่ถูกแบน<br>• กราฟแสดงแนวโน้ม<br>• รายงานสรุป<br><br>⚡ <strong>ข้อมูลอัปเดตแบบเรียลไทม์</strong>',
        isNavigation: true
      };
    }
    
    if (lowerMessage.includes('2fa') || lowerMessage.includes('otp') || lowerMessage.includes('authenticator')) {
      return {
        text: '🔐 <strong>2FA Generator</strong><br><br>สร้างรหัส 2FA ได้ที่:<br><br>📋 <a href="/authenticator.html" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 600;">🔐 2FA Generator</a><br><br>💡 <strong>วิธีใช้:</strong><br>1. กรอก Secret Key<br>2. ระบบจะสร้างรหัส 6 หลัก<br>3. รหัสจะอัปเดตทุก 30 วินาที<br><br>⚡ <strong>ปลอดภัย 100%</strong>',
        isNavigation: true
      };
    }
    
    if (lowerMessage.includes('คำนวณ') || lowerMessage.includes('profit') || lowerMessage.includes('กำไร')) {
      return {
        text: '📈 <strong>Profit Calculator</strong><br><br>คำนวณกำไรได้ที่:<br><br>📋 <a href="/profit-calculator.html" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 600;">📈 Profit Calculator</a><br><br>💡 <strong>ฟีเจอร์:</strong><br>• คำนวณกำไร/ขาดทุน<br>• บันทึกรายรับ/รายจ่าย<br>• ดูสถิติการเงิน<br>• ส่งออกรายงาน<br><br>⚡ <strong>ใช้งานง่าย สะดวก</strong>',
        isNavigation: true
      };
    }
    
    if (lowerMessage.includes('เข้าสู่ระบบ') || lowerMessage.includes('login') || lowerMessage.includes('ล็อกอิน')) {
      return {
        text: '🔑 <strong>เข้าสู่ระบบ</strong><br><br>เข้าสู่ระบบได้ที่:<br><br>📋 <a href="/login.html" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 600;">🔑 เข้าสู่ระบบ</a><br><br>💡 <strong>วิธีเข้าสู่ระบบ:</strong><br>1. ใช้ Seed Phrase 12 คำ<br>2. ระบบจะตรวจสอบความถูกต้อง<br>3. เข้าสู่ระบบสำเร็จ<br><br>⚡ <strong>ปลอดภัยด้วย PBKDF2</strong>',
        isNavigation: true
      };
    }
    
    if (lowerMessage.includes('สมัคร') || lowerMessage.includes('register') || lowerMessage.includes('สร้างบัญชี')) {
      return {
        text: '📝 <strong>สมัครสมาชิก</strong><br><br>สมัครสมาชิกได้ที่:<br><br>📋 <a href="/register.html" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 600;">📝 สมัครสมาชิก</a><br><br>💡 <strong>วิธีสมัคร:</strong><br>1. กรอกข้อมูลส่วนตัว<br>2. สร้าง Seed Phrase 12 คำ<br>3. ยืนยันการสมัคร<br><br>⚡ <strong>ฟรี 100% ไม่มีค่าใช้จ่าย</strong>',
        isNavigation: true
      };
    }
    
    // General responses
    if (lowerMessage.includes('สวัสดี') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        text: 'สวัสดีครับ! 👋<br><br>ยินดีต้อนรับเข้าสู่ <strong>RENEKANKHA Support</strong><br><br>💡 <strong>เราช่วยคุณได้:</strong><br>• 🚫 แจ้งแบนไอดี<br>• 🔍 ตรวจสอบไอดี<br>• 🛠️ ใช้บริการต่างๆ<br>• 📊 ดู Dashboard<br>• 🔐 สร้าง 2FA<br>• 📈 คำนวณกำไร<br><br>⚡ <strong>พิมพ์คำถามหรือเลือกเมนูด้านล่าง</strong>'
      };
    }
    
    if (lowerMessage.includes('ขอบคุณ') || lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return {
        text: 'ยินดีครับ! 😊<br><br>หากมีคำถามเพิ่มเติม สามารถถามได้ตลอดเวลา<br><br>💡 <strong>หรือเลือกเมนูด้านล่างเพื่อใช้งานบริการ</strong>'
      };
    }
    
    if (lowerMessage.includes('ช่วย') || lowerMessage.includes('help') || lowerMessage.includes('ปัญหา')) {
      return {
        text: 'เราพร้อมช่วยคุณครับ! 🤝<br><br>💡 <strong>เลือกบริการที่ต้องการ:</strong><br><br>🚫 <strong>แจ้งแบนไอดี</strong> - รายงานผู้ใช้ที่ละเมิด<br>🔍 <strong>ตรวจสอบไอดี</strong> - เช็คสถานะไอดี<br>🛠️ <strong>บริการทั้งหมด</strong> - ดูฟีเจอร์ครบ<br>📊 <strong>Dashboard</strong> - ดูสถิติและข้อมูล<br>🔐 <strong>2FA Generator</strong> - สร้างรหัส 2FA<br>📈 <strong>Profit Calculator</strong> - คำนวณกำไร<br><br>⚡ <strong>พิมพ์ชื่อบริการที่ต้องการ</strong>'
      };
    }
    
    // Default response
    return {
      text: 'ขออภัยครับ ไม่เข้าใจคำถามของคุณ 😅<br><br>💡 <strong>ลองถามใหม่หรือเลือกจากเมนู:</strong><br><br>🚫 แจ้งแบนไอดี<br>🔍 ตรวจสอบไอดี<br>🛠️ บริการทั้งหมด<br>📊 Dashboard<br>🔐 2FA Generator<br>📈 Profit Calculator<br><br>⚡ <strong>หรือพิมพ์ "ช่วย" เพื่อดูคำแนะนำ</strong>'
    };
  }

  loadMessages() {
    // Load saved messages from localStorage
    const savedMessages = localStorage.getItem('chatSupportMessages');
    if (savedMessages) {
      try {
        this.messages = JSON.parse(savedMessages);
        this.renderMessages();
      } catch (e) {
        console.warn('Failed to load chat messages:', e);
      }
    }
  }

  renderMessages() {
        const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';

    // Add welcome message
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'chat-message bot';
    welcomeDiv.innerHTML = `
            <div class="chat-message-content">
        สวัสดีครับ! 👋 ยินดีต้อนรับเข้า RENEKANKHA<br><br>
        มีปัญหาหรือคำถามอะไรไหม? เรา Ready ช่วยคุณ 24/7
        <div class="chat-message-time">ขณะนี้</div>
            </div>
          `;
    messagesContainer.appendChild(welcomeDiv);

    // Render saved messages
    this.messages.forEach(msg => {
      this.addMessage(msg.content, msg.sender);
    });
  }

  saveMessages() {
    localStorage.setItem('chatSupportMessages', JSON.stringify(this.messages));
  }
}

// Initialize chat support when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ChatSupport();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ChatSupport();
  });
} else {
  new ChatSupport();
}