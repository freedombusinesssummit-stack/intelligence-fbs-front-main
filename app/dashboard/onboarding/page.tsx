'use client';

import { useState, useEffect, startTransition } from 'react';
import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';
import Image from 'next/image';

// ── data ──────────────────────────────────────────────────────────────────────

const JURISDICTIONS_LIST = [
	{ code: 'pt', name: 'Portugal',  programs: 'Golden Visa (ARI) · D7 Passive Income' },
	{ code: 'es', name: 'Spain',     programs: 'Golden Visa · Non-Lucrative Residence' },
	{ code: 'mt', name: 'Malta',     programs: 'MEIN Citizenship · Permanent Residency' },
	{ code: 'gr', name: 'Greece',    programs: 'Golden Visa (Real Estate) · Fund' },
	{ code: 'ae', name: 'UAE',       programs: 'Golden Visa (10yr) · Green Card (5yr)' },
	{ code: 'kn', name: 'Caribbean', programs: 'St Kitts CBI · Antigua CBI · Dominica CBI' },
	{ code: 'my', name: 'Malaysia',  programs: 'MM2H · Premium Visa Programme' },
	{ code: 'pa', name: 'Panama',    programs: 'Friendly Nations · Pensionado Visa' },
	{ code: 'ge', name: 'Georgia',   programs: 'Residency by Investment · Virtual Zone' },
];

const PROGRAMS_BY_JURISDICTION: Record<string, string[]> = {
	Portugal:  ['Golden Visa (ARI)', 'D7 Passive Income Visa', 'NHR Tax Regime', 'Digital Nomad Visa'],
	Spain:     ['Golden Visa', 'Non-Lucrative Residence', 'Digital Nomad Visa'],
	Malta:     ['MEIN Citizenship by Naturalisation', 'Malta Permanent Residency Programme'],
	Greece:    ['Golden Visa (Real Estate)', 'Golden Visa (Fund)'],
	UAE:       ['UAE Golden Visa (10yr)', 'UAE Green Card (5yr)', 'Freelance Visa'],
	Caribbean: ['St Kitts & Nevis CBI', 'Antigua & Barbuda CBI', 'Dominica CBI', 'Grenada CBI'],
	Malaysia:  ['MM2H (My Second Home)', 'Premium Visa Programme'],
	Panama:    ['Friendly Nations Visa', 'Pensionado Visa', 'Investment Visa'],
	Georgia:   ['Residency by Investment', 'Virtual Zone Company Residency'],
};


const STEP_IDS = [
	'jurisdictions', 'programs', 'icp', 'persona', 'video', 'capacity',
] as const;

type StepId = (typeof STEP_IDS)[number];

const STEP_LABELS: Record<StepId, string> = {
	jurisdictions: 'Jurisdictions',
	programs:      'Programs',
	icp:           'Client Profile',
	persona:       'Persona',
	video:         'Video',
	capacity:      'Capacity',
};

// ── profile mapping helpers ───────────────────────────────────────────────────

const BUDGET_TO_DEAL: Record<string, string> = {
	'Under $100K': 'Under €10k',
	'$100K–$500K': '€25k–€75k',
	'$500K–$1M':   '€75k–€150k',
	'$1M–$5M':     '€150k+',
	'$5M+':        '€150k+',
};

const TIMELINE_TO_ICP: Record<string, string> = {
	'Immediately': '1–3 mo',
	'1–3 months':  '1–3 mo',
	'3–6 months':  '3–6 mo',
	'6–12 months': '6–12 mo',
	'12+ months':  '12+ mo',
};

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS_KEY = 'ob_state_v1';

function loadOBState(userId: string) {
	try {
		const raw = localStorage.getItem(`${LS_KEY}_${userId}`);
		return raw ? JSON.parse(raw) : {};
	} catch { return {}; }
}

function saveOBState(userId: string, data: object) {
	try { localStorage.setItem(`${LS_KEY}_${userId}`, JSON.stringify(data)); } catch {}
}

// ── svg progress ring ─────────────────────────────────────────────────────────

function ProgressRing({ pct }: { pct: number }) {
	const r = 38;
	const circ = 2 * Math.PI * r;
	const dash = (pct / 100) * circ;
	const color = pct === 100 ? '#22c55e' : '#AAFF45';
	return (
		<svg width='96' height='96' viewBox='0 0 96 96' className='shrink-0'>
			<circle cx='48' cy='48' r={r} fill='none' stroke='#F0F0F0' strokeWidth='7' />
			<circle
				cx='48' cy='48' r={r}
				fill='none' stroke={color} strokeWidth='7'
				strokeDasharray={`${dash} ${circ}`}
				strokeLinecap='round'
				transform='rotate(-90 48 48)'
				style={{ transition: 'stroke-dasharray 0.5s ease' }}
			/>
		</svg>
	);
}

// ── flag image ────────────────────────────────────────────────────────────────

function Flag({ code, size = 32 }: { code: string; size?: number }) {
	return (
		<Image
			src={`https://flagcdn.com/w80/${code}.png`}
			alt={code}
			width={size}
			height={Math.round(size * 0.75)}
			className='rounded-sm object-cover'
			unoptimized
		/>
	);
}

// ── shared sub-components ─────────────────────────────────────────────────────

function StepBubble({ stepId, num, completedSteps }: {
	stepId: StepId; num: number; completedSteps: Set<StepId>;
}) {
	const done = completedSteps.has(stepId);
	return (
		<div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
			done ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 border border-[#E5E5E5]'
		}`}>
			{done ? '✓' : num}
		</div>
	);
}

function StatusPill({ stepId, locked, completedSteps }: {
	stepId: StepId; locked?: boolean; completedSteps: Set<StepId>;
}) {
	if (locked) return (
		<span className='px-2.5 py-1 text-[10px] font-bold rounded-full bg-gray-900 text-white whitespace-nowrap'>
			Required to go live
		</span>
	);
	const done = completedSteps.has(stepId);
	return (
		<span className={`px-2.5 py-1 text-[10px] font-bold rounded-full whitespace-nowrap ${
			done ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-600 border border-amber-200'
		}`}>
			{done ? '✓ Complete' : '○ Incomplete'}
		</span>
	);
}

function SaveBtn({ stepId, onClick, savedStep }: {
	stepId: StepId; onClick: () => void; savedStep: StepId | null;
}) {
	return (
		<button
			onClick={onClick}
			className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
				savedStep === stepId ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'
			}`}
		>
			{savedStep === stepId ? '✓ Saved' : 'Save'}
		</button>
	);
}

function StepCard({
	stepId, num, title, why, locked, children, openStep, setOpenStep, completedSteps,
}: {
	stepId: StepId; num: number; title: string; why: string; locked?: boolean;
	children: React.ReactNode;
	openStep: StepId | null;
	setOpenStep: (fn: (prev: StepId | null) => StepId | null) => void;
	completedSteps: Set<StepId>;
}) {
	const isOpen = openStep === stepId;
	return (
		<div className={`bg-white rounded-xl overflow-hidden transition-all ${
			isOpen ? 'border-2 border-black shadow-sm' : 'border border-[#E5E5E5]'
		}`}>
			<div
				className='flex items-start gap-4 p-5 cursor-pointer select-none'
				onClick={() => setOpenStep(prev => prev === stepId ? null : stepId)}
			>
				<StepBubble stepId={stepId} num={num} completedSteps={completedSteps} />
				<div className='flex-1 min-w-0'>
					<div className='text-sm font-bold text-gray-900 mb-0.5'>{title}</div>
					<div className='text-xs text-gray-400 leading-relaxed'>{why}</div>
				</div>
				<div className='flex items-center gap-2 shrink-0 pt-0.5'>
					<StatusPill stepId={stepId} locked={locked} completedSteps={completedSteps} />
					<span className='text-gray-300 text-xs font-bold'>{isOpen ? '▲' : '▼'}</span>
				</div>
			</div>
			{isOpen && (
				<div className='px-5 pb-6 border-t border-[#F0F0F0]'>
					{children}
				</div>
			)}
		</div>
	);
}

function F({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
	return (
		<div>
			<label className='text-[11px] font-bold uppercase tracking-wider block mb-1.5 text-gray-500'>
				{label}
			</label>
			{children}
			{hint && <p className='text-[10px] text-gray-400 mt-1'>{hint}</p>}
		</div>
	);
}

function Chip({
	label, selected, onClick, disabled,
}: {
	label: string; selected: boolean; onClick: () => void; disabled?: boolean;
}) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
				selected
					? 'bg-black text-white border-black shadow-sm'
					: disabled
						? 'bg-white text-gray-300 border-[#E5E5E5] cursor-not-allowed'
						: 'bg-white text-gray-600 border-[#E5E5E5] hover:border-gray-400 hover:shadow-sm'
			}`}
		>
			{label}
		</button>
	);
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
	const { user, profile, fetchUser } = useUserStore();

	const [openStep, setOpenStep] = useState<StepId | null>('jurisdictions');
	const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());
	const [savedStep, setSavedStep] = useState<StepId | null>(null);

	const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([]);
	const [selectedPrograms,      setSelectedPrograms]      = useState<string[]>([]);
	const [icpAgeMin,    setIcpAgeMin]    = useState('35');
	const [icpAgeMax,    setIcpAgeMax]    = useState('60');
	const [icpIncome,    setIcpIncome]    = useState<string[]>([]);
	const [icpFamily,    setIcpFamily]    = useState<string[]>([]);
	const [icpTimeline,  setIcpTimeline]  = useState<string[]>([]);
	const [icpMotivation,setIcpMotivation]= useState<string[]>([]);
	const [icpDeal,      setIcpDeal]      = useState('');
	const [personaName,      setPersonaName]      = useState('');
	const [personaStory,     setPersonaStory]     = useState('');
	const [personaObjection, setPersonaObjection] = useState('');
	const [personaYes,       setPersonaYes]       = useState('');
	const [personaSecondary, setPersonaSecondary] = useState('');
	const [videoUrl, setVideoUrl] = useState('');
	const [capacityMax,      setCapacityMax]      = useState('');
	const [capacityResponse, setCapacityResponse] = useState('');
	const [capacityFormat,   setCapacityFormat]   = useState<string[]>([]);

	useEffect(() => { fetchUser(); }, [fetchUser]);

	// 1) Restore from localStorage
	useEffect(() => {
		if (!user?.id) return;
		const s = loadOBState(user.id);
		startTransition(() => {
			if (s.completed)     setCompletedSteps(new Set(s.completed as StepId[]));
			if (s.jurisdictions) setSelectedJurisdictions(s.jurisdictions);
			if (s.programs)      setSelectedPrograms(s.programs);
			if (s.icpAgeMin)     setIcpAgeMin(s.icpAgeMin);
			if (s.icpAgeMax)     setIcpAgeMax(s.icpAgeMax);
			if (s.icpIncome)     setIcpIncome(s.icpIncome);
			if (s.icpFamily)     setIcpFamily(s.icpFamily);
			if (s.icpTimeline)   setIcpTimeline(s.icpTimeline);
			if (s.icpMotivation) setIcpMotivation(s.icpMotivation);
			if (s.icpDeal)       setIcpDeal(s.icpDeal);
			if (s.personaName)       setPersonaName(s.personaName);
			if (s.personaStory)      setPersonaStory(s.personaStory);
			if (s.personaObjection)  setPersonaObjection(s.personaObjection);
			if (s.personaYes)        setPersonaYes(s.personaYes);
			if (s.personaSecondary)  setPersonaSecondary(s.personaSecondary);
			if (s.videoUrl)          setVideoUrl(s.videoUrl);
			if (s.capacityMax)       setCapacityMax(s.capacityMax);
			if (s.capacityResponse)  setCapacityResponse(s.capacityResponse);
			if (s.capacityFormat)    setCapacityFormat(s.capacityFormat);
		});
	}, [user?.id]);

	// 2) Pre-fill from profile for any fields still empty
	useEffect(() => {
		if (!profile) return;
		startTransition(() => {
			setSelectedJurisdictions(prev => {
				if (prev.length > 0) return prev;
				return (profile.jurisdictions || [])
					.filter(j => JURISDICTIONS_LIST.some(jl => jl.name === j))
					.slice(0, 3);
			});
			setIcpDeal(prev => {
				if (prev) return prev;
				return BUDGET_TO_DEAL[profile.budget] || '';
			});
			setIcpTimeline(prev => {
				if (prev.length > 0) return prev;
				const mapped = TIMELINE_TO_ICP[profile.timeline];
				return mapped ? [mapped] : [];
			});
			setIcpFamily(prev => {
				if (prev.length > 0) return prev;
				const types = profile.client_types || [];
				const result: string[] = [];
				if (types.includes('Families')) result.push('Family + kids');
				if (types.some(t => ['HNWIs', 'Ultra-HNWIs', 'Business Owners', 'Entrepreneurs'].includes(t)))
					result.push('Married');
				return result;
			});
		});
	}, [profile]);

	// helpers
	const toggle = (item: string, list: string[], set: (v: string[]) => void) =>
		set(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);

	const markComplete = (stepId: StepId, currentCompleted: Set<StepId>) => {
		const next = new Set(currentCompleted);
		next.add(stepId);
		setCompletedSteps(next);
		setSavedStep(stepId);
		setTimeout(() => setSavedStep(null), 2500);
		if (user?.id) {
			saveOBState(user.id, {
				completed: Array.from(next),
				jurisdictions: selectedJurisdictions,
				programs: selectedPrograms,
				icpAgeMin, icpAgeMax, icpIncome, icpFamily, icpTimeline, icpMotivation, icpDeal,
				personaName, personaStory, personaObjection, personaYes, personaSecondary,
				videoUrl,
				capacityMax, capacityResponse, capacityFormat,
			});
		}
	};

	const progress = Math.round((completedSteps.size / STEP_IDS.length) * 100);

	const profileChecks = [
		{ label: 'Company name',    done: !!profile?.company_name },
		{ label: 'Contact email',   done: !!user?.email },
		{ label: 'Full name',       done: !!profile?.full_name },
		{ label: 'Website',         done: !!profile?.website },
	];
	const profileComplete = profileChecks.every(c => c.done);

	const availablePrograms = selectedJurisdictions.flatMap(j => PROGRAMS_BY_JURISDICTION[j] ?? []);

	// style helpers
	const inp = 'w-full px-3 py-2 border bg-white border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black placeholder:text-[#ccc] transition-colors';
	const sel = 'w-full px-3 py-2 border bg-white border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black transition-colors appearance-none cursor-pointer';

	// ── render ─────────────────────────────────────────────────────────────────

	return (
		<div className='min-h-screen bg-[#fafafa] px-8 py-7'>
			<div style={{ maxWidth: 800 }}>

				{/* Page title */}
				<div className='mb-5'>
					<h1 className='text-base font-extrabold text-gray-900'>Campaign Onboarding</h1>
					<p className='text-xs text-gray-400 mt-0.5'>
						Complete your campaign profile to start receiving matched leads.
					</p>
				</div>

				{/* Profile gate */}
				{!profileComplete && (
					<div
						className='rounded-xl p-5 mb-5'
						style={{ background: 'linear-gradient(135deg,#0d0d0d,#1c1c1c)' }}
					>
						<div className='flex items-start gap-4 mb-4'>
							<div className='w-10 h-10 rounded-xl flex items-center justify-center shrink-0' style={{ background: 'rgba(170,255,69,0.15)' }}>
								<span className='text-lg'>🔐</span>
							</div>
							<div className='flex-1'>
								<div className='text-sm font-extrabold text-white mb-1'>Complete Your Profile First</div>
								<div className='text-xs leading-relaxed' style={{ color: 'rgba(255,255,255,0.45)' }}>
									Some required fields are missing. This ensures your leads are attributed correctly.
								</div>
							</div>
							<Link
								href='/dashboard/settings'
								className='shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-80'
								style={{ background: '#AAFF45', color: '#000' }}
							>
								Go to Settings →
							</Link>
						</div>
						<div className='grid grid-cols-4 gap-2'>
							{profileChecks.map(c => (
								<div key={c.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
									c.done ? '' : ''
								}`} style={{ background: c.done ? 'rgba(170,255,69,0.1)' : 'rgba(255,255,255,0.05)' }}>
									<span style={{ color: c.done ? '#AAFF45' : 'rgba(255,255,255,0.3)', fontSize: 12 }}>
										{c.done ? '✓' : '○'}
									</span>
									<span className='text-[11px] font-semibold' style={{ color: c.done ? '#AAFF45' : 'rgba(255,255,255,0.35)' }}>
										{c.label}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Progress hero card */}
				<div className='bg-white border border-[#E5E5E5] rounded-xl p-5 mb-5 flex items-center gap-6'>
					<div className='relative shrink-0'>
						<ProgressRing pct={progress} />
						<div className='absolute inset-0 flex flex-col items-center justify-center'>
							<span className='text-2xl font-black text-gray-900 leading-none'>{progress}%</span>
							<span className='text-[9px] text-gray-400 font-semibold tracking-wide mt-0.5'>DONE</span>
						</div>
					</div>
					<div className='flex-1'>
						<div className='text-sm font-extrabold text-gray-900 mb-3'>Campaign Setup Progress</div>
						<div className='grid grid-cols-3 gap-x-4 gap-y-2'>
							{STEP_IDS.map((id, i) => {
								const done = completedSteps.has(id);
								return (
									<button
										key={id}
										onClick={() => setOpenStep(id)}
										className='flex items-center gap-2 text-left group'
									>
										<div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center transition-colors ${
											done ? 'bg-green-500' : 'bg-gray-200 group-hover:bg-gray-300'
										}`}>
											{done
												? <span className='text-white text-[8px] font-bold'>✓</span>
												: <span className='text-gray-500 text-[9px] font-bold'>{i + 1}</span>
											}
										</div>
										<span className={`text-[11px] font-medium transition-colors ${
											done ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-700'
										}`}>
											{STEP_LABELS[id]}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				</div>

				{/* ── Steps ────────────────────────────────────────────────────────── */}
				<div className='space-y-2.5'>

					{/* 1 · Jurisdictions */}
					<StepCard
						openStep={openStep} setOpenStep={setOpenStep} completedSteps={completedSteps}
						stepId='jurisdictions' num={1}
						title='Key Jurisdictions'
						why='Select up to 3 primary countries you specialise in. Controls which leads we match to you.'
					>
						{selectedJurisdictions.length > 0 && profile?.jurisdictions?.some(j =>
							JURISDICTIONS_LIST.some(jl => jl.name === j)
						) && (
							<div className='mt-4 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg'>
								<span className='text-blue-500 text-xs'>↑</span>
								<span className='text-xs text-blue-600 font-medium'>Pre-filled from your Settings · verify and save to confirm</span>
							</div>
						)}
						<div className='grid grid-cols-3 gap-3 mt-4'>
							{JURISDICTIONS_LIST.map(j => {
								const isSelected = selectedJurisdictions.includes(j.name);
								const atMax = selectedJurisdictions.length >= 3 && !isSelected;
								return (
									<button
										key={j.name}
										disabled={atMax}
										onClick={() => toggle(j.name, selectedJurisdictions, setSelectedJurisdictions)}
										className={`relative text-left p-4 rounded-xl border-2 transition-all ${
											isSelected
												? 'border-black bg-gray-50 shadow-sm'
												: atMax
													? 'border-[#E5E5E5] opacity-30 cursor-not-allowed'
													: 'border-[#E5E5E5] hover:border-gray-300 hover:shadow-sm cursor-pointer'
										}`}
									>
										{isSelected && (
											<div className='absolute top-3 right-3 w-5 h-5 bg-black rounded-full flex items-center justify-center'>
												<span className='text-white text-[10px] font-bold'>✓</span>
											</div>
										)}
										<div className='mb-3'>
											<Flag code={j.code} size={44} />
										</div>
										<div className='text-sm font-bold text-gray-900 mb-1'>{j.name}</div>
										<div className='text-[10px] text-gray-400 leading-tight'>{j.programs}</div>
									</button>
								);
							})}
						</div>
						<div className='flex items-center gap-3 mt-5'>
							<SaveBtn savedStep={savedStep} stepId='jurisdictions' onClick={() => {
								if (selectedJurisdictions.length > 0) markComplete('jurisdictions', completedSteps);
							}} />
							<span className='text-xs text-gray-400'>{selectedJurisdictions.length}/3 selected</span>
						</div>
					</StepCard>

					{/* 2 · Programs */}
					<StepCard
						openStep={openStep} setOpenStep={setOpenStep} completedSteps={completedSteps}
						stepId='programs' num={2}
						title='Programs & Visa Types'
						why='Choose specific programs from your selected jurisdictions. We only match you with leads seeking your actual programs.'
					>
						{availablePrograms.length === 0 ? (
							<div className='mt-4 bg-gray-50 rounded-xl p-5 text-center'>
								<div className='text-2xl mb-2'>🗺️</div>
								<div className='text-xs text-gray-400'>Select jurisdictions in Step 1 first — programs will appear here.</div>
							</div>
						) : (
							<div className='mt-4'>
								<div className='flex flex-wrap gap-2'>
									{availablePrograms.map(p => (
										<Chip
											key={p} label={p}
											selected={selectedPrograms.includes(p)}
											onClick={() => toggle(p, selectedPrograms, setSelectedPrograms)}
										/>
									))}
								</div>
							</div>
						)}
						<div className='mt-5'>
							<SaveBtn savedStep={savedStep} stepId='programs' onClick={() => {
								if (selectedPrograms.length > 0) markComplete('programs', completedSteps);
							}} />
						</div>
					</StepCard>

					{/* 3 · ICP */}
					<StepCard
						openStep={openStep} setOpenStep={setOpenStep} completedSteps={completedSteps}
						stepId='icp' num={3}
						title='Ideal Client Profile (ICP)'
						why='Our AI scores incoming leads against your ICP. Pre-filled from your Settings where available.'
					>
						{(profile?.budget || profile?.timeline || (profile?.client_types?.length ?? 0) > 0) && (
							<div className='mt-4 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg'>
								<span className='text-blue-500 text-xs'>↑</span>
								<span className='text-xs text-blue-600 font-medium'>Some fields pre-filled from Settings · review and save to confirm</span>
							</div>
						)}
						<div className='grid grid-cols-2 gap-3 mt-4'>
							<F label='Age Range (min)'>
								<select className={sel} value={icpAgeMin} onChange={e => setIcpAgeMin(e.target.value)}>
									{['25','30','35','40','45'].map(v => <option key={v}>{v}</option>)}
								</select>
							</F>
							<F label='Age Range (max)'>
								<select className={sel} value={icpAgeMax} onChange={e => setIcpAgeMax(e.target.value)}>
									{['50','55','60','65','70+'].map(v => <option key={v}>{v}</option>)}
								</select>
							</F>
						</div>
						<div className='space-y-3 mt-3'>
							<F label='Annual Income Level'>
								<div className='flex flex-wrap gap-2 mt-1'>
									{['Under €100k','€100k–€250k','€250k–€500k','€500k+'].map(v => (
										<Chip key={v} label={v} selected={icpIncome.includes(v)} onClick={() => toggle(v, icpIncome, setIcpIncome)} />
									))}
								</div>
							</F>
							<div className='grid grid-cols-2 gap-3'>
								<F label='Family Status'>
									<div className='flex flex-wrap gap-2 mt-1'>
										{['Solo','Married','Family + kids'].map(v => (
											<Chip key={v} label={v} selected={icpFamily.includes(v)} onClick={() => toggle(v, icpFamily, setIcpFamily)} />
										))}
									</div>
								</F>
								<F label='Timeline Readiness'>
									<div className='flex flex-wrap gap-2 mt-1'>
										{['1–3 mo','3–6 mo','6–12 mo','12+ mo'].map(v => (
											<Chip key={v} label={v} selected={icpTimeline.includes(v)} onClick={() => toggle(v, icpTimeline, setIcpTimeline)} />
										))}
									</div>
								</F>
							</div>
							<F label='Primary Motivation'>
								<div className='flex flex-wrap gap-2 mt-1'>
									{['Tax optimisation','EU access',"Children's education",'Business expansion','Lifestyle','Political risk','Second passport'].map(v => (
										<Chip key={v} label={v} selected={icpMotivation.includes(v)} onClick={() => toggle(v, icpMotivation, setIcpMotivation)} />
									))}
								</div>
							</F>
							<F label='Average Deal Value'>
								<select className={sel} value={icpDeal} onChange={e => setIcpDeal(e.target.value)}>
									<option value=''>Select…</option>
									{['Under €10k','€10k–€25k','€25k–€75k','€75k–€150k','€150k+'].map(v => <option key={v}>{v}</option>)}
								</select>
							</F>
						</div>
						<div className='mt-5'>
							<SaveBtn savedStep={savedStep} stepId='icp' onClick={() => {
								if (icpIncome.length > 0 || icpDeal) markComplete('icp', completedSteps);
							}} />
						</div>
					</StepCard>

					{/* 5 · Persona */}
					<StepCard
						openStep={openStep} setOpenStep={setOpenStep} completedSteps={completedSteps}
						stepId='persona' num={4}
						title='Target Audience Persona'
						why='Describe your ideal client as a person. Used by our AI for contextual lead scoring and ad copy.'
					>
						<div className='mt-4 bg-gray-50 rounded-xl p-4 border-l-2 border-black text-xs text-gray-500 leading-relaxed'>
							<strong className='text-gray-900'>Example:</strong> "Our ideal client is a 45-year-old entrepreneur from Russia or Kazakhstan with a $2–5M business. He wants EU residency within 6 months — mainly for freedom of movement and to set up a European holding company."
						</div>
						<div className='space-y-3 mt-4'>
							<F label='Persona Name' hint='A memorable internal reference'>
								<input className={inp} placeholder='"The Relocating Entrepreneur"' value={personaName} onChange={e => setPersonaName(e.target.value)} />
							</F>
							<F label='Persona Story'>
								<textarea className={`${inp} resize-none`} rows={4} placeholder='Who are they, what do they worry about, what triggered them to look for a second residency?' value={personaStory} onChange={e => setPersonaStory(e.target.value)} />
							</F>
							<F label='Their Biggest Objection' hint="What's the main reason they hesitate?">
								<input className={inp} placeholder={`e.g., "I don't know if Portugal is the right country for us"`} value={personaObjection} onChange={e => setPersonaObjection(e.target.value)} />
							</F>
							<F label='What Makes Them Say Yes'>
								<input className={inp} placeholder='"Fast timeline, clear cost breakdown, EU school access for kids"' value={personaYes} onChange={e => setPersonaYes(e.target.value)} />
							</F>
							<F label='Secondary Persona (optional)'>
								<textarea className={`${inp} resize-none`} rows={2} placeholder='A second type of client, if applicable…' value={personaSecondary} onChange={e => setPersonaSecondary(e.target.value)} />
							</F>
						</div>
						<div className='mt-5'>
							<SaveBtn savedStep={savedStep} stepId='persona' onClick={() => { if (personaStory) markComplete('persona', completedSteps); }} />
						</div>
					</StepCard>

					{/* 6 · Video */}
					<StepCard
						openStep={openStep} setOpenStep={setOpenStep} completedSteps={completedSteps}
						stepId='video' num={5}
						title='Video Introduction'
						why='2–3 min video embedded in ads and sent to matched leads. Converts at 2.4× the rate without video.'
					>
						<div className='mt-4 bg-gray-50 rounded-xl p-4 border-l-2 border-black text-xs text-gray-500 leading-relaxed'>
							<strong className='text-gray-900'>What to say:</strong> · Who you are · Which program you specialise in · How you've helped past clients · What makes you different · CTA: "Book a free 20-min call"
						</div>
						<div className='mt-4 border-2 border-dashed border-[#E5E5E5] rounded-xl p-8 text-center'>
							<div className='text-4xl mb-2'>🎬</div>
							<div className='text-sm font-bold text-gray-900 mb-1'>Upload video file</div>
							<div className='text-xs text-gray-400 mb-3'>MP4, MOV · max 500MB · 2–3 min recommended</div>
							<span className='px-4 py-1.5 bg-gray-100 text-gray-400 text-xs font-semibold rounded-lg'>Coming soon</span>
						</div>
						<div className='mt-4'>
							<F label='Or paste video URL' hint='YouTube (unlisted) or Vimeo links both work'>
								<input className={inp} type='url' placeholder='https://vimeo.com/... or https://youtube.com/...' value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
							</F>
						</div>
						<div className='mt-5'>
							<SaveBtn savedStep={savedStep} stepId='video' onClick={() => { if (videoUrl) markComplete('video', completedSteps); }} />
						</div>
					</StepCard>

					{/* 7 · Capacity */}
					<StepCard
						openStep={openStep} setOpenStep={setOpenStep} completedSteps={completedSteps}
						stepId='capacity' num={6}
						title='Monthly Capacity & Response Commitment'
						why='We calibrate lead volume to match your capacity. HOT leads are routed to fastest responders first.'
					>
						<div className='grid grid-cols-2 gap-3 mt-4'>
							<F label='Max new clients / month' hint="We'll cap lead volume to match">
								<select className={sel} value={capacityMax} onChange={e => setCapacityMax(e.target.value)}>
									<option value=''>Select…</option>
									{['1–3','3–5','5–10','10–20','20+'].map(v => <option key={v}>{v}</option>)}
								</select>
							</F>
							<F label='First response target' hint='HOT leads go to fastest responders'>
								<select className={sel} value={capacityResponse} onChange={e => setCapacityResponse(e.target.value)}>
									<option value=''>Select…</option>
									<option>Within 1 hour</option>
									<option>Within 4 hours</option>
									<option>Within 24 hours</option>
								</select>
							</F>
						</div>
						<div className='mt-3'>
							<F label='Preferred consultation format'>
								<div className='flex flex-wrap gap-2 mt-1'>
									{['Free 20-min Zoom','Paid consultation','Email first'].map(v => (
										<Chip key={v} label={v} selected={capacityFormat.includes(v)} onClick={() => toggle(v, capacityFormat, setCapacityFormat)} />
									))}
								</div>
							</F>
						</div>
						<div className='mt-5'>
							<SaveBtn savedStep={savedStep} stepId='capacity' onClick={() => { if (capacityMax && capacityResponse) markComplete('capacity', completedSteps); }} />
						</div>
					</StepCard>

				</div>

				{/* Submit */}
				<div className='flex items-center justify-between py-6'>
					<p className='text-xs text-gray-400'>
						{completedSteps.size < STEP_IDS.length
							? `${STEP_IDS.length - completedSteps.size} step${STEP_IDS.length - completedSteps.size !== 1 ? 's' : ''} remaining`
							: 'All steps complete — ready to submit!'}
					</p>
					<button className='px-8 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer'>
						Submit for Campaign Review →
					</button>
				</div>

			</div>
		</div>
	);
}
