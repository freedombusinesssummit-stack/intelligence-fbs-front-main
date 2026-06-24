import { Lead } from '@/layout/DashBoard/LeadsTable/LeadsTable';


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

const US_STATES = new Set([
	'alabama','alaska','arizona','arkansas','california','colorado','connecticut',
	'delaware','florida','georgia','hawaii','idaho','illinois','indiana','iowa',
	'kansas','kentucky','louisiana','maine','maryland','massachusetts','michigan',
	'minnesota','mississippi','missouri','montana','nebraska','nevada',
	'new hampshire','new jersey','new mexico','new york','north carolina',
	'north dakota','ohio','oklahoma','oregon','pennsylvania','rhode island',
	'south carolina','south dakota','tennessee','texas','utah','vermont',
	'virginia','washington','west virginia','wisconsin','wyoming',
	// common US cities often entered as nationality
	'los angeles','new york city','nyc','chicago','houston','phoenix','san antonio',
	'san diego','dallas','san jose','austin','jacksonville','fort worth','columbus',
	'charlotte','san francisco','indianapolis','seattle','denver','nashville',
	'boston','el paso','portland','las vegas','memphis','louisville','baltimore',
	'milwaukee','albuquerque','tucson','fresno','sacramento','mesa','kansas city',
	'atlanta','omaha','colorado springs','raleigh','long beach','virginia beach',
	'minneapolis','tampa','new orleans','cleveland','honolulu','anaheim','miami',
	// informal
	'america','american','us citizen','usa citizen',
]);

function normalizeNationality(v: string): string {
	const lower = v.trim().toLowerCase().replace(/\bstate\b/g, '').replace(/\s+/g, ' ').trim();
	const parts = lower.split(/[\s,]+/).filter(Boolean);
	if (US_STATES.has(lower)) return 'United States';
	if (parts.length >= 1 && US_STATES.has(parts[0])) return 'United States';
	if (parts.length >= 2 && US_STATES.has(parts.slice(-1)[0])) return 'United States';
	if (parts.length >= 2 && US_STATES.has(parts.slice(-2).join(' '))) return 'United States';
	if (parts.length >= 2 && US_STATES.has(parts.slice(0, 2).join(' '))) return 'United States';
	return v.trim();
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
		tier: (() => {
			const s = Number(item['Score']);
			if (!isNaN(s) && item['Score'] != null && item['Score'] !== '') {
				if (s <= 24) return 'NURTURE';
				if (s <= 49) return 'QUALIFIED';
				if (s <= 69) return 'WARM';
				return 'HOT';
			}
			return 'NURTURE';
		})(),
		leadStatus: item['Lead Status']?.value ?? item['Lead Status'] ?? 'New',

		/* ---------------- SCORE ---------------- */
		score: (() => {
			const s = Number(item['Score']);
			return item['Score'] != null && item['Score'] !== '' && !isNaN(s) ? s : null;
		})(),
		progress: 0,

		/* ---------------- RESIDENCY HELPERS ---------------- */
		...(() => {
			function parseAnswers(raw: unknown): Record<string, unknown> | null {
				if (!raw) return null;
				if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return null; } }
				if (typeof raw === 'object') return raw as Record<string, unknown>;
				return null;
			}

			function allEntries(raw: unknown): [string, unknown][] {
				const obj = parseAnswers(raw);
				if (!obj) return [];
				const result: [string, unknown][] = [];
				for (const [key, val] of Object.entries(obj)) {
					result.push([key, val]);
					if (val && typeof val === 'object') {
						for (const e of Object.entries(val as Record<string, unknown>)) result.push(e);
					}
				}
				return result;
			}

			const entries = allEntries(item['Answers']);

			// Primary: "What residency or citizenship program is appealing to you the most?"
			const primary =
				entries.find(([k, v]) => k.toLowerCase().includes('residency or citizenship program') && typeof v === 'string' && (v as string).trim())?.[1] as string | undefined
				?? item['What residency or citizenship program is appealing to you the most?'] as string | undefined
				?? item['Programme'] as string | undefined;

			// Alternative: "What residency program is appealing to you the most" (NO "or citizenship")
			const altRaw =
				entries.find(([k, v]) => k.toLowerCase().includes('residency program is appealing') && !k.toLowerCase().includes('or citizenship') && typeof v === 'string' && (v as string).trim())?.[1] as string | undefined
				?? item['What residency program is appealing to you the most'] as string | undefined;

			const programme = primary?.trim() || '—';
			const residency = altRaw ? altRaw.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

			// Incorporation: "If you would chose jurisdiction for incorporation?"
			const incorporationRaw =
				entries.find(([k]) => k.toLowerCase().includes('jurisdiction for incorporation'))?.[1] as string | undefined;
			const incorporation = incorporationRaw ? incorporationRaw.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

			return {
				programme,
				residency,
				incorporation,
				// keep for filter compat
				program: programme,
				programs: residency.length > 0 ? residency : (programme !== '—' ? [programme] : []),
			};
		})(),

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

		/* ---------------- NATIONALITY ---------------- */
		nationality: (() => {
			const direct = item['What is your nationality'] ?? item['What is your nationality 🌏 ?'];
			if (direct != null) return normalizeNationality(String(direct));

			const raw = item['Answers'];
			const answers = raw
				? typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : raw
				: null;

			if (answers && typeof answers === 'object') {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const a = answers as any;
				const personal = a['personal'];
				if (personal && typeof personal === 'object') {
					const nat = personal['What is your nationality 🌏 ?'] ?? personal['What is your nationality'];
					if (nat != null) return normalizeNationality(String(nat));
					const loc = personal['Where are you located now 🌏 ?'] ?? personal['Where are you located now'];
					if (loc != null) return normalizeNationality(String(loc));
				}
				// fallback: search all sections
				for (const section of Object.values(a)) {
					if (!section || typeof section !== 'object') continue;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const s = section as any;
					const loc = s['Where are you located now 🌏 ?'] ?? s['Where are you located now'];
					if (loc != null) return normalizeNationality(String(loc));
				}
			}
			return undefined;
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
