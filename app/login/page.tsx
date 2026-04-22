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

	useEffect(() => {
		const checkUser = async () => {
			const { data } = await supabase.auth.getSession();
			if (data.session) {
				router.push('/dashboard');
			}
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
				// LOGIN
				res = await supabase.auth.signInWithPassword({
					email,
					password,
				});
			} else {
				// REGISTER
				res = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: {
							name,
							company,
						},
					},
				});
			}

			if (res.error) {
				setError(res.error.message);
			} else {
				router.push('/dashboard');
			}
		} catch (err) {
			setError('Something went wrong');
		}

		setLoading(false);
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50'>
			<div className='w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border'>
				{/* TITLE */}
				<h1 className='text-2xl font-semibold text-gray-900 mb-2'>
					{isLogin ? 'Login' : 'Create account'}
				</h1>

				<p className='text-sm text-gray-500 mb-6'>
					{isLogin
						? 'Access your leads dashboard'
						: 'Create your account to get started'}
				</p>

				{/* FORM */}
				<form onSubmit={handleSubmit} className='space-y-4'>
					{/* REGISTER FIELDS */}
					{!isLogin && (
						<>
							<input
								type='text'
								placeholder='Name'
								className='w-full border rounded-lg px-4 py-2 text-sm'
								value={name}
								onChange={e => setName(e.target.value)}
								required
							/>

							<input
								type='text'
								placeholder='Company'
								className='w-full border rounded-lg px-4 py-2 text-sm'
								value={company}
								onChange={e => setCompany(e.target.value)}
								required
							/>
						</>
					)}

					{/* EMAIL */}
					<input
						type='email'
						placeholder='Email'
						className='w-full border rounded-lg px-4 py-2 text-sm'
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
					/>

					{/* PASSWORD */}
					<input
						type='password'
						placeholder='Password'
						className='w-full border rounded-lg px-4 py-2 text-sm'
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
					/>

					{/* ERROR */}
					{error && <div className='text-sm text-red-500'>{error}</div>}

					{/* BUTTON */}
					<button
						type='submit'
						disabled={loading}
						className='w-full bg-black text-white py-2 rounded-lg text-sm hover:opacity-90 transition'
					>
						{loading ? 'Loading...' : isLogin ? 'Login' : 'Create account'}
					</button>
				</form>

				{/* TOGGLE */}
				<div className='mt-6 text-sm text-gray-500 text-center'>
					{isLogin ? (
						<>
							Don’t have an account?{' '}
							<button
								onClick={() => setIsLogin(false)}
								className='text-black font-medium'
							>
								Sign up
							</button>
						</>
					) : (
						<>
							Already have an account?{' '}
							<button
								onClick={() => setIsLogin(true)}
								className='text-black font-medium'
							>
								Login
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
