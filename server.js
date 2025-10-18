import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

// Ensure fetch is available on older Node versions
let _fetch = globalThis.fetch;
if (typeof _fetch !== 'function') {
	const { default: nf } = await import('node-fetch');
	_fetch = nf;
	globalThis.fetch = nf;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEFAULT_PORT = Number(process.env.PORT || 3000);
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret';

// Data directory - use /tmp on Vercel, local on dev
const dataDir = process.env.VERCEL 
	? path.join('/tmp', 'data')
	: path.join(__dirname, 'data');

// Security headers + CSP
app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com', 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
			scriptSrcElem: ["'self'", "'unsafe-inline'", 'https://unpkg.com', 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
			styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com', 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
			fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
			imgSrc: ["'self'", 'data:', 'blob:', 'https://*.tile.openstreetmap.org'],
			connectSrc: ["'self'", 'https://ipapi.co', 'https://ipinfo.io', 'https://api64.ipify.org', 'https://api.stripe.com', 'https://unpkg.com'],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: ["'none'"],
			upgradeInsecureRequests: null
		}
	},
	crossOriginEmbedderPolicy: false
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('combined'));

const blacklistFile = path.join(dataDir, 'blacklist.json');
const reportsFile = path.join(dataDir, 'reports.json');
const ordersFile = path.join(dataDir, 'orders.json');
const servicesFile = path.join(dataDir, 'services.json');
const usersFile = path.join(dataDir, 'users.json');
const sessionsFile = path.join(dataDir, 'sessions.json');
const twofaKeysFile = path.join(dataDir, 'twofa-keys.json');
const transactionsFile = path.join(dataDir, 'transactions.json');

function ensureDataFiles() {
	try {
		if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
	} catch (err) {
		console.warn('Cannot create data directory:', err.message);
		return;
	}
	
	const files = [blacklistFile, reportsFile, ordersFile, servicesFile, usersFile, sessionsFile, transactionsFile];
	const templates = [
		{ ips: [], updatedAt: new Date().toISOString() },
		{ reports: [], updatedAt: new Date().toISOString() },
		{ orders: [], updatedAt: new Date().toISOString() },
		{ garena: [], disputes: [], google: [], updatedAt: new Date().toISOString() },
		{ users: [], updatedAt: new Date().toISOString() },
		{ sessions: [], updatedAt: new Date().toISOString() },
		{ transactions: [], updatedAt: new Date().toISOString() }
	];
	
	files.forEach((filePath, idx) => {
		try {
			if (!fs.existsSync(filePath)) {
				fs.writeFileSync(filePath, JSON.stringify(templates[idx], null, 2));
			}
		} catch (err) {
			console.warn(`Cannot initialize ${filePath}:`, err.message);
		}
	});
}

function readJSON(filePath) { 
	try { 
		return JSON.parse(fs.readFileSync(filePath, 'utf8')); 
	} catch { 
		return null; 
	} 
}

function writeJSON(filePath, data) { 
	try {
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
	} catch (err) {
		console.warn(`Cannot write to ${filePath}:`, err.message);
	}
}
ensureDataFiles();

// Minimal cookie session
function sign(value) { return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('base64url'); }
function setSessionCookie(res, sessionId) {
	const signature = sign(sessionId);
	const cookie = `sid=${sessionId}.${signature}; Path=/; HttpOnly; SameSite=Lax`;
	res.setHeader('Set-Cookie', cookie);
}
function clearSessionCookie(res) { res.setHeader('Set-Cookie', 'sid=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'); }
function getSession(req) {
	const cookie = req.headers.cookie || '';
	const m = cookie.match(/(?:^|; )sid=([^;]+)/);
	if (!m) return null;
	const [id, sig] = decodeURIComponent(m[1]).split('.');
	if (!id || !sig || sign(id) !== sig) return null;
	const db = readJSON(sessionsFile) || { sessions: [] };
	const s = db.sessions.find(x => x.id === id);
	if (!s) return null;
	if (s.expiresAt && Date.now() > new Date(s.expiresAt).getTime()) return null;
	return s;
}

function hashPassword(pw) { const salt = crypto.randomBytes(16).toString('base64url'); const hash = crypto.pbkdf2Sync(pw, salt, 100000, 32, 'sha256').toString('base64url'); return `${salt}:${hash}`; }
function verifyPassword(pw, stored) { const [salt, hash] = stored.split(':'); const test = crypto.pbkdf2Sync(pw, salt, 100000, 32, 'sha256').toString('base64url'); return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(test)); }

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
	const { email, password, name } = req.body || {};
	if (!email || !password) return res.status(400).json({ error: 'missing email/password' });
	const users = readJSON(usersFile) || { users: [] };
	if (users.users.some(u => u.email === email)) return res.status(409).json({ error: 'email exists' });
	const user = { id: nanoid(10), email: String(email), name: String(name||''), passwordHash: hashPassword(String(password)), role: 'user', createdAt: new Date().toISOString() };
	users.users.push(user);
	users.updatedAt = new Date().toISOString();
	writeJSON(usersFile, users);
	res.status(201).json({ ok: true });
});

app.post('/api/auth/login', (req, res) => {
	const { email, password } = req.body || {};
	if (!email || !password) return res.status(400).json({ error: 'missing email/password' });
	const users = readJSON(usersFile) || { users: [] };
	const user = users.users.find(u => u.email === email);
	if (!user || !verifyPassword(String(password), user.passwordHash)) return res.status(401).json({ error: 'invalid credentials' });
	const sessions = readJSON(sessionsFile) || { sessions: [] };
	const id = nanoid(24);
	const expiresAt = new Date(Date.now() + 1000*60*60*24*7).toISOString();
	sessions.sessions.push({ id, userId: user.id, createdAt: new Date().toISOString(), expiresAt });
	sessions.updatedAt = new Date().toISOString();
	writeJSON(sessionsFile, sessions);
	setSessionCookie(res, id);
	res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.post('/api/auth/logout', (req, res) => {
	const s = getSession(req);
	if (s) {
		const sessions = readJSON(sessionsFile) || { sessions: [] };
		sessions.sessions = sessions.sessions.filter(x => x.id !== s.id);
		sessions.updatedAt = new Date().toISOString();
		writeJSON(sessionsFile, sessions);
	}
	clearSessionCookie(res);
	res.json({ ok: true });
});

// Anonymous auth endpoints
app.post('/api/auth/anonymous-register', (req, res) => {
	const { name, seedPhrase, hash, anonymous } = req.body || {};
	if (!seedPhrase || !hash || !anonymous) return res.status(400).json({ error: 'missing required fields' });
	
	const users = readJSON(usersFile) || { users: [] };
	
	// Check if seed phrase hash already exists
	if (users.users.some(u => u.seedPhraseHash === hash)) {
		return res.status(409).json({ error: 'seed phrase already registered' });
	}
	
	const user = { 
		id: nanoid(10), 
		name: String(name || ''), 
		seedPhraseHash: hash,
		role: 'user', 
		anonymous: true,
		createdAt: new Date().toISOString() 
	};
	
	users.users.push(user);
	users.updatedAt = new Date().toISOString();
	writeJSON(usersFile, users);
	
	// Create session
	const sessions = readJSON(sessionsFile) || { sessions: [] };
	const sessionId = nanoid(32);
	sessions.sessions.push({ id: sessionId, userId: user.id, createdAt: new Date().toISOString() });
	sessions.updatedAt = new Date().toISOString();
	writeJSON(sessionsFile, sessions);
	setSessionCookie(res, sessionId);
	
	res.status(201).json({ ok: true, user: { id: user.id, name: user.name, role: user.role, anonymous: true } });
});

app.post('/api/auth/anonymous-login', (req, res) => {
	const { seedPhrase, hash, anonymous } = req.body || {};
	if (!seedPhrase || !hash || !anonymous) return res.status(400).json({ error: 'missing required fields' });
	
	const users = readJSON(usersFile) || { users: [] };
	const user = users.users.find(u => u.seedPhraseHash === hash && u.anonymous === true);
	
	if (!user) return res.status(401).json({ error: 'invalid seed phrase' });
	
	// Create session
	const sessions = readJSON(sessionsFile) || { sessions: [] };
	const sessionId = nanoid(32);
	sessions.sessions.push({ id: sessionId, userId: user.id, createdAt: new Date().toISOString() });
	sessions.updatedAt = new Date().toISOString();
	writeJSON(sessionsFile, sessions);
	setSessionCookie(res, sessionId);
	
	res.json({ ok: true, user: { id: user.id, name: user.name, role: user.role, anonymous: true } });
});

app.get('/api/auth/me', (req, res) => {
	const s = getSession(req);
	if (!s) return res.json({ ok: false, user: null });
	const users = readJSON(usersFile) || { users: [] };
	const user = users.users.find(u => u.id === s.userId);
	if (!user) return res.json({ ok: false, user: null });
	
	// Return appropriate user data based on auth type
	if (user.anonymous) {
		res.json({ ok: true, user: { id: user.id, name: user.name, role: user.role, anonymous: true } });
	} else {
		res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
	}
});

// 2FA Keys endpoints
app.post('/api/2fa/save', (req, res) => {
	const s = getSession(req);
	if (!s) return res.status(401).json({ error: 'not authenticated' });
	
	const { secretKey, accountName, timestamp } = req.body || {};
	if (!secretKey) return res.status(400).json({ error: 'missing secret key' });
	
	const keys = readJSON(twofaKeysFile) || { keys: [] };
	
	// Check if key already exists for this user
	const existingKey = keys.keys.find(k => k.userId === s.userId && k.secretKey === secretKey);
	if (existingKey) {
		return res.status(409).json({ error: 'key already exists' });
	}
	
	const key = {
		id: nanoid(10),
		userId: s.userId,
		secretKey: secretKey,
		accountName: accountName || 'Account',
		timestamp: timestamp || new Date().toISOString()
	};
	
	keys.keys.push(key);
	keys.updatedAt = new Date().toISOString();
	writeJSON(twofaKeysFile, keys);
	
	res.status(201).json({ ok: true, key: { id: key.id, accountName: key.accountName, timestamp: key.timestamp } });
});

app.get('/api/2fa/keys', (req, res) => {
	const s = getSession(req);
	if (!s) return res.status(401).json({ error: 'not authenticated' });
	
	const keys = readJSON(twofaKeysFile) || { keys: [] };
	const userKeys = keys.keys.filter(k => k.userId === s.userId);
	
	res.json({ keys: userKeys });
});

app.delete('/api/2fa/keys/:keyId', (req, res) => {
	const s = getSession(req);
	if (!s) return res.status(401).json({ error: 'not authenticated' });
	
	const { keyId } = req.params;
	const keys = readJSON(twofaKeysFile) || { keys: [] };
	
	// Find and remove the key (only if it belongs to the user)
	const keyIndex = keys.keys.findIndex(k => k.id === keyId && k.userId === s.userId);
	if (keyIndex === -1) {
		return res.status(404).json({ error: 'key not found' });
	}
	
	keys.keys.splice(keyIndex, 1);
	keys.updatedAt = new Date().toISOString();
	writeJSON(twofaKeysFile, keys);
	
	res.json({ ok: true });
});

// Blacklist APIs
app.get('/api/blacklist/:ip', (req, res) => {
	const db = readJSON(blacklistFile) || { ips: [] };
	const found = db.ips.find((x) => x.ip === req.params.ip);
	res.json({ blacklisted: Boolean(found), entry: found || null });
});
app.get('/api/blacklist', (req, res) => {
	const db = readJSON(blacklistFile) || { ips: [] };
	const limit = Math.min(parseInt(req.query.limit || '200', 10), 1000);
	res.json({ count: db.ips.length, items: db.ips.slice(0, limit) });
});
app.post('/api/blacklist', (req, res) => {
	const { ip, reason } = req.body || {};
	if (!ip || typeof ip !== 'string') return res.status(400).json({ error: 'invalid ip' });
	const db = readJSON(blacklistFile) || { ips: [] };
	if (db.ips.some((x) => x.ip === ip)) return res.status(409).json({ error: 'already blacklisted' });
	const entry = { id: nanoid(12), ip, reason: String(reason || 'ไม่ระบุ'), createdAt: new Date().toISOString() };
	db.ips.unshift(entry);
	db.updatedAt = new Date().toISOString();
	writeJSON(blacklistFile, db);
	res.status(201).json({ ok: true, entry });
});
app.delete('/api/blacklist/:ip', (req, res) => {
	const ip = req.params.ip;
	const db = readJSON(blacklistFile) || { ips: [] };
	const before = db.ips.length;
	db.ips = db.ips.filter((x) => x.ip !== ip);
	if (db.ips.length === before) return res.status(404).json({ error: 'not found' });
	db.updatedAt = new Date().toISOString();
	writeJSON(blacklistFile, db);
	res.json({ ok: true });
});

// Reports APIs
app.post('/api/reports', (req, res) => {
	const { ip, details } = req.body || {};
	if (!ip || typeof ip !== 'string') return res.status(400).json({ error: 'invalid ip' });
	const db = readJSON(reportsFile) || { reports: [] };
	const report = { id: nanoid(12), ip, details: String(details || 'ไม่ระบุ'), createdAt: new Date().toISOString() };
	db.reports.unshift(report);
	db.updatedAt = new Date().toISOString();
	writeJSON(reportsFile, db);
	res.status(201).json({ ok: true, report });
});
app.get('/api/reports', (req, res) => {
	const db = readJSON(reportsFile) || { reports: [] };
	const limit = Math.min(parseInt(req.query.limit || '200', 10), 1000);
	res.json({ count: db.reports.length, items: db.reports.slice(0, limit) });
});

// Orders APIs (RoV rental workflow)
app.post('/api/orders', (req, res) => {
	const { customer, note } = req.body || {};
	const db = readJSON(ordersFile) || { orders: [] };
	const id = nanoid(10);
	const now = new Date().toISOString();
	const order = { id, customer: String(customer || 'ไม่ระบุ'), note: String(note || ''), status: 'pending', checks: [], createdAt: now, updatedAt: now };
	db.orders.unshift(order);
	db.updatedAt = now;
	writeJSON(ordersFile, db);
	res.status(201).json({ ok: true, order });
});
app.get('/api/orders', (req, res) => {
	const db = readJSON(ordersFile) || { orders: [] };
	const limit = Math.min(parseInt(req.query.limit || '200', 10), 1000);
	res.json({ count: db.orders.length, items: db.orders.slice(0, limit) });
});
app.get('/api/orders/:id', (req, res) => {
	const db = readJSON(ordersFile) || { orders: [] };
	const order = db.orders.find(o => o.id === req.params.id);
	if (!order) return res.status(404).json({ error: 'not found' });
	res.json({ ok: true, order });
});
app.post('/api/orders/:id/check', (req, res) => {
	const db = readJSON(ordersFile) || { orders: [] };
	const order = db.orders.find(o => o.id === req.params.id);
	if (!order) return res.status(404).json({ error: 'not found' });
	const { ip, isp, country, region, city } = req.body || {};
	if (!ip) return res.status(400).json({ error: 'missing ip' });
	const at = new Date().toISOString();
	order.checks.unshift({ at, ip, isp: String(isp||''), country: String(country||''), region: String(region||''), city: String(city||'') });
	order.updatedAt = at;
	writeJSON(ordersFile, db);
	res.json({ ok: true, order });
});
app.post('/api/orders/:id/status', (req, res) => {
	const db = readJSON(ordersFile) || { orders: [] };
	const order = db.orders.find(o => o.id === req.params.id);
	if (!order) return res.status(404).json({ error: 'not found' });
	const { status } = req.body || {};
	if (!['pending','verified','flagged'].includes(status)) return res.status(400).json({ error: 'invalid status' });
	order.status = status;
	order.updatedAt = new Date().toISOString();
	writeJSON(ordersFile, db);
	res.json({ ok: true, order });
});

// Service Request APIs
// Garena: { kind: 'ban'|'unbind'|'unban_refund', gameId, contact, details, evidenceUrls[] }
app.post('/api/services/garena', (req, res) => {
	const { kind, gameId, contact, details, evidenceUrls } = req.body || {};
	if (!['ban','unbind','unban_refund'].includes(kind||'')) return res.status(400).json({ error: 'invalid kind' });
	const db = readJSON(servicesFile) || { garena: [], disputes: [], google: [] };
	const ticket = { id: nanoid(12), kind, gameId: String(gameId||''), contact: String(contact||''), details: String(details||''), evidenceUrls: Array.isArray(evidenceUrls)? evidenceUrls.slice(0,10): [], status: 'received', createdAt: new Date().toISOString() };
	db.garena.unshift(ticket);
	db.updatedAt = new Date().toISOString();
	writeJSON(servicesFile, db);
	res.status(201).json({ ok: true, ticket });
});
app.get('/api/services/garena', (req, res) => {
	const db = readJSON(servicesFile) || { garena: [], disputes: [], google: [] };
	const limit = Math.min(parseInt(req.query.limit || '200', 10), 1000);
	res.json({ count: db.garena.length, items: db.garena.slice(0, limit) });
});

// Blacklist dispute: { platformUrl, contact, statement, evidenceUrls[] }
app.post('/api/services/blacklist-dispute', (req, res) => {
	const { platformUrl, contact, statement, evidenceUrls } = req.body || {};
	if (!platformUrl) return res.status(400).json({ error: 'platformUrl required' });
	const db = readJSON(servicesFile) || { garena: [], disputes: [], google: [] };
	const ticket = { id: nanoid(12), platformUrl: String(platformUrl), contact: String(contact||''), statement: String(statement||''), evidenceUrls: Array.isArray(evidenceUrls)? evidenceUrls.slice(0,10): [], status: 'received', createdAt: new Date().toISOString() };
	db.disputes.unshift(ticket);
	db.updatedAt = new Date().toISOString();
	writeJSON(servicesFile, db);
	res.status(201).json({ ok: true, ticket });
});
app.get('/api/services/blacklist-dispute', (req, res) => {
	const db = readJSON(servicesFile) || { garena: [], disputes: [], google: [] };
	const limit = Math.min(parseInt(req.query.limit || '200', 10), 1000);
	res.json({ count: db.disputes.length, items: db.disputes.slice(0, limit) });
});

// Google removal: { targetUrls[], reason, contact, details }
app.post('/api/services/google-removal', (req, res) => {
	const { targetUrls, reason, contact, details } = req.body || {};
	if (!Array.isArray(targetUrls) || targetUrls.length === 0) return res.status(400).json({ error: 'targetUrls required' });
	const db = readJSON(servicesFile) || { garena: [], disputes: [], google: [] };
	const ticket = { id: nanoid(12), targetUrls: targetUrls.slice(0,20), reason: String(reason||''), contact: String(contact||''), details: String(details||''), status: 'received', createdAt: new Date().toISOString() };
	db.google.unshift(ticket);
	db.updatedAt = new Date().toISOString();
	writeJSON(servicesFile, db);
	res.status(201).json({ ok: true, ticket });
});
app.get('/api/services/google-removal', (req, res) => {
	const db = readJSON(servicesFile) || { garena: [], disputes: [], google: [] };
	const limit = Math.min(parseInt(req.query.limit || '200', 10), 1000);
	res.json({ count: db.google.length, items: db.google.slice(0, limit) });
});

// Payments (Stripe Checkout) with fallback
app.post('/api/pay/checkout', async (req, res) => {
	const { type, ticketId } = req.body || {};
	const priceMap = {
		garena_ban: 99000,           // 990.00 THB (amount in minor units if THB is supported)
		garena_unbind: 129000,       // 1,290.00 THB
		garena_unban_refund: 199000, // 1,990.00 THB
		blacklist_dispute: 149000,   // 1,490.00 THB
		google_removal: 199000       // 1,990.00 THB
	};
	const amount = priceMap[type];
	if (!amount) return res.status(400).json({ error: 'invalid type' });
	const successUrl = `${req.protocol}://${req.get('host')}/pay-success.html?tid=${encodeURIComponent(ticketId||'')}`;
	const cancelUrl = `${req.protocol}://${req.get('host')}/pay-cancel.html`;

	const stripeSecret = process.env.STRIPE_SECRET || '';
	if (!stripeSecret) {
		// Fallback mock: pretend success and redirect to success page
		return res.json({ ok: true, url: successUrl + `&mock=1&type=${encodeURIComponent(type)}` });
	}
	try {
		const { default: Stripe } = await import('stripe');
		const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });
		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: ['card'],
			line_items: [{ price_data: { currency: 'thb', product_data: { name: type }, unit_amount: amount }, quantity: 1 }],
			success_url: successUrl,
			cancel_url: cancelUrl,
			metadata: { ticketId: String(ticketId||''), type }
		});
		return res.json({ ok: true, url: session.url });
	} catch (e) {
		return res.status(500).json({ error: 'stripe_error' });
	}
});

// TEMPORARILY DISABLED - Transaction APIs
/*
app.post('/api/transactions', (req, res) => {
	const s = getSession(req);
	if (!s) return res.status(401).json({ error: 'not authenticated' });
	
	const { type, amount, description, date } = req.body || {};
	if (!type || !amount || amount <= 0) return res.status(400).json({ error: 'invalid type or amount' });
	if (!['income', 'expense'].includes(type)) return res.status(400).json({ error: 'invalid type' });
	
	const db = readJSON(transactionsFile) || { transactions: [] };
	const users = readJSON(usersFile) || { users: [] };
	const user = users.users.find(u => u.id === s.userId);
	
	const transaction = {
		id: nanoid(12),
		userId: s.userId,
		seedPhraseHash: user?.seedPhraseHash || '',
		type,
		amount: Number(amount),
		description: String(description || ''),
		date: date || new Date().toISOString(),
		createdAt: new Date().toISOString()
	};
	
	db.transactions.unshift(transaction);
	db.updatedAt = new Date().toISOString();
	writeJSON(transactionsFile, db);
	
	res.status(201).json({ ok: true, transaction });
});

app.get('/api/transactions', (req, res) => {
	const s = getSession(req);
	if (!s) return res.status(401).json({ error: 'not authenticated' });
	
	const db = readJSON(transactionsFile) || { transactions: [] };
	const userTransactions = db.transactions.filter(t => t.userId === s.userId);
	const limit = Math.min(parseInt(req.query.limit || '500', 10), 5000);
	
	res.json({ count: userTransactions.length, items: userTransactions.slice(0, limit) });
});

app.delete('/api/transactions/:id', (req, res) => {
	const s = getSession(req);
	if (!s) return res.status(401).json({ error: 'not authenticated' });
	
	const { id } = req.params;
	const db = readJSON(transactionsFile) || { transactions: [] };
	
	const transactionIndex = db.transactions.findIndex(t => t.id === id && t.userId === s.userId);
	if (transactionIndex === -1) return res.status(404).json({ error: 'not found' });
	
	db.transactions.splice(transactionIndex, 1);
	db.updatedAt = new Date().toISOString();
	writeJSON(transactionsFile, db);
	
	res.json({ ok: true });
});
*/

// 2FA Live Proxy API
app.get('/api/2fa/:secret', async (req, res) => {
	try {
		const { secret } = req.params;
		const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
		
		const response = await fetch(`https://2fa.live/tok/${cleanSecret}`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			}
		});
		
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		
		const data = await response.json();
		
		if (data.error) {
			throw new Error(data.error);
		}
		
		res.json({
			success: true,
			token: data.token || data.otp || data.code,
			timeLeft: data.timeLeft || 30,
			source: '2fa.live'
		});
	} catch (error) {
		console.error('2FA Live API error:', error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});

// Server-side IP info with fast parallel race and timeouts
app.get('/api/ip', async (req, res) => {
	res.set('Cache-Control', 'no-store');

	// Function to extract real client IP from headers (Vercel + others)
	function getClientIp() {
		// Try multiple header sources for IP
		const ip = 
			req.headers['x-forwarded-for']?.split(',')[0].trim() ||  // Vercel, Cloudflare
			req.headers['cf-connecting-ip'] ||  // Cloudflare
			req.headers['x-real-ip'] ||  // Nginx, Vercel
			req.headers['x-client-ip'] ||
			req.socket?.remoteAddress ||
			req.connection?.remoteAddress ||
			'unknown';
		
		// Clean up IPv6 mapped IPv4
		return ip.replace(/^::ffff:/, '');
	}

	const clientIp = getClientIp();

	function withTimeout(ms, fetcher) {
		const controller = new AbortController();
		const t = setTimeout(() => controller.abort(), ms);
		return fetcher(controller.signal)
			.finally(() => clearTimeout(t));
	}

	async function tryIpApi(signal) {
		const r = await _fetch('https://ipapi.co/json/', { signal });
		if (!r.ok) throw new Error('ipapi');
		const j = await r.json();
		return { source: 'ipapi', data: j };
	}
	async function tryIpInfo(signal) {
		const token = '';
		const r = await _fetch(`https://ipinfo.io/json${token ? `?token=${token}` : ''}`, { signal });
		if (!r.ok) throw new Error('ipinfo');
		const j = await r.json();
		return { source: 'ipinfo', data: j };
	}
	async function tryIpify(signal) {
		const r = await _fetch('https://api64.ipify.org?format=json', { signal });
		if (!r.ok) throw new Error('ipify');
		const j = await r.json();
		return { source: 'ipify', data: j };
	}
	async function ipapiByIp(ip, signal) {
		const r = await _fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { signal });
		if (!r.ok) throw new Error('ipapiByIp');
		return r.json();
	}

	try {
		// Race providers (3s timeout each). Whichever responds first wins.
		const winner = await Promise.any([
			withTimeout(3000, (s) => tryIpApi(s)),
			withTimeout(3000, (s) => tryIpInfo(s)),
			withTimeout(3000, (s) => tryIpify(s))
		]);

		let { source, data: payload } = winner;
		let ip = payload.ip || payload.query || '';
		let isp = payload.org || payload.org_name || payload.isp || '';
		let country = payload.country_name || payload.country || '';
		let region = payload.region || payload.regionName || '';
		let city = payload.city || '';
		let latitude = null;
		let longitude = null;

		// Debug logging
		console.log(`[IP] Detected: ${ip} from ${source}, Headers: x-forwarded-for=${req.headers['x-forwarded-for']}, x-real-ip=${req.headers['x-real-ip']}`);

		if (source === 'ipapi') {
			latitude = Number(payload.latitude);
			longitude = Number(payload.longitude);
		} else if (source === 'ipinfo' && typeof payload.loc === 'string') {
			const parts = payload.loc.split(',').map(Number);
			if (parts.length === 2) { latitude = parts[0]; longitude = parts[1]; }
		} else if (source === 'ipify' && ip) {
			try {
				const extra = await withTimeout(3000, (s) => ipapiByIp(ip, s));
				isp = isp || extra.org || extra.org_name || extra.isp || '';
				country = country || extra.country_name || extra.country || '';
				region = region || extra.region || extra.regionName || '';
				city = city || extra.city || '';
				latitude = Number(extra.latitude);
				longitude = Number(extra.longitude);
			} catch {}
		}

		return res.json({ ok: true, source, ip, isp, country, region, city, latitude, longitude, clientIP: clientIp });
	} catch (e) {
		console.error('IP lookup error:', e);
		return res.status(504).json({ ok: false, error: 'ip_lookup_timeout' });
	}
});

// Lookup geolocation for a specific IP (called from client)
app.post('/api/ip-lookup', async (req, res) => {
	res.set('Cache-Control', 'no-store');
	const { ip } = req.body || {};
	
	if (!ip || typeof ip !== 'string') {
		return res.status(400).json({ ok: false, error: 'IP address required' });
	}

	function withTimeout(ms, fetcher) {
		const controller = new AbortController();
		const t = setTimeout(() => controller.abort(), ms);
		return fetcher(controller.signal)
			.finally(() => clearTimeout(t));
	}

	async function ipapiByIp(ipAddr, signal) {
		const r = await _fetch(`https://ipapi.co/${encodeURIComponent(ipAddr)}/json/`, { signal });
		if (!r.ok) throw new Error('ipapiByIp');
		return r.json();
	}

	try {
		console.log(`[IP-Lookup] Getting geolocation for: ${ip}`);
		// Try multiple providers for better reliability
		let data = null;
		let error = null;
		
		try {
			// Try ipapi.co with 8s timeout
			data = await withTimeout(8000, (s) => ipapiByIp(ip, s));
		} catch (e1) {
			console.error('[IP-Lookup] ipapi.co failed:', e1.message);
			error = e1;
		}
		
		if (!data) {
			// Fallback: try ipinfo.io
			try {
				const r = await withTimeout(8000, (s) => _fetch(`https://ipinfo.io/${encodeURIComponent(ip)}/json`, { signal: s }));
				if (r.ok) {
					const info = await r.json();
					data = {
						ip: info.ip,
						org: info.org,
						country_name: info.country,
						region_name: info.region,
						city: info.city,
						latitude: info.loc?.split(',')[0],
						longitude: info.loc?.split(',')[1]
					};
				}
			} catch (e2) {
				console.error('[IP-Lookup] ipinfo.io failed:', e2.message);
			}
		}
		
		if (!data) {
			throw error || new Error('All IP lookup providers failed');
		}
		
		const result = {
			ok: true,
			ip: data.ip || ip,
			isp: data.org || data.isp || '',
			country: data.country_name || data.country || '',
			region: data.region_name || data.region || '',
			city: data.city || '',
			latitude: Number(data.latitude) || null,
			longitude: Number(data.longitude) || null,
			organization: data.organization || '',
			postal: data.postal || '',
			timezone: data.timezone || ''
		};
		
		return res.json(result);
	} catch (e) {
		console.error('[IP-Lookup] Error:', e);
		return res.status(504).json({ ok: false, error: 'ip_lookup_timeout', details: e.message });
	}
});

// Serve static frontend (must be after all API routes)

// Explicitly serve each HTML file
app.get('/index.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/authenticator.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'authenticator.html'));
});

app.get('/reports.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'reports.html'));
});

app.get('/orders.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'orders.html'));
});

app.get('/check.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'check.html'));
});

app.get('/scammed-reports.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'scammed-reports.html'));
});

app.get('/dashboard.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/services.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'services.html'));
});

app.get('/services-garena.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'services-garena.html'));
});

app.get('/services-blacklist-dispute.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'services-blacklist-dispute.html'));
});

app.get('/services-google-removal.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'services-google-removal.html'));
});

app.get('/services-email.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'services-email.html'));
});

app.get('/services-email-checker.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'services-email-checker.html'));
});

app.get('/services-twitter-checker.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'services-twitter-checker.html'));
});

app.get('/services-private-id-check.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'services-private-id-check.html'));
});

app.get('/services-scammed-account.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'services-scammed-account.html'));
});

app.get('/services-scam-reporting.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'services-scam-reporting.html'));
});

app.get('/profit-calculator.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'profit-calculator.html'));
});

app.get('/pay-success.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'pay-success.html'));
});

app.get('/pay-cancel.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'pay-cancel.html'));
});

app.get('/test-2fa.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'test-2fa.html'));
});

app.get('/home.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'home.html'));
});

// Handle root path - serve home.html
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'home.html'));
});

// Then use express.static for other static files (CSS, JS, images, etc)
app.use(express.static(__dirname));

// Fallback 404 handler
app.use((req, res) => {
	res.status(404).json({ error: 'Not Found' });
});

// Global error handler (this comes after all routes)
app.use((err, req, res, next) => {
	console.error('Error:', err);
	res.status(500).json({ error: 'internal server error', message: err.message });
});

async function startServer(preferredPort, maxAttempts = 10) {
	let port = preferredPort;
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			await new Promise((resolve, reject) => {
				const server = app.listen(port, async () => {
					console.log(`Server running on http://localhost:${port}`);
					try {
						const mod = await import('open').catch(() => null);
						if (mod && mod.default) { await mod.default(`http://localhost:${port}`); }
					} catch {}
					resolve(server);
				});
				server.on('error', reject);
			});
			return;
		} catch (err) {
			if (err && err.code === 'EADDRINUSE') {
				console.warn(`Port ${port} in use, trying ${port + 1}...`);
				port += 1;
				continue;
			}
			throw err;
		}
	}
	throw new Error('Unable to bind to a port');
}

// Export app for Vercel
export default app;

// Only start server in local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
	startServer(DEFAULT_PORT).catch((e) => {
		console.error('Failed to start server:', e);
		process.exit(1);
	});
}
