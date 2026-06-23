'use client';

import React from 'react';

const stages = [
	{
		num: '01',
		range: '0–24',
		tier: 'NURTURE',
		tierColor: 'text-gray-500',
		tierBg: 'bg-gray-100',
		dotColor: 'bg-gray-400',
		title: 'Explorer Stage',
		border: 'border-l-gray-300',
		desc: 'The lead is at an early research stage and is still exploring destinations, residency programs, and international structures.',
		howColor: 'text-gray-500',
		howBg: 'bg-gray-50',
		how: 'Use educational content and low-pressure follow-ups. Help them understand available pathways, costs, timelines, and basic requirements. Focus on trust-building rather than immediate conversion.',
	},
	{
		num: '02',
		range: '25–49',
		tier: 'QUALIFIED',
		tierColor: 'text-green-600',
		tierBg: 'bg-green-50',
		dotColor: 'bg-green-500',
		title: 'Starter Stage',
		border: 'border-l-green-400',
		desc: 'The lead has identified international goals and possible destinations but still needs clarity on priorities, budget, timeline, and the most suitable pathway.',
		howColor: 'text-green-600',
		howBg: 'bg-green-50',
		how: 'Offer an introductory consultation or eligibility assessment. Help them build a practical roadmap and compare relevant residency, citizenship, business, or investment options. Follow up consistently with tailored information.',
	},
	{
		num: '03',
		range: '50–69',
		tier: 'WARM',
		tierColor: 'text-orange-500',
		tierBg: 'bg-orange-50',
		dotColor: 'bg-orange-400',
		title: 'Strategist Stage',
		border: 'border-l-orange-400',
		desc: "The lead has clear international objectives and is actively preparing for mobility. Their plans, resources, and priorities are becoming aligned.",
		howColor: 'text-orange-500',
		howBg: 'bg-orange-50',
		how: 'Move into solution-based consultation. Compare jurisdictions, validate feasibility, explain costs and timelines, and recommend concrete next steps. A personal follow-up within 1–2 business days is appropriate.',
	},
	{
		num: '04',
		range: '70–100',
		tier: 'HOT LEAD',
		tierColor: 'text-red-500',
		tierBg: 'bg-red-50',
		dotColor: 'bg-red-500',
		title: 'Global Mobility Stage',
		border: 'border-l-red-400',
		desc: 'The lead has strong intent, financial readiness, and strategic awareness. They are prepared to execute or optimize an international residency, citizenship, business, tax, or investment strategy.',
		howColor: 'text-red-500',
		howBg: 'bg-red-50',
		how: 'Prioritize immediate personal outreach. Assign a senior advisor, confirm decision criteria, and present a clear proposal with timeline, fees, documentation, and next steps. Focus on execution and closing rather than general education.',
	},
];

const spectrum = [
	{
		range: '0–24',
		label: 'Nurture',
		sub: 'Explorer',
		bar: 'bg-gray-300',
		text: 'text-gray-500',
	},
	{
		range: '25–49',
		label: 'Qualified',
		sub: 'Starter',
		bar: 'bg-green-500',
		text: 'text-green-600',
	},
	{
		range: '50–69',
		label: 'Warm',
		sub: 'Strategist',
		bar: 'bg-orange-400',
		text: 'text-orange-500',
	},
	{
		range: '70–100',
		label: 'Hot lead',
		sub: 'Global Mobility',
		bar: 'bg-red-400',
		text: 'text-red-500',
	},
];

export default function LeadScoringPage() {
	return (
		<div className='max-w-4xl mx-auto px-6 py-8 text-sm text-gray-700'>
			{/* Header */}
			<p className='text-xs font-black uppercase tracking-widest text-[#5a9e00] mb-2'>
				Methodology
			</p>
			<h1 className='text-2xl font-black text-gray-900 mb-3'>
				How leads are scored &amp; qualified
			</h1>
			<p className='text-sm text-gray-600 mb-8 max-w-2xl leading-relaxed'>
				Every lead is scored <strong>0–100</strong> from their intake answers — location, citizenship, goals, budget, timeline, and readiness. The score maps to one of four stages that tell you{' '}
				<strong>how ready a lead is</strong> and <strong>how to engage</strong>.
			</p>

			{/* Score Spectrum */}
			<div className='border border-gray-200 rounded-2xl p-5 mb-8 bg-white'>
				<p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4'>
					The Score Spectrum
				</p>
				<div className='grid grid-cols-4 gap-3 mb-4'>
					{spectrum.map(s => (
						<div key={s.range} className='bg-gray-50 rounded-xl p-3'>
							<div className={`h-1 rounded-full mb-3 ${s.bar}`} />
							<div className='font-black text-gray-900 text-sm mb-0.5'>{s.range}</div>
							<div className={`text-xs font-bold ${s.text}`}>{s.label}</div>
							<div className='text-xs text-gray-400'>{s.sub}</div>
						</div>
					))}
				</div>
				{/* Scale */}
				<div className='relative h-4 mt-1'>
					<div className='absolute inset-x-0 top-2 h-px bg-gray-200' />
					{['0', '25', '50', '70', '100'].map((val, i) => {
						const positions = ['0%', '25%', '50%', '70%', '100%'];
						return (
							<span
								key={val}
								className='absolute text-[10px] text-gray-400 -translate-x-1/2'
								style={{ left: positions[i], top: 4 }}
							>
								{val}
							</span>
						);
					})}
				</div>
			</div>

			{/* Stage cards */}
			<div className='grid grid-cols-2 gap-4 mb-8'>
				{stages.map(s => (
					<div
						key={s.num}
						className={`bg-white border border-gray-200 border-l-4 ${s.border} rounded-2xl p-5`}
					>
						<div className='flex items-center gap-2 mb-2'>
							<span className='text-xs font-black text-gray-300'>{s.num}</span>
							<span className='text-xl font-black text-gray-900'>{s.range}</span>
							<span
								className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.tierBg} ${s.tierColor} flex items-center gap-1`}
							>
								<span className={`w-1.5 h-1.5 rounded-full ${s.dotColor} inline-block`} />
								{s.tier}
							</span>
							<span className='text-sm font-bold text-gray-800'>{s.title}</span>
						</div>
						<p className='text-xs text-gray-500 leading-relaxed mb-3'>{s.desc}</p>
						<div className={`rounded-xl p-3 ${s.howBg}`}>
							<p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 ${s.howColor}`}>
								<span className={`w-1.5 h-1.5 rounded-full ${s.dotColor} inline-block`} />
								How to work with them
							</p>
							<p className='text-xs text-gray-700 leading-relaxed'>{s.how}</p>
						</div>
					</div>
				))}
			</div>

			{/* Footer note */}
			<p className='text-xs text-gray-400 leading-relaxed'>
				Scores update automatically as a lead provides more information or takes further action, so a lead can move between stages over time. The tier shown in your Lead Feed always reflects the lead&apos;s current score.
			</p>
		</div>
	);
}
