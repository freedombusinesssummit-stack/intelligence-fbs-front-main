'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

type Screen = 'register' | 'setup-1' | 'setup-2';

function Logo() {
	return (
		<div className='flex items-center gap-1.5'>
			<div className='flex items-center justify-between h-[62px] gap-3'>
				<div
					style={{
						width: '8px',
						height: '8px',
						background: '#AAFF45',
						borderRadius: '50%',
						animation: 'pulseLime 2.5s ease-in-out infinite',
					}}
				></div>
				<span className='text-sm font-extrabold'>FBS Intelligence</span>
			</div>
		</div>
	);
}

function CheckItem({
	label,
	checked,
	onToggle,
}: {
	label: string;
	checked: boolean;
	onToggle: () => void;
}) {
	return (
		<div
			onClick={onToggle}
			className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all select-none ${
				checked
					? 'border-black bg-black text-white'
					: 'border-[#E5E5E5] bg-white hover:border-[#ccc]'
			}`}
		>
			<div
				className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-all ${
					checked ? 'border-white bg-white' : 'border-[#D5D5D5] bg-transparent'
				}`}
			>
				{checked && (
					<svg width='10' height='8' viewBox='0 0 10 8' fill='none'>
						<path
							d='M1 4l3 3 5-6'
							stroke='#0A0A0A'
							strokeWidth='1.5'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
				)}
			</div>
			<span className='text-sm font-medium'>{label}</span>
		</div>
	);
}

function RegisterPageInner() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [screen, setScreen] = useState<Screen>('register');

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [company, setCompany] = useState('');

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [otherJurisdiction, setOtherJurisdiction] = useState('');

	const [firmDetails, setFirmDetails] = useState({
		companyName: '',
		website: '',
		fullName: '',
		role: '',
		country: '',
		bio: '',
	});

	const [selectedServices, setSelectedServices] = useState<string[]>([]);
	const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>(
		[],
	);
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

	useEffect(() => {
		const checkUser = async () => {
			const { data } = await supabase.auth.getSession();
			if (!data.session) return;

			const isSetup = searchParams.get('setup') === '1';

			if (isSetup) {
				// Check if partner_profile already exists
				const { data: profile } = await supabase
					.from('partner_profiles')
					.select('id')
					.eq('id', data.session.user.id)
					.single();

				if (profile) {
					router.push('/dashboard');
				} else {
					// Pre-fill from Google user metadata
					const meta = data.session.user.user_metadata ?? {};
					const googleName = meta.full_name || meta.name || '';
					setName(googleName);
					setFirmDetails(prev => ({ ...prev, fullName: googleName }));
					setScreen('setup-1');
				}
			} else {
				router.push('/dashboard');
			}
		};
		checkUser();
	}, [searchParams]);

	const handleGoogleLogin = async () => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: 'https://platform.fsummit.net/register?setup=1',
			},
		});
		if (error) console.error(error.message);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const res = await supabase.auth.signUp({
				email,
				password,
				options: { data: { name, company } },
			});
			if (res.error) {
				setError(res.error.message);
			} else {
				setFirmDetails(prev => ({
					...prev,
					companyName: prev.companyName || company,
					fullName: prev.fullName || name,
				}));
				setScreen('setup-1');
			}
		} catch {
			setError('Something went wrong');
		}

		setLoading(false);
	};

	const finishSetup = async () => {
		try {
			setLoading(true);

			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				setError('User not found');
				return;
			}

			const { error } = await supabase.from('partner_profiles').upsert({
				id: user.id,
				company_name: firmDetails.companyName,
				website: firmDetails.website,
				full_name: firmDetails.fullName,
				role: firmDetails.role,
				country: firmDetails.country,
				bio: firmDetails.bio,
				services: selectedServices,
				jurisdictions: selectedJurisdictions.includes('Other')
					? [
							...selectedJurisdictions.filter(j => j !== 'Other'),
							otherJurisdiction.trim(),
						].filter(Boolean)
					: selectedJurisdictions,
				plan: selectedPlan,
			});

			if (error) {
				console.error(error);
				setError(error.message);
				return;
			}

			// fire-and-forget вЂ” email is non-critical, don't block navigation
			fetch('/api/send-welcome-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: user.email,
					name: firmDetails.fullName || name,
					company: firmDetails.companyName,
					website: firmDetails.website,
					role: firmDetails.role,
					country: firmDetails.country,
					bio: firmDetails.bio,
					services: selectedServices,
					jurisdictions: selectedJurisdictions.includes('Other')
						? [
								...selectedJurisdictions.filter(j => j !== 'Other'),
								otherJurisdiction.trim(),
							].filter(Boolean)
						: selectedJurisdictions,
					plan: selectedPlan,
				}),
			}).catch(console.error);

			router.push('/welcome');
		} catch (err) {
			console.error(err);
			setError('Something went wrong');
		} finally {
			setLoading(false);
		}
	};

	const toggleService = (service: string) => {
		setSelectedServices(prev =>
			prev.includes(service)
				? prev.filter(s => s !== service)
				: [...prev, service],
		);
	};

	const toggleJurisdiction = (j: string) => {
		setSelectedJurisdictions(prev =>
			prev.includes(j) ? prev.filter(s => s !== j) : [...prev, j],
		);
	};

	const getProgressWidth = () => {
		const map: Record<Screen, string> = {
			register: '0%',
			'setup-1': '50%',
			'setup-2': '100%',
		};
		return map[screen];
	};

	const inputClass =
		'w-full px-4 py-3 border bg-white border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black placeholder:text-[#bbb] transition-colors';
	const labelClass =
		'text-[12px] font-bold uppercase tracking-wider block mb-2';

	// в”Ђв”Ђв”Ђ REGISTER SCREEN в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
	if (screen === 'register') {
		return (
			<div className='min-h-screen flex items-center justify-center bg-white px-6'>
				<div className='w-full max-w-md bg-[#f5f5f5] shadow-2xl rounded-[20px] px-9 py-10'>
					{/* BADGE + LOGO */}
					<div className='flex items-center justify-between mb-5'>
						<div className='inline-flex items-center gap-2 bg-[#E8F5DF] text-[#2D6A1A] text-[11px] font-bold px-3 py-1 rounded'>
							<span className='w-[6px] h-[6px] bg-[#AAFF45] rounded-full' />
							Partner Portal
						</div>
						<Logo />
					</div>

					{/* TITLE */}
					<h1 className='text-[26px] font-extrabold tracking-tight mb-1'>
						Create your account
					</h1>
					<p className='text-sm text-[#6B6B6B] mb-8 leading-relaxed'>
						Create your account to get access to the platform
					</p>

					{/* FORM */}
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<label className={labelClass}>
								Full Name{' '}
								<span className='text-gray-400 font-normal normal-case tracking-normal'>
									- first and last name
								</span>
							</label>
							<input
								type='text'
								value={name}
								onChange={e => setName(e.target.value)}
								className={inputClass}
								required
							/>
						</div>
						<div>
							<label className={labelClass}>Company</label>
							<input
								type='text'
								value={company}
								onChange={e => setCompany(e.target.value)}
								className={inputClass}
								required
							/>
						</div>
						<div>
							<label className={labelClass}>Email address</label>
							<input
								type='email'
								value={email}
								onChange={e => setEmail(e.target.value)}
								placeholder='you@yourfirm.com'
								className={inputClass}
								required
							/>
						</div>
						<div>
							<label className={labelClass}>Password</label>
							<input
								type='password'
								value={password}
								onChange={e => setPassword(e.target.value)}
								placeholder='вЂўвЂўвЂўвЂўвЂўвЂўвЂўвЂў'
								className={inputClass}
								required
							/>
						</div>

						{error && <div className='text-sm text-red-500'>{error}</div>}

						<button
							type='submit'
							disabled={loading}
							className='w-full mt-2 py-3 bg-black text-white rounded-lg text-sm font-bold hover:opacity-90 transition cursor-pointer'
						>
							{loading ? 'Loading...' : 'Create account в†’'}
						</button>
					</form>

					{/* DIVIDER */}
					<div className='flex items-center gap-3 my-5'>
						<div className='flex-1 h-[1px] bg-[#E5E5E5]' />
						<span className='text-xs text-[#ccc]'>or continue with</span>
						<div className='flex-1 h-[1px] bg-[#E5E5E5]' />
					</div>

					{/* GOOGLE */}
					<button
						onClick={handleGoogleLogin}
						className='w-full py-3 border border-[#E5E5E5] rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#F4F4F2] transition cursor-pointer'
					>
						<Image
							src='https://www.svgrepo.com/show/475656/google-color.svg'
							width={18}
							height={18}
							alt='Google'
						/>
						Continue with Google
					</button>

					{/* FOOTER */}
					<div className='mt-6 text-sm text-[#6B6B6B] text-center'>
						Already have an account?{' '}
						<Link href='/login' className='text-black font-bold'>
							Sign in
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// в”Ђв”Ђв”Ђ SETUP SCREENS в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
	return (
		<div className='min-h-screen flex items-center justify-center bg-white px-6 py-12'>
			<div className='w-full max-w-xl bg-[#f5f5f5] shadow-2xl rounded-[20px] px-9 py-10'>
				{/* BADGE + LOGO */}
				<div className='flex items-center justify-between mb-6'>
					<div className='inline-flex items-center gap-2 bg-[#E8F5DF] text-[#2D6A1A] text-[11px] font-bold px-3 py-1 rounded'>
						<span className='w-[6px] h-[6px] bg-[#AAFF45] rounded-full' />
						Partner Portal
					</div>
					<Logo />
				</div>

				{/* PROGRESS BAR */}
				<div className='w-full h-[4px] bg-[#E5E5E5] rounded-full mb-8 overflow-hidden'>
					<div
						className='h-full bg-black rounded-full transition-all duration-500'
						style={{ width: getProgressWidth() }}
					/>
				</div>

				{/* в”Ђв”Ђ STEP 1: Firm details в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
				{screen === 'setup-1' && (
					<>
						<div className='text-[11px] font-bold uppercase tracking-widest text-[#999] mb-2'>
							Step 1 of 2
						</div>
						<h1 className='text-[26px] font-extrabold tracking-tight mb-1'>
							Your firm details
						</h1>
						<p className='text-sm text-[#6B6B6B] mb-8 leading-relaxed'>
							Tell us about your company so we can set up your partner profile
							and listing on MigrateIQ.
						</p>

						<div className='space-y-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className={labelClass}>Company name</label>
									<input
										type='text'
										value={firmDetails.companyName}
										onChange={e =>
											setFirmDetails({
												...firmDetails,
												companyName: e.target.value,
											})
										}
										placeholder='e.g. Meridian Advisory Group'
										className={inputClass}
									/>
								</div>
								<div>
									<label className={labelClass}>Website</label>
									<input
										type='text'
										value={firmDetails.website}
										onChange={e =>
											setFirmDetails({
												...firmDetails,
												website: e.target.value,
											})
										}
										placeholder='yourfirm.com'
										className={inputClass}
									/>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className={labelClass}>Your full name</label>
									<input
										type='text'
										value={firmDetails.fullName}
										onChange={e =>
											setFirmDetails({
												...firmDetails,
												fullName: e.target.value,
											})
										}
										placeholder='First and last name'
										className={inputClass}
									/>
								</div>
								<div>
									<label className={labelClass}>Your role</label>
									<input
										type='text'
										value={firmDetails.role}
										onChange={e =>
											setFirmDetails({ ...firmDetails, role: e.target.value })
										}
										placeholder='e.g. Managing Partner'
										className={inputClass}
									/>
								</div>
							</div>

							<div>
								<label className={labelClass}>Short company bio</label>
								<textarea
									value={firmDetails.bio}
									onChange={e =>
										setFirmDetails({ ...firmDetails, bio: e.target.value })
									}
									placeholder='Describe your firm in 1вЂ“2 sentences. This appears on your partner listing.'
									rows={3}
									className='w-full px-4 py-3 border bg-white border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black placeholder:text-[#bbb] transition-colors resize-none'
								/>
							</div>
						</div>

						<div className='flex items-center justify-between mt-8 pt-6 border-t border-[#E5E5E5]'>
							{searchParams.get('setup') !== '1' && (
							<button
								onClick={() => setScreen('register')}
								className='text-sm text-[#6B6B6B] hover:text-black transition cursor-pointer font-medium'
							>
								в†ђ Back
							</button>
						)}
							<button
								onClick={() => setScreen('setup-2')}
								className='px-6 py-3 bg-black text-white rounded-lg text-sm font-bold hover:opacity-90 transition cursor-pointer'
							>
								Continue в†’
							</button>
						</div>
					</>
				)}

				{/* в”Ђв”Ђ STEP 2: Specialisation в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
				{screen === 'setup-2' && (
					<>
						<div className='text-[11px] font-bold uppercase tracking-widest text-[#999] mb-2'>
							Step 2 of 2
						</div>
						<h1 className='text-[26px] font-extrabold tracking-tight mb-1'>
							Your specialisation
						</h1>
						<p className='text-sm text-[#6B6B6B] mb-8 leading-relaxed'>
							Select all the services your firm provides. This determines which
							leads are routed to you.
						</p>

						<div className='mb-6'>
							<div className={labelClass}>Service type</div>
							<div className='grid grid-cols-2 gap-2'>
								{[
									'Immigration law & advisory',
									'Citizenship by investment',
									'Residency programmes',
									'Tax optimisation',
									'Real estate investment',
									'EB-5 / US investment visa',
									'Corporate structuring',
									'Relocation services',
								].map(service => (
									<CheckItem
										key={service}
										label={service}
										checked={selectedServices.includes(service)}
										onToggle={() => toggleService(service)}
									/>
								))}
							</div>
						</div>

						<div className='mb-6'>
							<div className={labelClass}>Jurisdictions you cover</div>
							<div className='grid grid-cols-2 gap-2'>
								{[
									'рџ‡µрџ‡№ Portugal',
									'рџ‡Ірџ‡№ Malta',
									'рџ‡¬рџ‡· Greece',
									'рџ‡¦рџ‡Є UAE',
									'рџ‡єрџ‡ё United States',
									'рџ‡µрџ‡¦ Panama',
									'рџЊЏ Caribbean',
									'рџ‡ёрџ‡¬ Singapore',
									'Other',
								].map(j => (
									<CheckItem
										key={j}
										label={j}
										checked={selectedJurisdictions.includes(j)}
										onToggle={() => toggleJurisdiction(j)}
									/>
								))}
							</div>

							{selectedJurisdictions.includes('Other') && (
								<div className='mt-3'>
									<label className={labelClass}>Specify jurisdiction</label>
									<input
										type='text'
										value={otherJurisdiction}
										onChange={e => setOtherJurisdiction(e.target.value)}
										placeholder='e.g. Cyprus, New Zealand...'
										className={inputClass}
										autoFocus
									/>
								</div>
							)}
						</div>

						{error && <div className='text-sm text-red-500 mb-4'>{error}</div>}

						<div className='flex items-center justify-between mt-8 pt-6 border-t border-[#E5E5E5]'>
							<button
								onClick={() => setScreen('setup-1')}
								className='text-sm text-[#6B6B6B] hover:text-black transition cursor-pointer font-medium'
							>
								в†ђ Back
							</button>
							<button
								onClick={finishSetup}
								className='px-6 py-3 bg-black text-white rounded-lg text-sm font-bold hover:opacity-90 transition cursor-pointer'
							>
								{loading ? 'Saving...' : 'Finish setup в†’'}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default function RegisterPage() {
	return (
		<Suspense>
			<RegisterPageInner />
		</Suspense>
	);
}
