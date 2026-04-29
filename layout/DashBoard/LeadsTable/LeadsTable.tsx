'use client';

import React, { useState } from 'react';
import DetailPanel from '../DetailPanel/DetailPanel';
import { useLeadStore } from '@/store/leadStore';
import TierBadge from '@/components/TierBadge/TierBadge';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import HeaderLeadTable from '@/components/HeaderLeadTable/HeaderLeadTable';
import ReactCountryFlag from 'react-country-flag';
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
	date: string;
	type: 'shared' | 'exclusive';
	phone?: string;
	email?: string;
	callId?: string;
	'Submitted at': string;
	'Call Outcome': string;
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
};

export const getCountryCode = (country: string) => {
	return countryMap[country] || 'UN'; // fallback
};

/* ================= COMPONENT ================= */

const LeadsTable = () => {
	const { leads, filter, sortField, sortOrder, search } = useLeadStore();

	const [activeLead, setActiveLead] = useState<Lead | null>(null);

	let filteredLeads =
		filter === 'ALL' ? leads : leads.filter(lead => lead.tier === filter);

	if (sortField && sortOrder !== 'default') {
		filteredLeads = [...filteredLeads].sort((a, b) => {
			const aVal = a[sortField];
			const bVal = b[sortField];

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

	return (
		<div className='flex h-full'>
			<div className='flex-1 overflow-auto max-h-[calc(100vh-165px)] overflow-auto'>
				{/* HEADER */}
				<HeaderLeadTable />

				{/* ROWS */}
				{reversedLeads.map(lead => {
					console.log(lead);
					return (
						<div
							key={lead.id}
							onClick={() => setActiveLead(lead)}
							className='grid grid-cols-[30px_2fr_1fr_1fr_1fr_1fr_1fr_1fr_30px] items-center px-4 py-3 border-b border-gray-300 text-sm hover:bg-gray-50 cursor-pointer'
						>
							<div>
								<input type='checkbox' onClick={e => e.stopPropagation()} />
							</div>

							<div>
								<div className='font-bold'>{lead.name}</div>
								<div className='text-xs text-gray-500'>
									<div className='text-xs text-gray-500 flex items-center gap-1'>
										<ReactCountryFlag
											countryCode={getCountryCode(lead.country)}
											svg
											style={{ width: '16px', height: '16px' }}
										/>
										{lead.country}
									</div>{' '}
								</div>
							</div>

							<div>
								<TierBadge tier={lead.tier} />
							</div>
							<div>{lead.score ?? '—'}</div>
							<div>{lead.program}</div>
							<div>{lead.timeline}</div>
							<div>
								<StatusBadge status={lead.status} />
							</div>
							<div>
								{new Date(String(lead['Submitted at'])).toLocaleString(
									'en-US',
									{
										year: 'numeric',
										month: 'short',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									},
								)}
							</div>

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
					);
				})}
			</div>

			{activeLead && (
				<DetailPanel lead={activeLead} onClose={() => setActiveLead(null)} />
			)}
		</div>
	);
};

export default LeadsTable;
