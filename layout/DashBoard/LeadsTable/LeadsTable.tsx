'use client';

import React, { useState } from 'react';
import DetailPanel from '../DetailPanel/DetailPanel';
import { useLeadStore } from '@/store/leadStore';
import TierBadge from '@/components/TierBadge/TierBadge';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import HeaderLeadTable from '@/components/HeaderLeadTable/HeaderLeadTable';
import ReactCountryFlag from 'react-country-flag';
import LeadStatusBadge from '@/components/LeadStatusBadge/LeadStatusBadge';
import { COLUMN_DEFS } from '@/lib/columns';
import type { ColumnId } from '@/lib/columns';
import { getLeadPrograms, normalizeProgram } from '@/lib/leadFilters';

/* ================= TIMELINE PARSER ================= */

function parseTimeline(s: string): { top: string; bottom: string } | null {
	if (!s || s === '—') return null;
	// "emoji timeframe - label"  e.g. "⚙️ 6-9 months - Planning Move"
	const dashIdx = s.indexOf(' - ');
	if (dashIdx !== -1) {
		return { top: s.slice(0, dashIdx).trim(), bottom: s.slice(dashIdx + 3).trim() };
	}
	// "emoji label for/in the next timeframe"
	const m = s.match(/^(.+?)\s+(?:for|in)\s+the\s+next\s+(.+)$/i);
	if (m) {
		return { top: m[2].trim(), bottom: m[1].trim() };
	}
	return null;
}

/* ================= TYPES ================= */

export type Lead = {
	id: number;
	name: string;
	country: string;
	flag: string;
	tier: 'HOT' | 'WARM' | 'QUALIFIED' | 'NURTURE';
	score: number | null;
	progress?: number;
	program: string;
	programs: string[];
	programme: string;
	incorporation: string[];
	residency: string[];
	timeline: string;
	status: 'Completed' | 'In Call' | 'Pending' | 'No Answer';
	leadStatus: 'New' | 'Contacted';
	date: string;
	type: 'shared' | 'exclusive';
	phone?: string;
	email?: string;
	callId?: string;
	formId?: string;
	'Submitted at': string;
	'Call Outcome': string;
	utm_source?: string;
	utm_medium?: string;
	utm_campaign?: string;
	nationality?: string;
	answers?: Record<string, Record<string, unknown>>;
};

type Props = {
	leads: Lead[];
};

const countryMap: Record<string, string> = {
	American: 'US',
	British: 'GB',
	Turkish: 'TR',
	Canadian: 'CA',
	Ukrainian: 'UA',
	Ukraine: 'UA',
	Australian: 'AU',
	Italian: 'IT',
	Dutch: 'NL',
	Israeli: 'IL',
	German: 'DE',
	Spanish: 'ES',
	French: 'FR',
	Nigerian: 'NG',
	Russian: 'RU',
	Chinese: 'CN',
	Indian: 'IN',
	Brazilian: 'BR',
	Mexican: 'MX',
	'South African': 'ZA',
	Egyptian: 'EG',
	Saudi: 'SA',
	Emirati: 'AE',
	Pakistani: 'PK',
	Bangladeshi: 'BD',
	Indonesian: 'ID',
	Filipino: 'PH',
	Vietnamese: 'VN',
	Thai: 'TH',
	Malaysian: 'MY',
	Singaporean: 'SG',
	Japanese: 'JP',
	Korean: 'KR',
	Polish: 'PL',
	Romanian: 'RO',
	Greek: 'GR',
	Portuguese: 'PT',
	Swedish: 'SE',
	Norwegian: 'NO',
	Danish: 'DK',
	Finnish: 'FI',
	Swiss: 'CH',
	Austrian: 'AT',
	Belgian: 'BE',
	Czech: 'CZ',
	Hungarian: 'HU',
	Argentinian: 'AR',
	Colombian: 'CO',
	Chilean: 'CL',
	Peruvian: 'PE',
	Kenyan: 'KE',
	Ghanaian: 'GH',
	Moroccan: 'MA',
	Algerian: 'DZ',
	Tunisian: 'TN',
	Lebanese: 'LB',
	Iranian: 'IR',
	Iraqi: 'IQ',
	Jordanian: 'JO',
	Kuwaiti: 'KW',
	Qatari: 'QA',
	Bahraini: 'BH',
	Omani: 'OM',
	Kazakh: 'KZ',
	Uzbek: 'UZ',
	Georgian: 'GE',
	Armenian: 'AM',
	Azerbaijani: 'AZ',
	Belarusian: 'BY',
	Lithuanian: 'LT',
	Latvian: 'LV',
	Estonian: 'EE',
	Serbian: 'RS',
	Croatian: 'HR',
	Bulgarian: 'BG',
	Slovak: 'SK',
	Slovenian: 'SI',

	// Country names & abbreviations (from "Where are you located now")
	USA: 'US',
	'United States': 'US',
	'United States of America': 'US',
	'In the U.S.': 'US',
	'In the US': 'US',
	US: 'US',
	UK: 'GB',
	'United Kingdom': 'GB',
	England: 'GB',
	Scotland: 'GB',
	UAE: 'AE',
	'United Arab Emirates': 'AE',
	Dubai: 'AE',
	'Abu Dhabi': 'AE',
	Russia: 'RU',
	China: 'CN',
	India: 'IN',
	Brazil: 'BR',
	Mexico: 'MX',
	Canada: 'CA',
	Australia: 'AU',
	Germany: 'DE',
	France: 'FR',
	Italy: 'IT',
	Spain: 'ES',
	Portugal: 'PT',
	Netherlands: 'NL',
	Belgium: 'BE',
	Switzerland: 'CH',
	Austria: 'AT',
	Sweden: 'SE',
	Norway: 'NO',
	Denmark: 'DK',
	Finland: 'FI',
	Poland: 'PL',
	Romania: 'RO',
	Hungary: 'HU',
	'Czech Republic': 'CZ',
	Czechia: 'CZ',
	Serbia: 'RS',
	Croatia: 'HR',
	Bulgaria: 'BG',
	Slovakia: 'SK',
	Slovenia: 'SI',
	Greece: 'GR',
	Turkey: 'TR',
	Israel: 'IL',
	Japan: 'JP',
	'South Korea': 'KR',
	Korea: 'KR',
	Singapore: 'SG',
	Malaysia: 'MY',
	Thailand: 'TH',
	Vietnam: 'VN',
	Indonesia: 'ID',
	Philippines: 'PH',
	Pakistan: 'PK',
	Bangladesh: 'BD',
	Egypt: 'EG',
	Morocco: 'MA',
	Nigeria: 'NG',
	Kenya: 'KE',
	Ghana: 'GH',
	'South Africa': 'ZA',
	Lebanon: 'LB',
	Jordan: 'JO',
	Kuwait: 'KW',
	Qatar: 'QA',
	Bahrain: 'BH',
	Oman: 'OM',
	'Saudi Arabia': 'SA',
	Kazakhstan: 'KZ',
	Uzbekistan: 'UZ',
	Georgia: 'GE',
	Armenia: 'AM',
	Azerbaijan: 'AZ',
	Belarus: 'BY',
	Lithuania: 'LT',
	Latvia: 'LV',
	Estonia: 'EE',
	Argentina: 'AR',
	Colombia: 'CO',
	Chile: 'CL',
	Peru: 'PE',
	Panama: 'PA',
	Malta: 'MT',
	Cyprus: 'CY',
	Ireland: 'IE',
	Ecuador: 'EC',
	Ecuadorian: 'EC',
	Sudan: 'SD',
	Sudanese: 'SD',
};

export const getCountryCode = (country: string) => {
	return countryMap[country] || 'UN';
};

export function getNationalityCode(nationality: string): string | null {
	// Extract country code from a leading flag emoji (e.g. "🇺🇸 US Citizen" → "US")
	const chars = [...nationality];
	if (chars.length >= 2) {
		const cp1 = chars[0].codePointAt(0);
		const cp2 = chars[1].codePointAt(0);
		if (
			cp1 &&
			cp2 &&
			cp1 >= 0x1f1e6 &&
			cp1 <= 0x1f1ff &&
			cp2 >= 0x1f1e6 &&
			cp2 <= 0x1f1ff
		) {
			return (
				String.fromCharCode(cp1 - 0x1f1e6 + 65) +
				String.fromCharCode(cp2 - 0x1f1e6 + 65)
			);
		}
	}
	// Fall back to text map
	const code = getCountryCode(nationality.trim());
	return code !== 'UN' ? code : null;
}

/* ================= CELL RENDERER ================= */

function renderCell(col: ColumnId, lead: Lead, formNames: Record<string, string>) {
	switch (col) {
		case 'form':
			return lead.formId ? (
				<span
					className='block text-[13px] leading-tight wrap-break-word text-gray-600'
					title={formNames[lead.formId] ?? lead.formId}
				>
					{formNames[lead.formId] ?? lead.formId}
				</span>
			) : (
				<span className='text-gray-300'>—</span>
			);
		case 'name':
			return (
				<div>
					<div className='font-semibold text-sm'>{lead.name}</div>
					{lead.nationality && (
						<div className='text-[11px] mt-0.5 font-medium text-gray-400 flex items-center gap-1'>
							{(() => {
								const code = getNationalityCode(lead.nationality);
								return code ? (
									<ReactCountryFlag
										countryCode={code}
										svg
										style={{ width: '12px', height: '12px' }}
									/>
								) : null;
							})()}
							{lead.nationality}
						</div>
					)}
				</div>
			);
		case 'tier':
			return (
				<div className='pt-0.5'>
					<TierBadge tier={lead.tier} />
				</div>
			);
		case 'score':
			return (
				<span className='text-[15px] pt-0.5 block'>
					{lead.score ?? '—'}
					{lead.score != null && (
						<span className='text-[11px] text-gray-400'>/100</span>
					)}
				</span>
			);
		case 'leadStatus':
			return (
				<div className='pt-0.5'>
					<LeadStatusBadge tier={lead.leadStatus} />
				</div>
			);
		case 'programme':
			return lead.programme && lead.programme !== '—' ? (
				<span
					className='block text-[13px] leading-tight wrap-break-word'
					title={lead.programme}
				>
					{lead.programme}
				</span>
			) : (
				<span className='text-gray-300'>—</span>
			);
		case 'incorporation':
			return lead.incorporation.length > 0 ? (
				<div className='flex flex-col gap-0.5'>
					{lead.incorporation.map((p: string, i: number) => (
						<span
							key={i}
							className='block text-[13px] leading-tight wrap-break-word'
							title={p}
						>
							{p}
						</span>
					))}
				</div>
			) : (
				<span className='text-gray-300'>—</span>
			);
		case 'residency':
			return lead.residency.length > 0 ? (
				<div className='flex flex-col gap-0.5'>
					{lead.residency.map((p: string, i: number) => (
						<span
							key={i}
							className='block text-[13px] leading-tight wrap-break-word'
							title={p}
						>
							{p}
						</span>
					))}
				</div>
			) : (
				<span className='text-gray-300'>—</span>
			);
		case 'timeline': {
			const tl = parseTimeline(lead.timeline);
			if (tl) {
				return (
					<div className='leading-tight'>
						<div className='text-[13px] text-gray-600 truncate'>{tl.top}</div>
						<div className='text-[11px] text-gray-400 truncate'>{tl.bottom}</div>
					</div>
				);
			}
			return (
				<span className='truncate max-w-50 block text-[13px] text-gray-600' title={lead.timeline}>
					{lead.timeline}
				</span>
			);
		}
		case 'status':
			return <StatusBadge status={lead.status} />;
		case 'date': {
			const d = new Date(String(lead['Submitted at']));
			return (
				<div className='leading-tight'>
					<div className='text-[12px] text-gray-700 font-medium'>
						{d.toLocaleDateString('en-US', {
							month: 'short',
							day: 'numeric',
							year: 'numeric',
						})}
					</div>
					<div className='text-[11px] text-gray-400'>
						{d.toLocaleTimeString('en-US', {
							hour: '2-digit',
							minute: '2-digit',
						})}
					</div>
				</div>
			);
		}
		default:
			return null;
	}
}

/* ================= COMPONENT ================= */

const LeadsTable = () => {
	const leads = useLeadStore(s => s.leads);
	const filter = useLeadStore(s => s.filter);
	const sortField = useLeadStore(s => s.sortField);
	const sortOrder = useLeadStore(s => s.sortOrder);
	const search = useLeadStore(s => s.search);
	const visibleColumns = useLeadStore(s => s.visibleColumns);
	const formNames = useLeadStore(s => s.formNames);
	const partnerFormIds = useLeadStore(s => s.partnerFormIds);
	const programFilter = useLeadStore(s => s.programFilter);
	const programmeFilter = useLeadStore(s => s.programmeFilter);
	const incorporationFilter = useLeadStore(s => s.incorporationFilter);
	const utmFilter = useLeadStore(s => s.utmFilter);
	const formExclude = useLeadStore(s => s.formExclude);

	const [activeLead, setActiveLead] = useState<Lead | null>(null);

	const partnerLeads =
		partnerFormIds && partnerFormIds.length > 0
			? leads.filter(
					lead => lead.formId && partnerFormIds.includes(lead.formId),
				)
			: leads;

	let filteredLeads =
		filter === 'ALL'
			? partnerLeads
			: partnerLeads.filter(lead => lead.tier === filter);

	if (programFilter && programFilter.length > 0) {
		const normalizedFilter = programFilter.map(normalizeProgram);
		filteredLeads = filteredLeads.filter(lead =>
			getLeadPrograms(lead).some(p =>
				normalizedFilter.includes(normalizeProgram(p)),
			),
		);
	}

	if (programmeFilter && programmeFilter.length > 0) {
		const normalizedFilter = programmeFilter.map(normalizeProgram);
		filteredLeads = filteredLeads.filter(lead =>
			normalizedFilter.includes(normalizeProgram(lead.programme)),
		);
	}

	if (incorporationFilter && incorporationFilter.length > 0) {
		const normalizedFilter = incorporationFilter.map(normalizeProgram);
		filteredLeads = filteredLeads.filter(lead =>
			lead.incorporation.some(p =>
				normalizedFilter.includes(normalizeProgram(p)),
			),
		);
	}

	if (utmFilter) {
		filteredLeads = filteredLeads.filter(lead => lead.utm_source === utmFilter);
	}

	if (formExclude.length > 0) {
		filteredLeads = filteredLeads.filter(lead => !(lead.formId && formExclude.includes(lead.formId)));
	}

	if (sortField && sortOrder !== 'default') {
		filteredLeads = [...filteredLeads].sort((a, b) => {
			const aVal = a[sortField as keyof Lead];
			const bVal = b[sortField as keyof Lead];

			if (aVal == null) return 1;
			if (bVal == null) return -1;

			if (typeof aVal === 'number' && typeof bVal === 'number') {
				return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
			}

			return sortOrder === 'asc'
				? String(aVal).localeCompare(String(bVal))
				: String(bVal).localeCompare(String(aVal));
		});
	}

	if (search.trim()) {
		const q = search.toLowerCase();
		filteredLeads = filteredLeads.filter(lead =>
			[lead.name, lead.country, lead.program, lead.status]
				.join(' ')
				.toLowerCase()
				.includes(q),
		);
	}

	const reversedLeads = [...filteredLeads].reverse();

	const visibleDefs = COLUMN_DEFS.filter(c => visibleColumns.includes(c.id));
	const gridTemplate = visibleDefs.map(c => c.width ?? '1fr').join(' ');

	return (
		<div className='relative h-full'>
			<div className='flex-1 overflow-auto max-h-[calc(100vh-165px)]'>
				{/* HEADER */}
				<HeaderLeadTable />

				{/* EMPTY STATE */}
				{reversedLeads.length === 0 && (
					<div className='flex flex-col items-center justify-center h-64 text-gray-400 select-none'>
						<svg
							className='w-12 h-12 mb-3 text-gray-300'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={1.5}
								d='M9 12h6m-3-3v6M4 6h16M4 10h16M4 14h10M4 18h8'
							/>
						</svg>
						<p className='text-base font-medium'>No leads found</p>
						<p className='text-sm mt-1'>
							Try adjusting your filters or search query
						</p>
					</div>
				)}

				{/* ROWS */}
				{reversedLeads.map(lead => (
					<div
						key={lead.id}
						onClick={() => setActiveLead(lead)}
						className={`grid items-start gap-x-2 px-4 py-3 border-b border-gray-300 text-sm cursor-pointer transition-colors border-l-3 ${
							activeLead?.id === lead.id
								? 'bg-gray-950/[0.04]'
								: 'border-l-transparent hover:bg-gray-50'
						}`}
						style={{
							gridTemplateColumns: gridTemplate,
							...(activeLead?.id === lead.id
								? { borderLeftColor: '#aaff45' }
								: {}),
						}}
					>
						{visibleDefs.map(col => (
							<div key={col.id}>{renderCell(col.id, lead, formNames)}</div>
						))}
					</div>
				))}
			</div>

			{activeLead && (
				<div
					className='absolute top-[37px] right-0 z-20'
					style={{ height: 'calc(100vh - 165px - 37px)' }}
				>
					<DetailPanel lead={activeLead} onClose={() => setActiveLead(null)} />
				</div>
			)}
		</div>
	);
};

export default LeadsTable;
