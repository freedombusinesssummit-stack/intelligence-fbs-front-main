'use client';

import React, { useState } from 'react';
import DetailPanel from '../DetailPanel/DetailPanel';
import { useLeadStore } from '@/store/leadStore';
import TierBadge from '@/components/TierBadge/TierBadge';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import HeaderLeadTable from '@/components/HeaderLeadTable/HeaderLeadTable';

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
};

type Props = {
	leads: Lead[];
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

	return (
		<div className='flex h-full'>
			<div className='flex-1 overflow-auto'>
				{/* HEADER */}
				<HeaderLeadTable />

				{/* ROWS */}
				{filteredLeads.map(lead => (
					<div
						key={lead.id}
						onClick={() => setActiveLead(lead)}
						className='grid grid-cols-[30px_3fr_1fr_1fr_1fr_1fr_1fr_1fr_30px] items-center px-4 py-3 border-b border-gray-300 text-sm hover:bg-gray-50 cursor-pointer'
					>
						<div>
							<input type='checkbox' onClick={e => e.stopPropagation()} />
						</div>

						<div>
							<div className='font-bold'>{lead.name}</div>
							<div className='text-xs text-gray-500'>
								{lead.flag} {lead.country}
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
						<div>{lead.date}</div>

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
