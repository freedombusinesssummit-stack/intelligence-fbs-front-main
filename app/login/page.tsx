'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
	const router = useRouter();

	const [isLogin, setIsLogin] = useState(true);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [company, setCompany] = useState('');

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleGoogleLogin = async () => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: 'http://localhost:3000/dashboard',
			},
		});

		if (error) {
			console.error(error.message);
		}
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
			} else {
				res = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: { name, company },
					},
				});
			}

			if (res.error) setError(res.error.message);
			else router.push('/dashboard');
		} catch {
			setError('Something went wrong');
		}

		setLoading(false);
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-[#0A0A0A] px-6'>
			<div className='w-full max-w-md bg-white rounded-[20px] px-9 py-10'>
				{/* LOGO */}
				<div className='text-[20px] font-extrabold tracking-tight mb-9'>
					MigrateIQ
				</div>

				{/* BADGE */}
				<div className='inline-flex items-center gap-2 bg-[#E8F5DF] text-[#2D6A1A] text-[11px] font-bold px-3 py-1 rounded mb-5'>
					<span className='w-[6px] h-[6px] bg-[#AAFF45] rounded-full' />
					Partner Portal
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
					{/* REGISTER */}
					{!isLogin && (
						<>
							<div>
								<label className='text-[12px] font-bold uppercase tracking-wider block mb-2'>
									Name
								</label>
								<input
									type='text'
									value={name}
									onChange={e => setName(e.target.value)}
									className='w-full px-4 py-3 border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black'
									required
								/>
							</div>

							<div>
								<label className='text-[12px] font-bold uppercase tracking-wider block mb-2'>
									Company
								</label>
								<input
									type='text'
									value={company}
									onChange={e => setCompany(e.target.value)}
									className='w-full px-4 py-3 border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black'
									required
								/>
							</div>
						</>
					)}

					{/* EMAIL */}
					<div>
						<label className='text-[12px] font-bold uppercase tracking-wider block mb-2'>
							Email address
						</label>
						<input
							type='email'
							value={email}
							onChange={e => setEmail(e.target.value)}
							placeholder='you@yourfirm.com'
							className='w-full px-4 py-3 border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black placeholder:text-[#bbb]'
							required
						/>
					</div>

					{/* PASSWORD */}
					<div>
						<label className='text-[12px] font-bold uppercase tracking-wider block mb-2'>
							Password
						</label>
						<input
							type='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							placeholder='••••••••'
							className='w-full px-4 py-3 border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black placeholder:text-[#bbb]'
							required
						/>
					</div>

					{/* ERROR */}
					{error && <div className='text-sm text-red-500'>{error}</div>}

					{/* BUTTON */}
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
				<button onClick={handleGoogleLogin} className='w-full py-3 border border-[#E5E5E5] rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#F4F4F2] transition cursor-pointer'>
					<img
						src='https://www.svgrepo.com/show/475656/google-color.svg'
						className='w-[18px]'
					/>
					Continue with Google
				</button>

				{/* FOOTER */}
				<div className='mt-6 text-sm text-[#6B6B6B] text-center'>
					{isLogin ? (
						<>
							Don’t have an account?{' '}
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
