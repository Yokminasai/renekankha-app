import { kv } from '@vercel/kv';

// KV Keys (prefixed to avoid collisions)
const KV_KEYS = {
  USERS: 'app:users',
  SESSIONS: 'app:sessions',
  TRANSACTIONS: 'app:transactions',
  ORDERS: 'app:orders',
  REPORTS: 'app:reports',
  SERVICES: 'app:services',
  BLACKLIST: 'app:blacklist',
  TWOFA_KEYS: 'app:twofa-keys'
};

// Default templates
const TEMPLATES = {
  users: { users: [], updatedAt: new Date().toISOString() },
  sessions: { sessions: [], updatedAt: new Date().toISOString() },
  transactions: { transactions: [], updatedAt: new Date().toISOString() },
  orders: { orders: [], updatedAt: new Date().toISOString() },
  reports: { reports: [], updatedAt: new Date().toISOString() },
  services: { garena: [], disputes: [], google: [], updatedAt: new Date().toISOString() },
  blacklist: { ips: [], updatedAt: new Date().toISOString() },
  twofaKeys: { keys: [], updatedAt: new Date().toISOString() }
};

// Initialize KV storage (create default data if not exists)
export async function initializeKVStorage() {
  try {
    for (const [key, value] of Object.entries(KV_KEYS)) {
      const kvKey = value;
      const existing = await kv.get(kvKey);
      if (!existing) {
        const template = TEMPLATES[key.toLowerCase().replace(/_/g, '')];
        await kv.set(kvKey, JSON.stringify(template || {}));
        console.log(`✅ Initialized KV: ${kvKey}`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to initialize KV storage:', error);
  }
}

// Read data from KV
export async function readFromKV(storageType) {
  try {
    const kvKey = KV_KEYS[storageType.toUpperCase().replace('-', '_')];
    if (!kvKey) throw new Error(`Unknown storage type: ${storageType}`);
    
    const data = await kv.get(kvKey);
    if (!data) return TEMPLATES[storageType.toLowerCase()] || {};
    
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error(`❌ Failed to read from KV (${storageType}):`, error);
    return TEMPLATES[storageType.toLowerCase()] || {};
  }
}

// Write data to KV
export async function writeToKV(storageType, data) {
  try {
    const kvKey = KV_KEYS[storageType.toUpperCase().replace('-', '_')];
    if (!kvKey) throw new Error(`Unknown storage type: ${storageType}`);
    
    data.updatedAt = new Date().toISOString();
    await kv.set(kvKey, JSON.stringify(data));
    console.log(`✅ Saved to KV: ${kvKey}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to write to KV (${storageType}):`, error);
    return false;
  }
}

// Convenience helpers
export async function getUsers() {
  const data = await readFromKV('users');
  return data;
}

export async function saveUsers(data) {
  return writeToKV('users', data);
}

export async function getSessions() {
  const data = await readFromKV('sessions');
  return data;
}

export async function saveSessions(data) {
  return writeToKV('sessions', data);
}

export async function getTransactions() {
  const data = await readFromKV('transactions');
  return data;
}

export async function saveTransactions(data) {
  return writeToKV('transactions', data);
}

export async function getTwofaKeys() {
  const data = await readFromKV('twofa-keys');
  return data;
}

export async function saveTwofaKeys(data) {
  return writeToKV('twofa-keys', data);
}

export async function getServices() {
  const data = await readFromKV('services');
  return data;
}

export async function saveServices(data) {
  return writeToKV('services', data);
}

