// Auto-Username Assignment Helper
// Assigns sequential usernames: user_1, user_2, user_3, ... user_N

function getNextUsername(users) {
	// Count existing anonymous users
	const anonymousUsers = users.filter(u => u.anonymous);
	// Generate next sequential username
	return 'user_' + (anonymousUsers.length + 1);
}

function assignUsername(userData, allUsers) {
	const nextUsername = getNextUsername(allUsers);
	return {
		...userData,
		username: nextUsername
	};
}

// Usage in server.js:
// const { getNextUsername, assignUsername } = require('./username-assignment.js');
// 
// In /api/auth/anonymous-register:
// const autoUsername = getNextUsername(users.users);
// const user = assignUsername(userData, users.users);

module.exports = { getNextUsername, assignUsername };
