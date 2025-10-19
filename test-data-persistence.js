// Test script to verify data persistence
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const seedPhrase = 'awake action blast belt brother aware armed acoustic axis able bird beyond';
const usersFile = path.join(__dirname, 'data', 'users.json');
const transactionsFile = path.join(__dirname, 'data', 'transactions.json');
const sessionsFile = path.join(__dirname, 'data', 'sessions.json');

// Helper functions
function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON file:', error.message);
    return null;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing JSON file:', error.message);
    return false;
  }
}

// Main function
async function testDataPersistence() {
  console.log('🧪 Testing data persistence...');
  
  // Generate hash
  const hash = crypto.createHash('sha256').update(seedPhrase).digest('hex');
  console.log('Seed Phrase Hash:', hash);
  
  // Find user
  const users = readJSON(usersFile) || { users: [] };
  const user = users.users.find(u => u.seedPhraseHash === hash);
  
  if (!user) {
    console.error('❌ User not found with this seed phrase');
    return;
  }
  
  console.log('✅ User found:', user.id, '(' + user.name + ')');
  console.log('Legacy account:', user.legacy);
  
  // Create test transactions
  const testTransactions = [
    {
      id: nanoid(12),
      userId: user.id,
      seedPhraseHash: user.seedPhraseHash,
      type: 'income',
      amount: 1000,
      description: 'Test Income - รายรับทดสอบ',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: nanoid(12),
      userId: user.id,
      seedPhraseHash: user.seedPhraseHash,
      type: 'expense',
      amount: 500,
      description: 'Test Expense - รายจ่ายทดสอบ',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];
  
  // Add transactions to database
  const transactions = readJSON(transactionsFile) || { transactions: [] };
  testTransactions.forEach(transaction => {
    transactions.transactions.unshift(transaction);
  });
  transactions.updatedAt = new Date().toISOString();
  
  if (writeJSON(transactionsFile, transactions)) {
    console.log('✅ Test transactions added to database');
  } else {
    console.error('❌ Failed to save test transactions');
    return;
  }
  
  // Verify transactions were saved
  const savedTransactions = readJSON(transactionsFile);
  const userTransactions = savedTransactions.transactions.filter(t => t.userId === user.id);
  
  console.log('\n📊 Transaction Summary:');
  console.log('Total transactions in database:', savedTransactions.transactions.length);
  console.log('User transactions:', userTransactions.length);
  
  userTransactions.forEach((t, index) => {
    console.log(`${index + 1}. ${t.type}: ${t.amount} - ${t.description}`);
  });
  
  // Test session persistence
  const sessions = readJSON(sessionsFile) || { sessions: [] };
  const userSessions = sessions.sessions.filter(s => s.userId === user.id);
  
  console.log('\n🔐 Session Summary:');
  console.log('Total sessions:', sessions.sessions.length);
  console.log('User sessions:', userSessions.length);
  
  userSessions.forEach((s, index) => {
    const expiresAt = new Date(s.expiresAt);
    const isExpired = expiresAt < new Date();
    console.log(`${index + 1}. Session ${s.id.substring(0, 8)}... (${isExpired ? 'EXPIRED' : 'ACTIVE'})`);
  });
  
  console.log('\n🎉 Data persistence test completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Go to login.html');
  console.log('2. Enter your seed phrase:');
  console.log('   ' + seedPhrase);
  console.log('3. Click "เข้าสู่ระบบ"');
  console.log('4. Go to dashboard.html');
  console.log('5. Check if your transactions are visible');
  console.log('6. Add new transactions and verify they persist');
}

// Run the test
testDataPersistence().catch(console.error);
