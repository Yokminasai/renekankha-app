import fs from 'fs';
import path from 'path';

console.log('🔍 Validating database integrity...\n');

const dataDir = path.join(process.cwd(), 'data');

function readJSON(filePath) { 
	try { 
		return JSON.parse(fs.readFileSync(filePath, 'utf8')); 
	} catch { 
		return null; 
	} 
}

// Check users.json
const usersFile = path.join(dataDir, 'users.json');
const usersData = readJSON(usersFile);

if (!usersData) {
	console.error('❌ Cannot read users.json');
	process.exit(1);
}

console.log(`📊 Total users: ${usersData.users.length}\n`);

let issuesFound = false;

usersData.users.forEach((user, idx) => {
	console.log(`User ${idx + 1}: ${user.id} (${user.name || 'no name'})`);
	
	// Check for required fields
	if (!user.id) {
		console.log('  ❌ Missing id');
		issuesFound = true;
	}
	
	if (!user.seedPhraseHash) {
		console.log('  ❌ Missing seedPhraseHash');
		issuesFound = true;
	}
	
	if (!user.anonymous) {
		console.log('  ⚠️  Not marked as anonymous');
	}
	
	// Check legacy status
	if (user.legacy) {
		console.log('  ⚠️  LEGACY user - needs re-registration');
		console.log(`    - seedSalt: ${user.seedSalt || 'missing'}`);
		console.log(`    - seedHashVerify: ${user.seedHashVerify || 'missing'}`);
	} else {
		// Check if has proper verification fields
		if (!user.seedSalt || !user.seedHashVerify) {
			console.log('  ❌ Missing seedSalt or seedHashVerify (not legacy marked!)');
			issuesFound = true;
		}
	}
	
	console.log(`  - Created: ${user.createdAt}`);
	console.log('');
});

// Check sessions
const sessionsFile = path.join(dataDir, 'sessions.json');
const sessionsData = readJSON(sessionsFile);

if (sessionsData) {
	console.log(`📊 Active sessions: ${sessionsData.sessions.length}`);
	
	let expiredCount = 0;
	sessionsData.sessions.forEach(session => {
		if (session.expiresAt && Date.now() > new Date(session.expiresAt).getTime()) {
			expiredCount++;
		}
	});
	
	if (expiredCount > 0) {
		console.log(`  ⚠️  Expired sessions: ${expiredCount}`);
	}
}

console.log('\n' + '='.repeat(50));

if (issuesFound) {
	console.log('❌ Database issues detected!');
	process.exit(1);
} else {
	console.log('✅ Database validation passed!');
	process.exit(0);
}
