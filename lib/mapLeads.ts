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
		id: item.id,

		name: item['Name'] || 'No name',

		country: item["Respondent's country"] || 'Unknown',
		flag: getFlag(item["Respondent's country"]),

		tier: mapTier(item['Lead Status']?.value),

		score: null,
		progress: 0,

		program:
			item[
				'What residency or citizenship program is appealing to you the most?'
			] || '—',

		timeline: '—',

		status: mapStatus(item['Call Status']?.value),

		date: formatDate(item['Submitted at']),

		type: 'shared',
	}));
}
