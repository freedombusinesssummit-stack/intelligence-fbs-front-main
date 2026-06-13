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

		/* ---------------- PROGRAMS (split by comma) ---------------- */
		programs: (() => {
			function parseAnswers(raw: unknown): Record<string, unknown> | null {
				if (!raw) return null;
				if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return null; } }
				if (typeof raw === 'object') return raw as Record<string, unknown>;
				return null;
			}

			function findInAnswers(raw: unknown): string | null {
				const obj = parseAnswers(raw);
				if (!obj) return null;

				// Collect all [key, val] pairs — flat + nested sections
				const all: [string, unknown][] = [];
				for (const [key, val] of Object.entries(obj)) {
					all.push([key, val]);
					if (val && typeof val === 'object') {
						for (const entry of Object.entries(val as Record<string, unknown>)) all.push(entry);
					}
				}

				// Pass 1: "What residency program is appealing" WITHOUT "or citizenship" — has the full comma list
				for (const [key, val] of all) {
					const kl = key.toLowerCase();
					if (kl.includes('residency program is appealing') && !kl.includes('or citizenship') && typeof val === 'string' && val.trim()) return val;
				}
				// Pass 2: any residency/citizenship key as fallback
				for (const [key, val] of all) {
					const kl = key.toLowerCase();
					if ((kl.includes('residency program is appealing') || kl.includes('residency or citizenship program')) && typeof val === 'string' && val.trim()) return val;
				}
				return null;
			}

			const fromAnswers = findInAnswers(item['Answers']);
			console.log('[programs]', item['Name'], {
				answers_raw_type: typeof item['Answers'],
				answers_parsed: parseAnswers(item['Answers']),
				fromAnswers,
				direct_programme: item['Programme'],
				direct_residency: item['What residency program is appealing to you the most'],
				direct_residency2: item['What residency or citizenship program is appealing to you the most?'],
			});
			if (fromAnswers) return fromAnswers.split(',').map(s => s.trim()).filter(Boolean);

			const raw =
				item['What residency program is appealing to you the most'] ||
				item['What residency or citizenship program is appealing to you the most?'] ||
				item['Programme'] ||
				item['If you would chose jurisdiction for incorporation ?'];
			if (!raw) return [];
			return String(raw).split(',').map(s => s.trim()).filter(Boolean);
		})(),

		/* ---------------- PROGRAM (full raw string, for compat) ---------------- */
		program: (() => {
			function parseAnswers(raw: unknown): Record<string, unknown> | null {
				if (!raw) return null;
				if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return null; } }
				if (typeof raw === 'object') return raw as Record<string, unknown>;
				return null;
			}

			function findInAnswers(raw: unknown): string | null {
				const obj = parseAnswers(raw);
				if (!obj) return null;
				const all: [string, unknown][] = [];
				for (const [key, val] of Object.entries(obj)) {
					all.push([key, val]);
					if (val && typeof val === 'object') {
						for (const entry of Object.entries(val as Record<string, unknown>)) all.push(entry);
					}
				}
				for (const [key, val] of all) {
					const kl = key.toLowerCase();
					if (kl.includes('residency program is appealing') && !kl.includes('or citizenship') && typeof val === 'string' && val.trim()) return val;
				}
				for (const [key, val] of all) {
					const kl = key.toLowerCase();
					if ((kl.includes('residency program is appealing') || kl.includes('residency or citizenship program')) && typeof val === 'string' && val.trim()) return val;
				}
				return null;
			}

			return findInAnswers(item['Answers']) ?? String(
				item['What residency program is appealing to you the most'] ||
				item['What residency or citizenship program is appealing to you the most?'] ||
				item['Programme'] ||
				item['If you would chose jurisdiction for incorporation ?'] ||
				'—',
			);
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
			if (direct != null) return String(direct);

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
					if (nat != null) return String(nat);
					const loc = personal['Where are you located now 🌏 ?'] ?? personal['Where are you located now'];
					if (loc != null) return String(loc);
				}
				// fallback: search all sections
				for (const section of Object.values(a)) {
					if (!section || typeof section !== 'object') continue;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const s = section as any;
					const loc = s['Where are you located now 🌏 ?'] ?? s['Where are you located now'];
					if (loc != null) return String(loc);
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
