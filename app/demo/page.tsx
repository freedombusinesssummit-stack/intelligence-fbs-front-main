'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { allCountries } from 'country-telephone-data';
type Screen = 'form' | 'waiting' | 'summary';

interface FormData {
	name: string;
	phone: string;
	email: string;
	company: string;
	nationality: string;
	jurisdiction: string;
	timeline: string;
	capital: string;
}

const NATIONALITIES = [
	'American',
	'British',
	'Canadian',
	'Australian',
	'German',
	'French',
	'Italian',
	'Spanish',
	'Dutch',
	'Swiss',
	'Brazilian',
	'Mexican',
	'Colombian',
	'Argentinian',
	'Emirati',
	'Saudi Arabian',
	'Israeli',
	'Turkish',
	'Indian',
	'Chinese',
	'Singaporean',
	'South African',
	'Russian',
	'Ukrainian',
	'Other',
];

const JURISDICTIONS = [
	'Malta CBI',
	'Portugal Golden Visa',
	'Greece Golden Visa',
	'UAE Residency',
	'US EB-5',
	'Caribbean CBI',
	'Panama Residency',
	'Singapore Residency',
	'Cyprus Residency',
	'Not sure yet',
];

const TIMELINES = [
	'3–6 months',
	'6–9 months',
	'9–12 months',
	'12+ months',
	'Just exploring',
];

const CAPITALS = [
	'Under $250k',
	'$250k – $500k',
	'$500k – $1M',
	'$1M – $3M',
	'$3M – $10M',
	'$10M+',
];

function PhoneField({
	value,
	onChange,
	error,
}: {
	value: string;
	onChange: (v: string) => void;
	error?: boolean;
}) {
	const [code, setCode] = useState('+1');
	const [localNumber, setLocalNumber] = useState('');

	useEffect(() => {
		const detectCountry = async () => {
			try {
				const res = await fetch('https://ipapi.co/json/');
				const data = await res.json();
				const iso = data.country;
				const country = allCountries.find(
					(c: { iso2: string }) => c.iso2.toUpperCase() === iso,
				);
				if (country) {
					const newCode = '+' + country.dialCode;
					setCode(newCode);
					onChange(newCode + localNumber);
				}
			} catch (e) {
				console.error('Geo detect failed', e);
			}
		};
		detectCountry();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleCodeChange = (newCode: string) => {
		setCode(newCode);
		onChange(newCode + localNumber);
	};

	const handleNumberChange = (num: string) => {
		const clean = num.replace(/\D/g, '');
		setLocalNumber(clean);
		onChange(code + clean);
	};

	return (
		<div className='flex flex-col gap-1.5'>
			<label className='text-[11px] font-bold tracking-[0.08em] uppercase text-[#6B6B6B]'>
				Phone
			</label>
			<div className='flex gap-2 h-[46px]'>
				<select
					value={code}
					onChange={e => handleCodeChange(e.target.value)}
					className={[
						'px-3 py-0 border rounded-[9px] text-base bg-white cursor-pointer max-w-[110px]',
						error ? 'border-[#FF4444]' : 'border-[#E5E5E5]',
					].join(' ')}
				>
					{allCountries.map((country: { iso2: string; dialCode: string }) => (
						<option key={country.iso2} value={`+${country.dialCode}`}>
							{country.iso2.toUpperCase()} +{country.dialCode}
						</option>
					))}
				</select>

				<input
					type='tel'
					placeholder='(555) 000-0000'
					value={localNumber}
					onChange={e => handleNumberChange(e.target.value)}
					className={[
						'w-full px-3.5 py-3 border rounded-[9px] text-base outline-none transition-colors bg-white',
						error
							? 'border-[#FF4444]'
							: 'border-[#E5E5E5] focus:border-[#0A0A0A]',
					].join(' ')}
				/>
			</div>
		</div>
	);
}

export default function DemoPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [screen, setScreen] = useState<Screen>('form');
	const [formData, setFormData] = useState<FormData>({
		name: '',
		phone: '',
		email: '',
		company: '',
		nationality: '',
		jurisdiction: '',
		timeline: '',
		capital: '',
	});
	const [errors, setErrors] = useState<
		Partial<Record<keyof FormData, boolean>>
	>({});
	const [countdown, setCountdown] = useState(30);
	const [countdownDone, setCountdownDone] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, []);

	const startCountdown = () => {
		let s = 30;
		setCountdown(s);
		setCountdownDone(false);

		intervalRef.current = setInterval(() => {
			s--;

			if (s <= 0) {
				clearInterval(intervalRef.current!);
				setCountdownDone(true);
				setCountdown(0);

				router.push('/dashboard');
			} else {
				setCountdown(s);
			}
		}, 1000);
	};

	const handleChange = (field: keyof FormData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
	};

	const handleSubmit = async () => {
		setLoading(true);
		const required: (keyof FormData)[] = [
			'name',
			'phone',
			'email',
			'nationality',
			'jurisdiction',
			'timeline',
			'capital',
		];

		const newErrors: Partial<Record<keyof FormData, boolean>> = {};
		let ok = true;

		required.forEach(f => {
			if (!formData[f].trim()) {
				newErrors[f] = true;
				ok = false;
			}
		});

		if (!ok) {
			setErrors(newErrors);
			setLoading(false);
			return;
		}

		try {
			const res = await fetch(
				'https://intelligence-fbs-production.up.railway.app/api/leads',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData),
				},
			);

			if (!res.ok) {
				throw new Error('Failed to send lead');
			}

			const data = await res.json();
			console.log('✅ Lead saved:', data);

			setScreen('waiting');
			startCountdown();
		} catch (err) {
			console.error('❌ Error:', err);

			alert('Something went wrong. Try again.');
			setLoading(false);
		}
	};

	const handleSkip = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);
		setScreen('summary');
	};

	const firstName = formData.name.split(' ')[0] || 'there';

	return (
		<div className='min-h-screen font-sans antialiased bg-white text-[#0A0A0A]'>
			{/* ── SCREEN 1: FORM ── */}
			{screen === 'form' && (
				<div className='min-h-screen grid grid-cols-1 lg:grid-cols-2'>
					{/* LEFT PANEL */}
					<div className='hidden lg:flex flex-col justify-between bg-[#F4F4F2] border-r border-[#E5E5E5] px-14 py-16'>
						<span className='text-base font-extrabold tracking-tight'>
							FBS Intelligence
						</span>

						<div className='flex-1 flex flex-col justify-center py-10'>
							<p className='text-[11px] font-bold tracking-[0.1em] uppercase text-[#6B6B6B] mb-5'>
								Live demo · 4 minutes
							</p>
							<h1 className='text-4xl font-black tracking-tighter leading-[1.08] text-[#0A0A0A] mb-5'>
								See the Intelligence Platform{' '}
								<em className='not-italic relative'>
									In Action.
									<span className='absolute left-0 bottom-[3px] w-full h-[3px] bg-[#AAFF45]' />
								</em>
								<br />
								Live. Right now.
							</h1>
							<p className='text-base text-[#6B6B6B] leading-[1.75] max-w-sm mb-10'>
								Leave your details. Our platform demo connects within 30 seconds
								and walks you through exactly how we qualify and deliver leads
								to partner firms.
							</p>

							<div className='flex flex-col gap-3'>
								{[
									{
										bold: 'Live, not recorded.',
										text: 'Real platform, real lead data, real jurisdictions.',
									},
									{
										bold: '4 minutes.',
										text: "Platform overview, what you receive, what's available in your jurisdiction.",
									},
									{
										bold: 'No commitment.',
										text: "If it's not the right fit, we'll tell you upfront.",
									},
								].map(({ bold, text }) => (
									<div key={bold} className='flex items-start gap-3'>
										<div className='w-5 h-5 rounded-full bg-[#0A0A0A] flex items-center justify-center flex-shrink-0 mt-0.5'>
											<svg viewBox='0 0 8 6' fill='none' className='w-2 h-2'>
												<path
													d='M1 3l2 2 4-4'
													stroke='#AAFF45'
													strokeWidth='1.5'
													strokeLinecap='round'
													strokeLinejoin='round'
												/>
											</svg>
										</div>
										<p className='text-[13px] text-[#6B6B6B] leading-[1.5]'>
											<strong className='text-[#0A0A0A] font-semibold'>
												{bold}
											</strong>{' '}
											{text}
										</p>
									</div>
								))}
							</div>
						</div>

						<p className='text-[11px] text-[#aaa]'>
							Part of the Freedom Business Summit ecosystem · 12 jurisdictions ·
							30+ partner firms
						</p>
					</div>

					{/* RIGHT PANEL: FORM */}
					<div className='flex flex-col justify-center px-6 py-12 lg:px-14'>
						<span className='inline-block text-[11px] font-bold tracking-[0.1em] uppercase text-[#2A6010] bg-[#E8F5DF] px-3 py-1.5 rounded-[5px] mb-6 self-start'>
							Request live demo
						</span>

						<h2 className='text-3xl font-black tracking-tighter leading-[1.1] mb-2'>
							See it in action.
							<br />
							Connects in 30 seconds.
						</h2>
						<p className='text-base text-[#6B6B6B] leading-relaxed mb-6'>
							Fill in your details and keep your phone nearby. The demo connects
							automatically after you submit.
						</p>

						{/* Status bar */}
						<div className='flex items-center gap-2 bg-[#F4F4F2] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 mb-5'>
							<span className='w-[7px] h-[7px] rounded-full bg-[#AAFF45] animate-pulse flex-shrink-0' />
							<span className='text-xs font-medium'>
								Demo connects in{' '}
								<strong className='text-[#2A6010]'>under 30 seconds</strong>
							</span>
						</div>

						{/* Name + Phone */}
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2.5'>
							<Field label='First and Last Name' error={errors.name}>
								<input
									type='text'
									placeholder='Your First and Last Name'
									value={formData.name}
									onChange={e => handleChange('name', e.target.value)}
									className={inputCls(errors.name)}
								/>
							</Field>
							{/* <Field label='Phone / WhatsApp' error={errors.phone}>
								<input
									type='tel'
									placeholder='+1 (555) 000-0000'
									value={formData.phone}
									onChange={e => handleChange('phone', e.target.value)}
									className={inputCls(errors.phone)}
								/>
							</Field> */}

							<PhoneField
								value={formData.phone}
								onChange={v => handleChange('phone', v)}
								error={errors.phone}
							/>
						</div>

						{/* Company */}
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2.5'>
							<Field label='Email' error={errors.email}>
								<input
									type='email'
									placeholder='Your Email'
									value={formData.email}
									onChange={e => handleChange('email', e.target.value)}
									className={inputCls(errors.email)}
								/>
							</Field>

							<Field
								label={
									<>
										Company{' '}
										<span className='font-normal normal-case tracking-normal text-[#bbb]'>
											(optional)
										</span>
									</>
								}
								className='mb-2.5'
							>
								<input
									type='text'
									placeholder='Your Company'
									value={formData.company}
									onChange={e => handleChange('company', e.target.value)}
									className={inputCls(false)}
								/>
							</Field>
						</div>

						{/* Nationality + Jurisdiction */}
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2.5'>
							<Field label='Your nationality' error={errors.nationality}>
								<SelectInput
									value={formData.nationality}
									onChange={v => handleChange('nationality', v)}
									placeholder='Select country'
									options={NATIONALITIES}
									error={errors.nationality}
								/>
							</Field>
							<Field label='Preferred jurisdiction' error={errors.jurisdiction}>
								<SelectInput
									value={formData.jurisdiction}
									onChange={v => handleChange('jurisdiction', v)}
									placeholder='Select programme'
									options={JURISDICTIONS}
									error={errors.jurisdiction}
								/>
							</Field>
						</div>

						{/* Timeline + Capital */}
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4'>
							<Field label='Relocation timeline' error={errors.timeline}>
								<SelectInput
									value={formData.timeline}
									onChange={v => handleChange('timeline', v)}
									placeholder='Select timeline'
									options={TIMELINES}
									error={errors.timeline}
								/>
							</Field>
							<Field label='Annual capital' error={errors.capital}>
								<SelectInput
									value={formData.capital}
									onChange={v => handleChange('capital', v)}
									placeholder='Select range'
									options={CAPITALS}
									error={errors.capital}
								/>
							</Field>
						</div>

						<button
							onClick={handleSubmit}
							disabled={loading}
							className={[
								'w-full py-4 rounded-[9px] text-base font-bold transition-all',
								loading
									? 'bg-[#2A6010] text-white cursor-not-allowed'
									: 'bg-[#0A0A0A] text-white hover:opacity-90 cursor-pointer',
							].join(' ')}
						>
							{loading ? (
								<span className='flex items-center justify-center gap-2'>
									<span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
									Connecting...
								</span>
							) : (
								'Start my live demo →'
							)}
						</button>

						<p className='text-[11px] text-[#bbb] text-center mt-2.5 leading-relaxed'>
							By submitting you agree to receive a demo call from FBS
							Intelligence. No spam, no sales pressure.
						</p>

						<Link
							href='/'
							className='inline-flex items-center gap-1 text-xs text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors mt-5'
						>
							← Back to overview
						</Link>
					</div>
				</div>
			)}

			{/* ── SCREEN 2: WAITING ── */}
			{screen === 'waiting' && (
				<div className='min-h-screen flex flex-col items-center justify-center text-center px-6 py-10 border-t-4 border-[#AAFF45]'>
					<div className='max-w-lg w-full'>
						{/* Spinner icon */}
						<div className='relative w-20 h-20 rounded-full bg-[#F4F4F2] border border-[#E5E5E5] flex items-center justify-center mx-auto mb-7'>
							<div className='absolute inset-[-8px] rounded-full border-2 border-transparent border-t-[#0A0A0A] animate-spin' />
							<span className='text-3xl'>📞</span>
						</div>

						<p className='text-[11px] font-bold tracking-[0.1em] uppercase text-[#6B6B6B] mb-4'>
							Connecting your demo
						</p>
						<h2 className='text-4xl sm:text-5xl font-black tracking-tighter leading-[1.06] mb-3'>
							Your demo is
							<br />
							<span className='relative inline-block'>
								on its way.
								<span className='absolute left-0 bottom-[3px] w-full h-[3px] bg-[#AAFF45]' />
							</span>
						</h2>

						<p className='text-base text-[#6B6B6B] mb-7'>
							Connecting to {formData.phone || 'your number'} now.
						</p>

						<div className='text-[80px] font-black tracking-tighter leading-none mb-1.5 text-[#0A0A0A]'>
							{countdownDone ? '✓' : countdown}
						</div>
						<p className='text-xs text-[#6B6B6B] mb-9'>
							{countdownDone ? 'demo connected' : 'seconds until connected'}
						</p>

						<div className='w-10 h-px bg-[#E5E5E5] mx-auto mb-8' />

						<div className='bg-[#F4F4F2] border border-[#E5E5E5] rounded-xl px-5 py-4 text-left text-[13px] text-[#6B6B6B] leading-[1.7] mb-8 max-w-sm mx-auto'>
							<strong className='text-[#0A0A0A]'>While you wait —</strong> FBS
							Intelligence connects investment migration firms with
							pre-qualified global mobility clients. Every lead has been
							survey-scored and intent-verified before it reaches your
							dashboard.
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

/* ── Helpers ── */

function inputCls(error?: boolean) {
	return [
		'w-full px-3.5 py-3 border rounded-[9px] text-base outline-none transition-colors bg-white',
		error ? 'border-[#FF4444]' : 'border-[#E5E5E5] focus:border-[#0A0A0A]',
	].join(' ');
}

function Field({
	label,
	error,
	children,
	className = '',
}: {
	label: React.ReactNode;
	error?: boolean;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={`flex flex-col gap-1.5 ${className}`}>
			<label className='text-[11px] font-bold tracking-[0.08em] uppercase text-[#6B6B6B]'>
				{label}
			</label>
			{children}
		</div>
	);
}

function SelectInput({
	value,
	onChange,
	placeholder,
	options,
	error,
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder: string;
	options: string[];
	error?: boolean;
}) {
	return (
		<div className='relative'>
			<select
				value={value}
				onChange={e => onChange(e.target.value)}
				className={[
					inputCls(error),
					'appearance-none pr-9 cursor-pointer',
					!value ? 'text-[#bbb]' : '',
				].join(' ')}
			>
				<option value='' disabled>
					{placeholder}
				</option>
				{options.map(o => (
					<option key={o} value={o} className='text-[#0A0A0A]'>
						{o}
					</option>
				))}
			</select>
			{/* Chevron */}
			<svg
				className='pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-2'
				viewBox='0 0 12 7'
				fill='none'
			>
				<path
					d='M1 1l5 5 5-5'
					stroke='#6B6B6B'
					strokeWidth='1.5'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
			</svg>
		</div>
	);
}
