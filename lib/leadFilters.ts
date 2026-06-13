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

export function uniqueSorted(values: (string | null | undefined)[]): string[] {
	return [...new Set(values.filter((v): v is string => !!v && v !== '—'))].sort();
}
