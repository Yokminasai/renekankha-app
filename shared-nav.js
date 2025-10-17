// Shared Navigation Component
function createSharedNavigation(currentPage = '') {
	const pages = [
		{ id: 'index', href: 'index.html', label: '🏠 หน้าหลัก', icon: 'home' },
		{ id: 'authenticator', href: 'authenticator.html', label: '🔐 2FA Generator', icon: 'lock' },
		{ id: 'reports', href: 'reports.html', label: '📊 รายงาน', icon: 'chart' },
		{ id: 'orders', href: 'orders.html', label: '📋 คำสั่งซื้อ', icon: 'list' },
		{ id: 'login', href: 'login.html', label: '👤 เข้าสู่ระบบ', icon: 'user' },
		{ id: 'register', href: 'register.html', label: '📝 สมัครสมาชิก', icon: 'edit' },
		{ id: 'garena', href: 'services-garena.html', label: '🎮 บริการ Garena', icon: 'game' },
		{ id: 'dispute', href: 'services-blacklist-dispute.html', label: '⚖️ แก้ไขบัญชีดำ', icon: 'shield' },
		{ id: 'google', href: 'services-google-removal.html', label: '🔍 ลบข้อมูล Google', icon: 'search' }
	];

	const topbarHTML = `
		<div class="topbar">
			<div class="brand">
				<span class="brand-icon"></span>
				<span>IP Trust Checker</span>
			</div>
			<button class="mobile-nav-toggle" id="mobileNavToggle">☰</button>
			<div class="nav">
				${pages.slice(0, 5).map(page => 
					`<a href="${page.href}" ${page.id === currentPage ? 'class="active"' : ''}>${page.label}</a>`
				).join('')}
			</div>
		</div>

		<!-- Mobile Navigation Overlay -->
		<div class="mobile-nav-overlay" id="mobileNavOverlay">
			<div class="mobile-nav-menu" id="mobileNavMenu">
				${pages.map(page => 
					`<a href="${page.href}" ${page.id === currentPage ? 'class="active"' : ''}>${page.label}</a>`
				).join('')}
			</div>
		</div>
	`;

	return topbarHTML;
}

// Mobile Navigation JavaScript
function initMobileNavigation() {
	const toggle = document.getElementById('mobileNavToggle');
	const overlay = document.getElementById('mobileNavOverlay');
	const menu = document.getElementById('mobileNavMenu');
	
	if (!toggle || !overlay || !menu) return;
	
	toggle.addEventListener('click', () => {
		overlay.style.display = 'block';
		setTimeout(() => menu.classList.add('active'), 10);
	});
	
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			menu.classList.remove('active');
			setTimeout(() => overlay.style.display = 'none', 300);
		}
	});
}

// Auto-initialize mobile navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', initMobileNavigation);
