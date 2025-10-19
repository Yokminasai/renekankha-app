// Floating Chat Support Widget
// Add this to all HTML pages via <script src="chat-support.js"></script>

class ChatSupport {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.init();
  }

  init() {
    this.createStyles();
    this.createWidget();
    this.attachEventListeners();
    this.loadMessages();
  }

  createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Chat Support Widget */
      .chat-support-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      /* Floating Button */
      .chat-support-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        transition: all 0.3s ease;
        color: white;
        position: relative;
      }

      .chat-support-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 32px rgba(99, 102, 241, 0.5);
      }

      .chat-support-btn:active {
        transform: scale(0.95);
      }

      /* Notification Badge */
      .chat-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 24px;
        height: 24px;
        background: #ef4444;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.8;
        }
      }

      /* Chat Window */
      .chat-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        overflow: hidden;
      }

      .chat-window.active {
        display: flex;
        opacity: 1;
        transform: translateY(0);
      }

      /* Chat Header */
      .chat-header {
        background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
        color: white;
        padding: 20px;
        border-radius: 16px 16px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chat-header-title {
        font-weight: 700;
        font-size: 16px;
      }

      .chat-header-subtitle {
        font-size: 12px;
        opacity: 0.9;
        margin-top: 4px;
      }

      .chat-close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: all 0.2s ease;
      }

      .chat-close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      /* Messages Container */
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f8f9fa;
      }

      /* Message Styles */
      .chat-message {
        display: flex;
        gap: 8px;
        animation: slideIn 0.3s ease;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .chat-message.user {
        justify-content: flex-end;
      }

      .chat-message-content {
        background: white;
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 80%;
        word-wrap: break-word;
        font-size: 14px;
        line-height: 1.4;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .chat-message.user .chat-message-content {
        background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
        color: white;
        border-bottom-right-radius: 2px;
      }

      .chat-message.bot .chat-message-content {
        background: white;
        color: #1a1a1a;
        border-bottom-left-radius: 2px;
      }

      .chat-message-time {
        font-size: 11px;
        color: #999;
        margin-top: 4px;
        text-align: right;
      }

      .chat-message.user .chat-message-time {
        text-align: right;
      }

      /* Typing Indicator */
      .typing-indicator {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
      }

      .typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ccc;
        animation: typingAnimation 1.4s infinite;
      }

      .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typingAnimation {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.7;
        }
        30% {
          transform: translateY(-10px);
          opacity: 1;
        }
      }

      /* Input Area */
      .chat-input-area {
        padding: 16px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 8px;
        background: white;
        border-radius: 0 0 16px 16px;
      }

      .chat-input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 14px;
        font-family: inherit;
        outline: none;
        transition: all 0.2s ease;
      }

      .chat-input:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .chat-send-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: all 0.2s ease;
      }

      .chat-send-btn:hover {
        transform: scale(1.05);
      }

      .chat-send-btn:active {
        transform: scale(0.95);
      }

      /* Mobile Responsive */
      @media (max-width: 480px) {
        .chat-window {
          width: 100vw;
          height: 100vh;
          max-width: 100%;
          bottom: 0;
          right: 0;
          border-radius: 0;
        }

        .chat-support-btn {
          width: 56px;
          height: 56px;
          bottom: 24px;
          right: 16px;
        }

        .chat-message-content {
          max-width: 90%;
        }
      }

      /* Scrollbar Styling */
      .chat-messages::-webkit-scrollbar {
        width: 6px;
      }

      .chat-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .chat-messages::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 3px;
      }

      .chat-messages::-webkit-scrollbar-thumb:hover {
        background: #999;
      }
    `;
    document.head.appendChild(style);
  }

  createWidget() {
    const container = document.createElement('div');
    container.className = 'chat-support-container';
    container.innerHTML = `
      <!-- Floating Button -->
      <button class="chat-support-btn" id="chatBtn" title="Chat Support">
        💬
        <span class="chat-badge" id="chatBadge" style="display: none;">1</span>
      </button>

      <!-- Chat Window -->
      <div class="chat-window" id="chatWindow">
        <!-- Header -->
        <div class="chat-header">
          <div>
            <div class="chat-header-title">RENEKANKHA Support</div>
            <div class="chat-header-subtitle">👋 Online - ตอบโต้ได้ทันที</div>
          </div>
          <button class="chat-close-btn" id="chatCloseBtn">✕</button>
        </div>

        <!-- Messages -->
        <div class="chat-messages" id="chatMessages">
          <div class="chat-message bot">
            <div class="chat-message-content">
              สวัสดีครับ! 👋 ยินดีต้อนรับเข้า RENEKANKHA<br>
              <br>
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
    document.getElementById('chatInput').focus();
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
    this.showTyping();

    // Simulate bot response with delay
    setTimeout(() => {
      this.removeTyping();
      this.getBotResponse(message);
    }, 1500);

    // Save to localStorage
    this.saveMessages();
  }

  addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const time = new Date().toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    messageDiv.innerHTML = `
      <div class="chat-message-content">
        ${text}
        <div class="chat-message-time">${time}</div>
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    this.messages.push({ text, sender, time });
  }

  showTyping() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
      <div class="chat-message-content">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
  }

  removeTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  }

  getBotResponse(userMessage) {
    const responses = {
      'hello': 'สวัสดีครับ! 👋 มีอะไรที่ช่วยได้ไหม?',
      'สวัสดี': 'สวัสดีครับ! 👋 มีอะไรที่ช่วยได้ไหม?',
      'help': '📋 เราช่วยเรื่องต่าง ๆ ได้:\n• ยกเลิกแบน Garena ID\n• ปลดล็อก ID\n• ลบข้อมูล Google\n• รายงานการหลอกลวง\n\nคุณต้องการความช่วยเหลือเรื่องไหนครับ?',
      'ช่วย': '📋 เราช่วยเรื่องต่าง ๆ ได้:\n• ยกเลิกแบน Garena ID\n• ปลดล็อก ID\n• ลบข้อมูล Google\n• รายงานการหลอกลวง\n\nคุณต้องการความช่วยเหลือเรื่องไหนครับ?',
      'register': '📝 สมัครสมาชิกดี ๆ:\n\n1. ไปที่หน้า Login\n2. คลิก "สมัครสมาชิก"\n3. สร้าง Seed Phrase 12 คำ\n4. ยืนยัน\n5. ได้ Username อัตโนมัติ!\n\nมีปัญหาไหมครับ?',
      'สมัคร': '📝 สมัครสมาชิกดี ๆ:\n\n1. ไปที่หน้า Login\n2. คลิก "สมัครสมาชิก"\n3. สร้าง Seed Phrase 12 คำ\n4. ยืนยัน\n5. ได้ Username อัตโนมัติ!\n\nมีปัญหาไหมครับ?',
      'price': '💰 ราคาบริการ:\n\n• ยกเลิกแบน: 990 บาท\n• ปลดล็อก: 1,290 บาท\n• ขอเงินคืน: 1,990 บาท\n• โต้แย้ง Blacklist: 1,490 บาท\n• ลบ Google: 1,990 บาท\n\nใช้ Stripe ชำระเงินครับ',
      'ราคา': '💰 ราคาบริการ:\n\n• ยกเลิกแบน: 990 บาท\n• ปลดล็อก: 1,290 บาท\n• ขอเงินคืน: 1,990 บาท\n• โต้แย้ง Blacklist: 1,490 บาท\n• ลบ Google: 1,990 บาท\n\nใช้ Stripe ชำระเงินครับ',
      'payment': '💳 ชำระเงิน:\n\n• ใช้ Stripe Checkout\n• ปลอดภัย 100%\n• รองรับ Credit Card ทั่วโลก\n• ยืนยันทันที\n\nสร้าง Ticket แล้วคลิก "ชำระเงิน" ครับ',
      'ชำระ': '💳 ชำระเงิน:\n\n• ใช้ Stripe Checkout\n• ปลอดภัย 100%\n• รองรับ Credit Card ทั่วโลก\n• ยืนยันทันที\n\nสร้าง Ticket แล้วคลิก "ชำระเงิน" ครับ',
      'seed': '🔐 Seed Phrase 12 คำ:\n\n• เหมือน Crypto Wallet\n• ต้องจำให้ดี ⚠️\n• ไม่ส่งให้ใครเลย\n• เป็นกุญแจเข้าระบบ\n• ถ้าหายไม่สามารถเรียกคืนได้\n\nเก็บตัวอักษรที่ปลอดภัยครับ',
      'security': '🔐 ความปลอดภัย:\n\n✅ PBKDF2 + Salt Hashing\n✅ HTTPS Encryption\n✅ HttpOnly Cookies\n✅ Content Security Policy\n✅ Rate Limiting\n✅ Session 7 วัน\n\nข้อมูลของคุณปลอดภัย 100%',
      'default': '😊 ขอโทษครับ ไม่เข้าใจ\n\nลองพูดถึง:\n• help - ข้อมูลบริการ\n• price - ราคา\n• register - วิธีสมัคร\n• seed - เรื่อง Seed Phrase\n\nหรือจะสอบถามตรง Admin ก็ได้ครับ'
    };

    const lowerMessage = userMessage.toLowerCase();
    let response = responses['default'];

    for (const [key, value] of Object.entries(responses)) {
      if (key !== 'default' && lowerMessage.includes(key)) {
        response = value;
        break;
      }
    }

    this.addMessage(response, 'bot');
  }

  saveMessages() {
    localStorage.setItem('chatHistory', JSON.stringify(this.messages));
  }

  loadMessages() {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      try {
        this.messages = JSON.parse(saved);
        const messagesContainer = document.getElementById('chatMessages');
        this.messages.forEach(msg => {
          const messageDiv = document.createElement('div');
          messageDiv.className = `chat-message ${msg.sender}`;
          messageDiv.innerHTML = `
            <div class="chat-message-content">
              ${msg.text}
              <div class="chat-message-time">${msg.time}</div>
            </div>
          `;
          messagesContainer.appendChild(messageDiv);
        });
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ChatSupport();
  });
} else {
  new ChatSupport();
}

