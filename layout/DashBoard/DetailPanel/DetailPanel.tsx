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
	const phone = lead.phone;
	const email = lead.email;

	const whatsappLink = phone
		? `https://wa.me/${phone.replace(/\D/g, '')}`
		: null;

	const telLink = phone ? `tel:${phone}` : null;

	return (
		<div className='w-[380px] border-l border-gray-200 h-full max-h-[calc(85vh)] bg-white flex flex-col shadow-xl'>
			{/* HEADER */}
			<div className='p-5 border-b border-gray-300'>
				<div className='flex justify-between items-start'>
					<div>
						<div className='text-lg font-semibold text-gray-900'>
							{lead.name}
						</div>

						<div className='text-sm text-gray-500 mt-1'>
							{lead.flag} {lead.country}
						</div>
					</div>

					<button
						onClick={onClose}
						className='text-gray-400 hover:text-black text-lg'
					>
						✕
					</button>
				</div>

				{/* CONTACT BUTTONS */}
				<div className='flex gap-2 mt-4'>
					{telLink && (
						<a
							href={telLink}
							className='flex-1 text-center text-sm py-2 rounded-md border hover:bg-gray-50'
						>
							📞 Call
						</a>
					)}

					{whatsappLink && (
						<a
							href={whatsappLink}
							target='_blank'
							className='flex-1 text-center text-sm py-2 rounded-md bg-green-500 text-white hover:opacity-90'
						>
							WhatsApp
						</a>
					)}
				</div>
			</div>

			<div className='flex-1 overflow-auto p-5 space-y-6'>
				{/* SCORE */}
				<div>
					<div className='text-xs text-gray-400 mb-2'>Lead Score</div>

					<div className='flex items-center gap-4'>
						<div className='w-14 h-14 flex items-center justify-center rounded-full border text-lg font-semibold'>
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

				{/* CONTACT INFO */}
				<div>
					<div className='text-xs text-gray-400 mb-2'>Contact</div>

					<div className='space-y-1 text-sm text-gray-700'>
						{email && <div>📧 {email}</div>}
						{phone && <div>📱 {phone}</div>}
					</div>
				</div>

				{/* PROFILE */}
				<div>
					<div className='text-xs text-gray-400 mb-2'>Program</div>
					<div className='text-sm text-gray-700'>{lead.program}</div>
				</div>

				{/* STATUS */}
				<div>
					<div className='text-xs text-gray-400 mb-2'>Status</div>
					<div className='text-sm text-gray-700'>{lead.status}</div>
				</div>

				{/* RAW QUESTIONS (🔥 основное улучшение) */}
				<div>
					<div className='text-xs text-gray-400 mb-2'>Answers</div>

					<div className='space-y-3'>
						{Object.entries(lead)
							.filter(([key, value]) => {
								// фильтруем системные поля
								const excluded = [
									'id',
									'name',
									'country',
									'flag',
									'tier',
									'score',
									'program',
									'timeline',
									'status',
									'date',
									'type',
									'progress',
								];

								return (
									!excluded.includes(key) && value && typeof value !== 'object'
								);
							})
							.map(([key, value]) => (
								<div key={key} className='bg-gray-50 p-3 rounded-md'>
									<div className='text-xs text-gray-400 mb-1'>{key}</div>

									<div className='text-sm text-gray-800'>{String(value)}</div>
								</div>
							))}
					</div>
				</div>
			</div>

			{/* FOOTER */}
			<div className='p-4 border-t border-gray-300'>
				<button className='w-full bg-black text-white py-2 rounded-md text-sm hover:opacity-90 transition'>
					Mark as Contacted
				</button>
			</div>
		</div>
	);
};

export default DetailPanel;
