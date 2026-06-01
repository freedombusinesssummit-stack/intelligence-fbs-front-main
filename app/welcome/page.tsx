'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
	{
		icon: '◻',
		accent: true,
		title: 'Welcome to FBS Intelligence',
		subtitle: 'Your partner command centre is ready.',
		body: 'FBS Intelligence is the private platform for FBS Summit partners. It gives you real-time access to qualified leads collected across our events, digital properties, and partner network — routed directly to you based on your profile.',
		note: 'Everything in one place. No spreadsheets, no manual follow-ups.',
	},
	{
		icon: '⚡',
		accent: false,
		title: 'Your Leads Feed',
		subtitle: 'Qualified leads, delivered in real time.',
		body: 'Every lead that matches your services and jurisdictions appears in your feed automatically. Each entry includes a tier rating (Hot / Warm / Cold), a match score, the program of interest, investment timeline, and the original traffic source.',
		note: 'Use the filters and quick-sort to prioritise your pipeline instantly.',
	},
	{
		icon: '◈',
		accent: false,
		title: 'Lead Intelligence',
		subtitle: 'Know your client before the first call.',
		body: 'Each lead card opens a full detail panel — contact information, self-reported budget, nationality, and the UTM path that brought them to us. The tier and score are calculated automatically so you can focus on the highest-value conversations first.',
		note: 'You can update the lead status as you work through your pipeline.',
	},
	{
		icon: '⊙',
		accent: false,
		title: 'Keep Your Profile Sharp',
		subtitle: 'Your profile drives your lead routing.',
		body: 'The services you offer and the jurisdictions you cover determine which leads reach you. Head to Settings → Company any time to update your specialisation. The more precise your profile, the better the leads you receive.',
		note: 'You can also connect your Tally form IDs under Settings → Integrations.',
	},
	{
		icon: '✦',
		accent: true,
		title: "You're all set",
		subtitle: 'Time to meet your leads.',
		body: "Your account is active, your profile is saved, and your leads feed is ready. If you have any questions, reach out to your FBS account manager — we're here to help you get the most from the platform.",
		note: null,
	},
];

export default function WelcomePage() {
	const router = useRouter();
	const [step, setStep] = useState(0);
	const current = STEPS[step];
	const isLast = step === STEPS.length - 1;

	return (
		<div className='min-h-screen bg-white flex flex-col'>
			{/* TOP BAR */}
			<div className='flex items-center justify-between px-8 py-5 border-b border-[#F0F0F0]'>
				<div className='flex items-center gap-2.5'>
					<div
						style={{
							width: '8px',
							height: '8px',
							background: '#AAFF45',
							borderRadius: '50%',
							animation: 'pulseLime 2.5s ease-in-out infinite',
						}}
					/>
					<span className='text-sm font-extrabold tracking-tight'>FBS Intelligence</span>
				</div>

				{/* Step dots */}
				<div className='flex items-center gap-2'>
					{STEPS.map((_, i) => (
						<button
							key={i}
							onClick={() => setStep(i)}
							className={`rounded-full transition-all duration-200 cursor-pointer ${
								i === step
									? 'w-5 h-2 bg-black'
									: i < step
										? 'w-2 h-2 bg-gray-400'
										: 'w-2 h-2 bg-gray-200'
							}`}
						/>
					))}
				</div>

				<button
					onClick={() => router.push('/dashboard')}
					className='text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer'
				>
					Skip tour →
				</button>
			</div>

			{/* MAIN */}
			<div className='flex-1 flex items-center justify-center px-6 py-12'>
				<div className='w-full max-w-2xl'>
					{/* CARD */}
					<div className='bg-[#f8f8f8] rounded-2xl p-10 mb-8 relative overflow-hidden'>
						{/* Background accent for first/last step */}
						{current.accent && (
							<div
								className='absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20 pointer-events-none'
								style={{ background: '#AAFF45' }}
							/>
						)}

						{/* Step counter */}
						<div className='text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6'>
							Step {step + 1} of {STEPS.length}
						</div>

						{/* Icon */}
						<div className='text-5xl mb-6 leading-none select-none'>{current.icon}</div>

						{/* Subtitle badge */}
						<div className='inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E5E5E5] text-[11px] font-bold text-gray-500 uppercase tracking-widest rounded-full mb-5'>
							{current.subtitle}
						</div>

						{/* Title */}
						<h1 className='text-[28px] font-extrabold tracking-tight text-gray-900 mb-4 leading-tight'>
							{current.title}
						</h1>

						{/* Body */}
						<p className='text-sm text-gray-600 leading-relaxed mb-6 max-w-xl'>
							{current.body}
						</p>

						{/* Note */}
						{current.note && (
							<div className='flex items-start gap-2.5 px-4 py-3 bg-white border border-[#E5E5E5] rounded-xl'>
								<span className='text-[#AAFF45] text-base leading-tight mt-0.5'>◆</span>
								<p className='text-xs text-gray-600 leading-relaxed'>{current.note}</p>
							</div>
						)}
					</div>

					{/* NAV */}
					<div className='flex items-center justify-between'>
						<button
							onClick={() => setStep(s => s - 1)}
							disabled={step === 0}
							className='px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-0 cursor-pointer'
						>
							← Back
						</button>

						{isLast ? (
							<button
								onClick={() => router.push('/dashboard')}
								className='px-8 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer'
							>
								Go to Dashboard →
							</button>
						) : (
							<button
								onClick={() => setStep(s => s + 1)}
								className='px-8 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer'
							>
								Next →
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}