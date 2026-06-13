'use client';

import React from 'react';
import {
	getCountryCode,
	getNationalityCode,
	Lead,
} from '../LeadsTable/LeadsTable';
import { Flame, Phone, PhoneCall, Snowflake, Thermometer } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import { useLeadStore } from '@/store/leadStore';
type Props = {
	lead: Lead;
	onClose: () => void;
};

function getScoreDescription(tier: Lead['tier']): string {
	switch (tier) {
		case 'HOT':
			return 'High intent — ready to convert';
		case 'WARM':
			return 'Strong interest — prioritise follow-up';
		case 'QUALIFIED':
			return 'Qualified lead — needs nurturing';
		case 'NURTURE':
			return 'Early stage — long-term nurture';
		default:
			return '';
	}
}

function getTierStyles(tier: string) {
	switch (tier) {
		case 'HOT':
			return {
				border: 'border-red-500',
				bg: 'bg-red-50',
				text: 'text-red-600',
				icon: <Flame className='w-5 h-5 text-red-500' />,
			};
		case 'WARM':
			return {
				border: 'border-orange-400',
				bg: 'bg-orange-50',
				text: 'text-orange-500',
				icon: <Thermometer className='w-5 h-5 text-orange-400' />,
			};
		case 'QUALIFIED':
			return {
				border: 'border-green-400',
				bg: 'bg-green-50',
				text: 'text-green-600',
				icon: <Snowflake className='w-5 h-5 text-green-400' />,
			};
		case 'NURTURE':
			return {
				border: 'border-gray-300',
				bg: 'bg-gray-50',
				text: 'text-gray-500',
				icon: <Snowflake className='w-5 h-5 text-gray-400' />,
			};
		default:
			return {
				border: 'border-gray-300',
				bg: 'bg-gray-50',
				text: 'text-gray-500',
				icon: null,
			};
	}
}

const DetailPanel: React.FC<Props> = ({ lead, onClose }) => {
	const phone = lead.phone;
	const email = lead.email;
	const styles = getTierStyles(lead.tier);
	const whatsappLink = phone
		? `https://wa.me/${phone.replace(/\D/g, '')}`
		: null;
	const updateLeadStatus = useLeadStore(state => state.updateLeadStatus);
	return (
		<div className='w-[380px] border-l border-gray-200 max-h-[calc(100vh-165px)] h-[calc(100vh-165px)] bg-white flex flex-col shadow-xl'>
			{/* HEADER */}
			<div className='p-5 border-b border-gray-300'>
				<div className='flex justify-between items-start'>
					<div>
						<div className='text-lg font-semibold text-gray-900'>
							{lead.name}
						</div>
						{lead.nationality && (
							<div className='text-[11px] text-gray-400 flex items-center gap-1 mt-0.5'>
								{(() => {
									const code = getNationalityCode(lead.nationality);
									return code ? (
										<ReactCountryFlag
											countryCode={code}
											svg
											style={{ width: '13px', height: '13px' }}
										/>
									) : null;
								})()}
								{lead.nationality}
							</div>
						)}
					</div>

					<button
						onClick={onClose}
						className='text-gray-400 hover:text-black text-lg'
					>
						✕
					</button>
				</div>
			</div>

			<div className='flex-1 overflow-auto p-5 space-y-4'>
				{/* SCORE */}
				<div>
					<div className='text-xs text-gray-400 mb-2'>Lead Score</div>

					<div className='flex items-center gap-4'>
						<div
							className={`w-14 h-14 flex items-center justify-center rounded-full border font-semibold ${styles.border} ${styles.bg} ${styles.text}`}
						>
							{lead.score !== null ? (
								<span className='text-lg'>{lead.score}</span>
							) : (
								styles.icon // ✅ иконка вместо "-"
							)}
						</div>

						<div>
							<div className={`text-sm font-medium ${styles.text}`}>
								{lead.tier}
							</div>

							<div className='text-xs text-gray-500'>
								{getScoreDescription(lead.tier)}
							</div>
						</div>
					</div>

					{/* {callId && (
						// <a
						// 	href={`https://dashboard.vapi.ai/calls/${callId}`}
						// 	target='_blank'
						// 	rel='noopener noreferrer'
						// 	className='flex gap-2 items-center text-black mt-4  rounded-md text-sm hover:underline transition '
						// >
						// 	<Phone className='text-[#536e32]' width={15} />
						// 	View the call recording
						// </a>
					)} */}
				</div>

				<div className='text-xs text-gray-500 font-bold mb-4 pt-4 border-t border-t-gray-300'>
					Profile
				</div>

				{/* PROFILE */}
				<div className='flex gap-2 justify-between mb-2'>
					<div className='text-xs text-gray-500 mb-1'>Residency</div>
					<div className='text-xs text-gray-800 font-bold text-right'>
						{lead.program}
					</div>
				</div>

				{/* PROFILE */}
				<div className='flex gap-2 justify-between mb-2'>
					<div className='text-xs text-gray-500 mb-1'>Timeline</div>
					<div className='text-xs text-gray-800 font-bold text-right'>
						{lead.timeline}
					</div>
				</div>

				{/* PROFILE */}
				<div className='flex gap-2 justify-between mb-2'>
					<div className='text-xs text-gray-500 mb-1'>Date added</div>
					<div className='text-xs text-gray-800 font-bold text-right'>
						{new Date(String(lead['Submitted at'])).toLocaleString('en-US', {
							year: 'numeric',
							month: 'short',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
						})}
					</div>
				</div>

				{/* STATUS */}
				<div className='flex gap-2 justify-between'>
					<div className='text-xs text-gray-500 mb-1'>Call status</div>
					<div className='text-xs text-gray-800 font-bold text-right'>
						{lead.status}
					</div>
				</div>

				{/* FORM ID */}
				{lead.formId && (
					<div className='flex gap-2 justify-between'>
						<div className='text-xs text-gray-500 mb-1'>Form ID</div>
						<div className='text-xs text-gray-800 font-bold text-right font-mono'>
							{lead.formId}
						</div>
					</div>
				)}

				{/* ANSWERS FROM answers FIELD */}
				{lead.answers ? (
					<div className='pt-4 border-t border-t-gray-300'>
						<div className='text-xs text-gray-500 font-bold mb-3'>Answers</div>

						{Object.entries(lead.answers).map(([section, questions]) => {
							const rows = Object.entries(questions).filter(
								([key, val]) =>
									key !== 'score' &&
									typeof val !== 'boolean' &&
									val !== null &&
									val !== undefined &&
									String(val).trim() !== '',
							);
							if (rows.length === 0) return null;

							return (
								<div key={section} className='mb-4'>
									<div className='text-[10px] uppercase font-black tracking-widest text-gray-400 bg-gray-50 rounded px-2 py-1 mb-2'>
										{section}
									</div>
									<div className='space-y-2.5'>
										{rows.map(([question, answer]) => (
											<div
												key={question}
												className='flex flex-col gap-0.5 pb-2 border-b border-gray-100 last:border-0'
											>
												<div className='text-[12px] text-gray-600 leading-snug'>
													{question}
												</div>
												<div className='text-xs text-gray-800 font-semibold leading-snug'>
													{String(answer)}
												</div>
											</div>
										))}
									</div>
								</div>
							);
						})}
					</div>
				) : null}
			</div>

			{/* FOOTER */}
			{/* <div className='flex flex-col gap-2 p-4 border-t border-gray-300'>
				<div>
					<div className='text-xs text-black opacity-60 font-bold mb-2'>
						Call Outcome
					</div>
					<div className='bg-gray-200 px-4 py-2 rounded-2xl max-h-[80px] border-l-4 border-l-gray-700 overflow-auto'>
						<span className='text-sm'>
							{lead['Call Outcome']?.trim() || 'User did not pick up the phone'}
						</span>
					</div>
				</div>
			</div> */}
			<div className='flex flex-col gap-2 p-4 border-t border-gray-300'>
				{/* CONTACT BUTTONS */}

				{/* CONTACT INFO */}
				<div className=''>
					<div className='text-xs text-black opacity-60 font-bold mb-2'>
						Contact
					</div>
					<div className='bg-black p-4 rounded-xl'>
						<div className='space-y-1 text-sm text-gray-900'>
							{email && (
								<div className='flex justify-between pb-2 border-b-2'>
									<span className='text-xs text-white opacity-60 font-semibold'>
										Email:
									</span>{' '}
									<span className='text-xs text-[#AAFF45] font-semibold'>
										{email}
									</span>
								</div>
							)}
							{phone && (
								<div className='flex justify-between pt-1'>
									<span className='text-white opacity-60 font-semibold text-xs'>
										Whatsapp:
									</span>{' '}
									<span className='text-[#AAFF45] font-semibold text-xs'>
										{phone}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className='flex gap-2'>
					{whatsappLink && (
						<a
							href={whatsappLink}
							target='_blank'
							className='flex-1 text-center text-sm py-2 rounded-md bg-green-500 transition text-white hover:bg-green-700'
						>
							WhatsApp
						</a>
					)}
				</div>
				{lead.leadStatus == 'New' && (
					<button
						onClick={() => updateLeadStatus(lead.id, 'Contacted')}
						className='cursor-pointer w-full text-black py-2 rounded-md text-sm hover:bg-black hover:text-white transition'
					>
						Mark as Contacted
					</button>
				)}
			</div>
		</div>
	);
};

export default DetailPanel;
