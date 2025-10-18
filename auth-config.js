// ENHANCED SECURITY CONFIGURATION

export function isValidSeedPhrase(seedPhrase) {
	if (!seedPhrase || typeof seedPhrase !== 'string') return false;
	const words = seedPhrase.split(' ').filter(w => w.trim().length > 0);
	return words.length === 12;
}

export const loginAttempts = new Map();
export function checkRateLimit(identifier) {
	const key = 'login_' + identifier;
	const now = Date.now();
	if (!loginAttempts.has(key)) loginAttempts.set(key, []);
	let attempts = loginAttempts.get(key).filter(t => now - t < 900000);
	if (attempts.length >= 5) return false;
	attempts.push(now);
	loginAttempts.set(key, attempts);
	return true;
}
