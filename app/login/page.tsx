'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Screen = 'auth' | 'setup-1' | 'setup-2';

export default function AuthPage() {
	const router = useRouter();

	const [screen, setScreen] = useState<Screen>('auth');
	const [isLogin, setIsLogin] = useState(true);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [company, setCompany] = useState('');

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [otherJurisdiction, setOtherJurisdiction] = useState('');

	// Setup form state
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

	const [clientProfile, setClientProfile] = useState({
		nationality: '',
		budget: '',
		timeline: '',
		clientTypes: [] as string[],
	});

	// Autofill companyName and fullName from auth screen values
	useEffect(() => {
		if (screen === 'setup-1') {
			setFirmDetails(prev => ({
				...prev,
				companyName: prev.companyName || company,
				fullName: prev.fullName || name,
			}));
		}
	}, [screen]);

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

				nationality: clientProfile.nationality,
				budget: clientProfile.budget,
				timeline: clientProfile.timeline,
				client_types: clientProfile.clientTypes,

				plan: selectedPlan,
			});
			await fetch('/api/send-welcome-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: user.email,
					name: firmDetails.fullName || name,
				}),
			});
			if (error) {
				console.error(error);
				setError(error.message);
				return;
			}

			router.push('/dashboard');
		} catch (err) {
			console.error(err);
			setError('Something went wrong');
		} finally {
			setLoading(false);
		}
	};

	const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

	const handleGoogleLogin = async () => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: 'https://platform.fsummit.net/dashboard',
			},
		});
		if (error) console.error(error.message);
	};

	useEffect(() => {
		const checkUser = async () => {
			const { data } = await supabase.auth.getSession();
			if (data.session) router.push('/dashboard');
		};
		checkUser();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			let res;

			if (isLogin) {
				res = await supabase.auth.signInWithPassword({ email, password });
				if (res.error) setError(res.error.message);
				else router.push('/dashboard');
			} else {
				res = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: { name, company },
					},
				});
				if (res.error) setError(res.error.message);
				else setScreen('setup-1');
			}
		} catch {
			setError('Something went wrong');
		}

		setLoading(false);
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

	const toggleClientType = (type: string) => {
		setClientProfile(prev => ({
			...prev,
			clientTypes: prev.clientTypes.includes(type)
				? prev.clientTypes.filter(t => t !== type)
				: [...prev.clientTypes, type],
		}));
	};

	const getProgressWidth = () => {
		const map: Record<Screen, string> = {
			auth: '0%',
			'setup-1': '50%',
			'setup-2': '100%',
		};
		return map[screen];
	};

	const inputClass =
		'w-full px-4 py-3 border bg-white border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black placeholder:text-[#bbb] transition-colors';
	const labelClass =
		'text-[12px] font-bold uppercase tracking-wider block mb-2';
	const selectClass =
		'w-full px-4 py-3 border bg-white border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black transition-colors appearance-none cursor-pointer';

	// Reusable Logo component
	const Logo = () => (
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

	// ─── AUTH SCREEN ────────────────────────────────────────────────────────────
	if (screen === 'auth') {
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
						{isLogin ? 'Sign in to your account' : 'Create your account'}
					</h1>

					<p className='text-sm text-[#6B6B6B] mb-8 leading-relaxed'>
						{isLogin
							? 'Access your leads, audience data, and partner dashboard.'
							: 'Create your account to get access to the platform'}
					</p>

					{/* FORM */}
					<form onSubmit={handleSubmit} className='space-y-4'>
						{!isLogin && (
							<>
								<div>
									<label className={labelClass}>Name</label>
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
							</>
						)}

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
								placeholder='••••••••'
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
							{loading
								? 'Loading...'
								: isLogin
									? 'Sign in →'
									: 'Create account →'}
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
						<img
							src='https://www.svgrepo.com/show/475656/google-color.svg'
							className='w-[18px]'
							alt='Google'
						/>
						Continue with Google
					</button>

					{/* FOOTER */}
					<div className='mt-6 text-sm text-[#6B6B6B] text-center'>
						{isLogin ? (
							<>
								Don`t have an account?{' '}
								<button
									onClick={() => setIsLogin(false)}
									className='text-black font-bold cursor-pointer'
								>
									Request access
								</button>
							</>
						) : (
							<>
								Already have an account?{' '}
								<button
									onClick={() => setIsLogin(true)}
									className='text-black font-bold cursor-pointer'
								>
									Sign in
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		);
	}

	// ─── SETUP WRAPPER (Steps 1–3) ───────────────────────────────────────────────
	const CheckItem = ({
		label,
		checked,
		onToggle,
	}: {
		label: string;
		checked: boolean;
		onToggle: () => void;
	}) => (
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

				{/* ── STEP 1: Firm details ────────────────────────────────────────── */}
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
									placeholder='Describe your firm in 1–2 sentences. This appears on your partner listing.'
									rows={3}
									className='w-full px-4 py-3 border bg-white border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black placeholder:text-[#bbb] transition-colors resize-none'
								/>
							</div>
						</div>

						<div className='flex items-center justify-between mt-8 pt-6 border-t border-[#E5E5E5]'>
							<button
								onClick={() => setScreen('auth')}
								className='text-sm text-[#6B6B6B] hover:text-black transition cursor-pointer font-medium'
							>
								← Back to login
							</button>
							<button
								onClick={() => setScreen('setup-2')}
								className='px-6 py-3 bg-black text-white rounded-lg text-sm font-bold hover:opacity-90 transition cursor-pointer'
							>
								Continue →
							</button>
						</div>
					</>
				)}

				{/* ── STEP 2: Specialisation ──────────────────────────────────────── */}
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
									'🇵🇹 Portugal',
									'🇲🇹 Malta',
									'🇬🇷 Greece',
									'🇦🇪 UAE',
									'🇺🇸 United States',
									'🇵🇦 Panama',
									'🌏 Caribbean',
									'🇸🇬 Singapore',
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

						<div className='flex items-center justify-between mt-8 pt-6 border-t border-[#E5E5E5]'>
							<button
								onClick={() => setScreen('setup-1')}
								className='text-sm text-[#6B6B6B] hover:text-black transition cursor-pointer font-medium'
							>
								← Back
							</button>
							<button
								onClick={finishSetup}
								className='px-6 py-3 bg-black text-white rounded-lg text-sm font-bold hover:opacity-90 transition cursor-pointer'
							>
								{loading ? 'Saving...' : 'Finish setup →'}
							</button>
						</div>
					</>
				)}

				{/* ── STEP 3: Ideal client ────────────────────────────────────────── */}
				{/* {screen === 'setup-3' && (
					<>
						<div className='text-[11px] font-bold uppercase tracking-widest text-[#999] mb-2'>
							Step 3 of 3
						</div>
						<h1 className='text-[26px] font-extrabold tracking-tight mb-1'>
							Your ideal client
						</h1>
						<p className='text-sm text-[#6B6B6B] mb-8 leading-relaxed'>
							This shapes your matching profile — the more specific you are, the
							better the leads you receive.
						</p>

						<div className='space-y-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className={labelClass}>
										Typical client nationality
									</label>
									<div className='relative'>
										<select
											value={clientProfile.nationality}
											onChange={e =>
												setClientProfile({
													...clientProfile,
													nationality: e.target.value,
												})
											}
											className={selectClass}
										>
											<option>Any nationality</option>
											<option>Pakistani / South Asian</option>
											<option>Middle Eastern (GCC)</option>
											<option>Russian / CIS</option>
											<option>Chinese / Asian</option>
											<option>African</option>
											<option>Latin American</option>
											<option>European</option>
										</select>
										<div className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2'>
											<svg width='12' height='7' viewBox='0 0 12 7' fill='none'>
												<path
													d='M1 1l5 5 5-5'
													stroke='#999'
													strokeWidth='1.5'
													strokeLinecap='round'
													strokeLinejoin='round'
												/>
											</svg>
										</div>
									</div>
								</div>
								<div>
									<label className={labelClass}>Min. investment budget</label>
									<div className='relative'>
										<select
											value={clientProfile.budget}
											onChange={e =>
												setClientProfile({
													...clientProfile,
													budget: e.target.value,
												})
											}
											className={selectClass}
										>
											<option>Any budget</option>
											<option>$50,000+</option>
											<option>$100,000+</option>
											<option>$250,000+</option>
											<option>$500,000+</option>
											<option>$1,000,000+</option>
										</select>
										<div className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2'>
											<svg width='12' height='7' viewBox='0 0 12 7' fill='none'>
												<path
													d='M1 1l5 5 5-5'
													stroke='#999'
													strokeWidth='1.5'
													strokeLinecap='round'
													strokeLinejoin='round'
												/>
											</svg>
										</div>
									</div>
								</div>
							</div>

							<div>
								<label className={labelClass}>Timeline preference</label>
								<div className='relative'>
									<select
										value={clientProfile.timeline}
										onChange={e =>
											setClientProfile({
												...clientProfile,
												timeline: e.target.value,
											})
										}
										className={selectClass}
									>
										<option>Any timeline</option>
										<option>Active (0–6 months)</option>
										<option>Near-term (6–12 months)</option>
										<option>Any — including exploratory leads</option>
									</select>
									<div className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2'>
										<svg width='12' height='7' viewBox='0 0 12 7' fill='none'>
											<path
												d='M1 1l5 5 5-5'
												stroke='#999'
												strokeWidth='1.5'
												strokeLinecap='round'
												strokeLinejoin='round'
											/>
										</svg>
									</div>
								</div>
							</div>

							<div>
								<div className={`${labelClass} mt-2`}>Client type</div>
								<div className='grid grid-cols-2 gap-2'>
									{[
										'Entrepreneurs & founders',
										'Investors & family offices',
										'Expats & families',
										'C-suite & executives',
									].map(type => (
										<CheckItem
											key={type}
											label={type}
											checked={clientProfile.clientTypes.includes(type)}
											onToggle={() => toggleClientType(type)}
										/>
									))}
								</div>
							</div>
						</div>

						<div className='flex items-center justify-between mt-8 pt-6 border-t border-[#E5E5E5]'>
							<button
								onClick={() => setScreen('setup-2')}
								className='text-sm text-[#6B6B6B] hover:text-black transition cursor-pointer font-medium'
							>
								← Back
							</button>
							<button
								onClick={finishSetup}
								className='px-6 py-3 bg-black text-white rounded-lg text-sm font-bold hover:opacity-90 transition cursor-pointer'
							>
								{loading ? 'Saving...' : 'Finish setup →'}
							</button>
						</div>
					</>
				)} */}
			</div>
		</div>
	);
}
