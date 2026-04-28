import { Lead } from '@/layout/DashBoard/LeadsTable/LeadsTable';

function mapTier(status?: string): Lead['tier'] {
	if (!status) return 'COLD';

	if (status.toLowerCase().includes('hot')) return 'HOT';
	if (status.toLowerCase().includes('warm')) return 'WARM';

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

export function mapLeads(raw: any[]): Lead[] {
	return raw.map(item => ({
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

		flag: getFlag(item["Respondent's country"] || item.country),

		/* ---------------- TIER ---------------- */
		tier: mapTier(item['Lead Status']?.value) || 'COLD',

		/* ---------------- SCORE (можно потом прокачать) ---------------- */
		score: null,
		progress: 0,

		/* ---------------- PROGRAM ---------------- */
		program:
			item['If you would chose jurisdiction for incorporation ?'] ||
			item[
				'What residency or citizenship program is appealing to you the most?'
			] ||
			'—',

		/* ---------------- TIMELINE ---------------- */
		timeline:
			item['Your Global Mobility Readiness ?'] ||
			item['Are you actively considering relocating within 12 months?'] ||
			'—',

		/* ---------------- STATUS ---------------- */
		status: mapStatus(item['Call Status']?.value) || item.status || 'Pending',

		/* ---------------- DATE ---------------- */
		date: formatDate(item['Submitted at']),

		type: item.type || 'shared',
	}));
}
