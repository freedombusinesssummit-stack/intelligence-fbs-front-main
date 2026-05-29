import { Lead } from '@/layout/DashBoard/LeadsTable/LeadsTable';

function mapTier(value?: string): Lead['tier'] {
	if (!value) return 'COLD';
	const v = value.trim().toUpperCase();
	if (v === 'A' || v.includes('HOT')) return 'HOT';
	if (v === 'B' || v.includes('WARM')) return 'WARM';
	return 'COLD';
}

function mapStatus(status?: string): Lead['status'] {
	if (!status) return 'Pending';

	if (status === 'completed') return 'Completed';

	return 'Pending';
}

function formatDate(date?: string) {
	if (!date) return '—';

	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
	});
}

function getFlag(country?: string) {
	if (!country) return '🌍';

	const flags: Record<string, string> = {
		Ukraine: '🇺🇦',
		USA: '🇺🇸',
		Greece: '🇬🇷',
	};

	return flags[country] || '🌍';
}

export function mapLeads(raw: Record<string, unknown>[]): Lead[] {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (raw as any[]).map(item => ({
		...item,

		id: item.id,

		name: item['Name'] || 'No name',
		email: item['Email'] || '',
		phone: item['Phone number'] || '',
		country:
			item["Respondent's country"] ||
			item['What is your nationality'] ||
			item.country ||
			'Unknown',
		callId: item['Vapi Call ID'],
		formId: item['Form ID'] || undefined,

		flag: getFlag(item["Respondent's country"] || item.country),

		/* ---------------- TIER ---------------- */
		tier: mapTier(item['Tier']?.value ?? item['Tier']) || 'COLD',
		leadStatus: item['Lead Status']?.value ?? item['Lead Status'] ?? 'New',

		/* ---------------- SCORE ---------------- */
		score: (() => {
			const s = Number(item['Score']);
			return item['Score'] != null && item['Score'] !== '' && !isNaN(s) ? s : null;
		})(),
		progress: 0,

		/* ---------------- PROGRAM ---------------- */
		program:
			item['Programme'] ||
			item['If you would chose jurisdiction for incorporation ?'] ||
			item['What residency or citizenship program is appealing to you the most?'] ||
			'—',

		/* ---------------- TIMELINE ---------------- */
		timeline:
			item['Timeline'] ||
			item['Your Global Mobility Readiness ?'] ||
			item['Are you actively considering relocating within 12 months?'] ||
			'—',

		/* ---------------- STATUS ---------------- */
		status: mapStatus(item['Call Status']?.value) || item.status || 'Pending',

		/* ---------------- DATE ---------------- */
		date: formatDate(item['Submitted at']),

		type: item.type || 'shared',

		/* ---------------- ANSWERS ---------------- */
		answers: (() => {
			const raw = item['Answers'];
			if (!raw) return undefined;
			if (typeof raw === 'object') return raw;
			try { return JSON.parse(raw as string); } catch { return undefined; }
		})(),

		/* ---------------- UTM ---------------- */
		utm_source: item['UTM Source'] || item['utm_source'] || undefined,
		...(() => {
			const utmStr = item['UTM'];
			if (!utmStr) return {};
			try {
				const utm = typeof utmStr === 'string' ? JSON.parse(utmStr) : utmStr;
				return {
					utm_medium: utm.utm_medium || undefined,
					utm_campaign: utm.utm_campaign || undefined,
				};
			} catch { return {}; }
		})(),
	}));
}
