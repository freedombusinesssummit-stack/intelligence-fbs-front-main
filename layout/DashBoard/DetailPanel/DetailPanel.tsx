'use client';

import React from 'react';
import { Lead } from '../LeadsTable/LeadsTable';

type Props = {
	lead: Lead;
	onClose: () => void;
};

function getScoreDescription(tier: Lead['tier']): string {
	switch (tier) {
		case 'HOT':
			return 'High intent lead — ready to convert';
		case 'WARM':
			return 'Moderate interest — needs follow-up';
		case 'COLD':
			return 'Low intent — long-term nurture';
		default:
			return '';
	}
}

const DetailPanel: React.FC<Props> = ({ lead, onClose }) => {
	return (
		<div className='w-[340px] border-l border-gray-300 h-[60vh] bg-white p-4 flex flex-col'>
			{/* HEADER */}
			<div className='flex justify-between items-start mb-4'>
				<div>
					<div className='font-semibold text-gray-900'>{lead.name}</div>

					<div className='text-xs text-gray-500'>
						{lead.flag} {lead.country}
					</div>
				</div>

				<button onClick={onClose} className='text-gray-400 hover:text-black'>
					✕
				</button>
			</div>

			{/* SCORE */}
			<div className='mb-5'>
				<div className='text-xs text-gray-400 mb-2'>GMSI Score</div>

				<div className='flex items-center gap-3'>
					<div className='w-12 h-12 flex items-center justify-center rounded-full border text-lg font-semibold'>
						{lead.score ?? '—'}
					</div>

					<div>
						<div className='text-sm font-medium'>{lead.tier}</div>

						<div className='text-xs text-gray-500'>
							{getScoreDescription(lead.tier)}
						</div>
					</div>
				</div>
			</div>

			{/* PROFILE */}
			<div className='mb-4'>
				<div className='text-xs text-gray-400 mb-1'>Profile</div>

				<div className='text-sm text-gray-700'>{lead.program}</div>
			</div>

			{/* VERBATIM */}
			<div className='mb-4'>
				<div className='text-xs text-gray-400 mb-1'>What They Said</div>

				<div className='text-sm bg-gray-50 p-3 rounded-md text-gray-700'>
					“Sample user quote...”
				</div>
			</div>

			{/* ACTIONS */}
			<div className='mt-4'>
				<button className='w-full bg-black text-white py-2 rounded-md text-sm hover:opacity-90 transition'>
					Contact Lead
				</button>
			</div>
		</div>
	);
};

export default DetailPanel;
