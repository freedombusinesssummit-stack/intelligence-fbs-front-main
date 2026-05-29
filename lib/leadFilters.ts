import type { Lead } from '@/layout/DashBoard/LeadsTable/LeadsTable';

const PROGRAM_PATTERNS = ['residency program is appealing', 'residency or citizenship program'];

export function getLeadProgram(lead: Lead): string | null {
	if (lead.program && lead.program !== '—') return lead.program;
	if (!lead.answers) return null;
	for (const section of Object.values(lead.answers)) {
		for (const [key, val] of Object.entries(section)) {
			const kl = key.toLowerCase();
			if (PROGRAM_PATTERNS.some(p => kl.includes(p))) {
				return typeof val === 'string' && val.trim() ? val : null;
			}
		}
	}
	return null;
}

export function uniqueSorted(values: (string | null | undefined)[]): string[] {
	return [...new Set(values.filter((v): v is string => !!v && v !== '—'))].sort();
}
