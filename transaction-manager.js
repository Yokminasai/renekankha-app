/**
 * Transaction Manager - Handles saving/loading transactions to backend
 */

// Save transaction to backend
async function saveTransaction(type, amount, description, date) {
	try {
		const response = await fetch('/api/transactions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type,
				amount: Number(amount),
				description: String(description || ''),
				date: date || new Date().toISOString()
			}),
			credentials: 'include'
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.error || 'ไม่สามารถบันทึกได้');
		}

		const data = await response.json();
		return { ok: true, transaction: data.transaction };
	} catch (error) {
		console.error('Save transaction error:', error);
		return { ok: false, error: error.message };
	}
}

// Load all transactions for current user
async function loadTransactions(limit = 500) {
	try {
		const response = await fetch(`/api/transactions?limit=${limit}`, {
			credentials: 'include'
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.error || 'ไม่สามารถโหลดข้อมูลได้');
		}

		const data = await response.json();
		return { ok: true, transactions: data.items || [] };
	} catch (error) {
		console.error('Load transactions error:', error);
		return { ok: false, error: error.message, transactions: [] };
	}
}

// Delete transaction
async function deleteTransaction(transactionId) {
	try {
		const response = await fetch(`/api/transactions/${transactionId}`, {
			method: 'DELETE',
			credentials: 'include'
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.error || 'ไม่สามารถลบได้');
		}

		return { ok: true };
	} catch (error) {
		console.error('Delete transaction error:', error);
		return { ok: false, error: error.message };
	}
}

// Get current authenticated user
async function getCurrentUser() {
	try {
		const response = await fetch('/api/auth/me', {
			credentials: 'include'
		});

		if (!response.ok) {
			return { ok: false, user: null };
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Get user error:', error);
		return { ok: false, user: null };
	}
}
