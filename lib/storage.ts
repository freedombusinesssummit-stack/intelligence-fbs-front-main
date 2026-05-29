const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function storageGet<T>(key: string): T | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		const { value, expiresAt } = JSON.parse(raw);
		if (expiresAt && Date.now() > expiresAt) {
			localStorage.removeItem(key);
			return null;
		}
		return value as T;
	} catch {
		return null;
	}
}

export function storageSet<T>(key: string, value: T, ttlMs = WEEK_MS): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(key, JSON.stringify({ value, expiresAt: Date.now() + ttlMs }));
	} catch {}
}
