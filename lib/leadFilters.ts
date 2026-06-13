import type { Lead } from '@/layout/DashBoard/LeadsTable/LeadsTable';

export function getLeadPrograms(lead: Lead): string[] {
	if (lead.programs && lead.programs.length > 0) return lead.programs;
	if (lead.program && lead.program !== '—') return [lead.program];
	return [];
}

export function getLeadProgram(lead: Lead): string | null {
	const ps = getLeadPrograms(lead);
	return ps[0] ?? null;
}

// Canonical aliases: maps normalized location name → canonical key
const LOCATION_ALIASES: Record<string, string> = {
	dubai: 'uae',
	'abu dhabi': 'uae',
	'united arab emirates': 'uae',
	'the uae': 'uae',
	'united states': 'usa',
	'united states of america': 'usa',
	america: 'usa',
	'the us': 'usa',
	'united kingdom': 'uk',
	england: 'uk',
	'great britain': 'uk',
	britain: 'uk',
};

export function normalizeProgram(s: string): string {
	const stripped = s
		.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '') // strip flag emoji pairs
		.replace(/^get\s+residency\s+in\s+/i, '')
		.replace(/^i\s+want\s+(to\s+get\s+)?residency\s+(in\s+)?/i, '')
		.replace(/^residency\s+in\s+/i, '')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase();
	return LOCATION_ALIASES[stripped] ?? stripped;
}

// Higher score = preferred display label
function scoreProgram(s: string): number {
	let score = 0;
	if (/[\u{1F1E6}-\u{1F1FF}]/u.test(s)) score += 10; // has flag emoji
	if (/^get\s+residency/i.test(s)) score -= 8; // filler prefix
	if (/^i\s+want/i.test(s)) score -= 8;
	if (/^residency\s+in\s+/i.test(s)) score -= 4;
	score -= s.length * 0.05; // prefer shorter
	return score;
}

export function uniqueSorted(values: (string | null | undefined)[]): string[] {
	const filtered = values.filter((v): v is string => !!v && v !== '—');
	const seen = new Map<string, string>();
	for (const v of filtered) {
		const key = normalizeProgram(v);
		if (!seen.has(key)) {
			seen.set(key, v);
		} else {
			const existing = seen.get(key)!;
			if (scoreProgram(v) > scoreProgram(existing)) seen.set(key, v);
		}
	}
	return [...seen.values()].sort();
}
