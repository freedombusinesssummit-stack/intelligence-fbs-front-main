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
import { getLeadProgram } from '@/lib/leadFilters';

/* ================= TYPES ================= */

export type Lead = {
	id: number;
	name: string;
	country: string;
	flag: string;
	tier: 'HOT' | 'WARM' | 'COLD';
	score: number | null;
	progress?: number;
	program: string;
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

function renderCell(col: ColumnId, lead: Lead) {
	switch (col) {
		case 'name':
			return (
				<div>
					<div className='font-bold'>{lead.name}</div>
					{lead.nationality && (
						<div className='text-[10px] mt-0.5 font-medium text-gray-400 flex items-center gap-1'>
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
			return <TierBadge tier={lead.tier} />;
		case 'score':
			return <span>{lead.score ?? '—'}</span>;
		case 'leadStatus':
			return <LeadStatusBadge tier={lead.leadStatus} />;
		case 'program':
			return (
				<span className='truncate max-w-35 block' title={lead.program}>
					{lead.program}
				</span>
			);
		case 'timeline':
			return (
				<span className='truncate max-w-30 block' title={lead.timeline}>
					{lead.timeline}
				</span>
			);
		case 'status':
			return <StatusBadge status={lead.status} />;
		case 'date':
			return (
				<span>
					{new Date(String(lead['Submitted at'])).toLocaleString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
					})}
				</span>
			);
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
	const partnerFormIds = useLeadStore(s => s.partnerFormIds);
	const programFilter = useLeadStore(s => s.programFilter);
	const utmFilter = useLeadStore(s => s.utmFilter);

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

	if (programFilter) {
		filteredLeads = filteredLeads.filter(
			lead => getLeadProgram(lead) === programFilter,
		);
	}

	if (utmFilter) {
		filteredLeads = filteredLeads.filter(lead => lead.utm_source === utmFilter);
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
	const gridTemplate = visibleDefs.map(() => '1fr').join(' ') + ' 30px';

	return (
		<div className='flex h-full'>
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
						className='grid items-center px-4 py-3 border-b border-gray-300 text-sm hover:bg-gray-50 cursor-pointer'
						style={{ gridTemplateColumns: gridTemplate }}
					>
						{visibleDefs.map(col => (
							<div key={col.id}>{renderCell(col.id, lead)}</div>
						))}

						<div>
							<button
								className='cursor-pointer text-gray-400 hover:text-black'
								onClick={e => {
									e.stopPropagation();
									setActiveLead(lead);
								}}
							>
								→
							</button>
						</div>
					</div>
				))}
			</div>

			{activeLead && (
				<DetailPanel lead={activeLead} onClose={() => setActiveLead(null)} />
			)}
		</div>
	);
};

export default LeadsTable;
