'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
	const router = useRouter();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const checkUser = async () => {
			const { data } = await supabase.auth.getSession();
			if (data.session) router.push('/dashboard');
		};
		checkUser();
	}, []);

	const handleGoogleLogin = async () => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: 'https://platform.fsummit.net/dashboard',
			},
		});
		if (error) console.error(error.message);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const res = await supabase.auth.signInWithPassword({ email, password });
			if (res.error) setError(res.error.message);
			else router.push('/dashboard');
		} catch {
			setError('Something went wrong');
		}

		setLoading(false);
	};

	const inputClass =
		'w-full px-4 py-3 border bg-white border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black placeholder:text-[#bbb] transition-colors';
	const labelClass =
		'text-[12px] font-bold uppercase tracking-wider block mb-2';

	return (
		<div className='min-h-screen flex items-center justify-center bg-white px-6'>
			<div className='w-full max-w-md bg-[#f5f5f5] shadow-2xl rounded-[20px] px-9 py-10'>
				{/* BADGE + LOGO */}
				<div className='flex items-center justify-between mb-5'>
					<div className='inline-flex items-center gap-2 bg-[#E8F5DF] text-[#2D6A1A] text-[11px] font-bold px-3 py-1 rounded'>
						<span className='w-[6px] h-[6px] bg-[#AAFF45] rounded-full' />
						Partner Portal
					</div>
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
				</div>

				{/* TITLE */}
				<h1 className='text-[26px] font-extrabold tracking-tight mb-1'>
					Sign in to your account
				</h1>
				<p className='text-sm text-[#6B6B6B] mb-8 leading-relaxed'>
					Access your leads, audience data, and partner dashboard.
				</p>

				{/* FORM */}
				<form onSubmit={handleSubmit} className='space-y-4'>
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
						{loading ? 'Loading...' : 'Sign in →'}
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
					Don&apos;t have an account?{' '}
					<Link href='/register' className='text-black font-bold'>
						Request access
					</Link>
				</div>
			</div>
		</div>
	);
}