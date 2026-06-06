'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { supabase } from '@/lib/supabaseClient';
import { useLeadStore } from '@/store/leadStore';

const LS_KEY = 'ob_state_v1';
const TOTAL_STEPS = 5;

const errMsg = (err: unknown, fallback: string) => {
	if (err instanceof Error) return err.message;
	if (err && typeof err === 'object' && 'message' in err)
		return String((err as { message: unknown }).message);
	return fallback;
};

export default function DashboardPage() {
	const { user, profile, forms, fetchUser } = useUserStore();
	const leads = useLeadStore(s => s.leads);

	const [newFormId, setNewFormId] = useState('');
	const [newUtmContent, setNewUtmContent] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	const obPct = useMemo(() => {
		if (!user?.id) return 0;
		try {
			const raw = localStorage.getItem(`${LS_KEY}_${user.id}`);
			if (!raw) return 0;
			const done: string[] = JSON.parse(raw).completed ?? [];
			return Math.round((done.length / TOTAL_STEPS) * 100);
		} catch {
			return 0;
		}
	}, [user]);

	const profileComplete =
		!!profile?.company_name &&
		!!user?.email &&
		!!profile?.full_name &&
		!!profile?.website;

	const addForm = async () => {
		const trimmedId = newFormId.trim();
		const trimmedUtm = newUtmContent.trim();
		if (!trimmedId || !trimmedUtm || !user?.id) return;
		setLoading(true);
		setError(null);
		try {
			const { error } = await supabase.from('partner_forms').insert({
				partner_id: user.id,
				form_id: trimmedId,
				utm_content: trimmedUtm,
			});
			if (error) throw error;
			setNewFormId('');
			setNewUtmContent('');
			setSaved(true);
			setTimeout(() => setSaved(false), 2500);
			await fetchUser();
		} catch (err) {
			setError(errMsg(err, 'Failed to add integration'));
		} finally {
			setLoading(false);
		}
	};

	const removeForm = async (formId: string) => {
		if (!user?.id) return;
		try {
			await supabase
				.from('partner_forms')
				.delete()
				.eq('partner_id', user.id)
				.eq('form_id', formId);
			await fetchUser();
		} catch {}
	};

	const inp =
		'w-full px-3 py-2 border bg-white border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black placeholder:text-[#ccc] transition-colors';
	const firstName =
		profile?.full_name?.split(' ')[0] || profile?.company_name || 'there';
	const allDone = profileComplete && forms.length > 0 && obPct === 100;

	const setupSteps = [
		{
			num: '01',
			title: 'Complete Profile',
			desc: 'Add your company name, website and contact details so leads are attributed correctly.',
			href: '/dashboard/settings',
			done: profileComplete,
			cta: profileComplete ? 'View Profile' : 'Go to Settings',
		},
		{
			num: '02',
			title: 'Campaign Onboarding',
			desc: 'Define your target jurisdictions, programs, and ideal client profile for AI matching.',
			href: '/dashboard/onboarding',
			done: obPct === 100,
			cta: obPct > 0 ? `Continue — ${obPct}%` : 'Start Onboarding',
		},
	];

	return (
		<div className='min-h-screen bg-[#fafafa] px-8 py-7'>
			<div style={{ maxWidth: 780 }}>
				{/* Header */}
				<div className='flex items-start justify-between mb-6'>
					<div>
						<h1 className='text-2xl font-extrabold text-gray-900'>
							Hello, {firstName}
						</h1>
						<p className='text-xs text-gray-400 mt-0.5'>
							{allDone
								? 'Your campaign is active — leads are being matched.'
								: 'Complete the steps below to activate your campaign.'}
						</p>
					</div>
					<Link
						href='/dashboard/leads'
						className='flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors shrink-0'
					>
						⚡ Lead Feed
						{leads.length > 0 && (
							<span className='bg-white text-black text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none'>
								{leads.length}
							</span>
						)}
					</Link>
				</div>

				{/* Stat row */}
				<div className='grid grid-cols-3 gap-3 mb-5'>
					{[
						{
							label: 'Leads matched',
							value: leads.length > 0 ? String(leads.length) : '—',
							sub: leads.length > 0 ? 'in your feed' : 'None yet',
							accent: leads.length > 0,
						},
						{
							label: 'Campaign setup',
							value: `${obPct}%`,
							sub:
								obPct === 100
									? 'Fully configured'
									: `${TOTAL_STEPS - Math.round(obPct / 20)} steps remaining`,
							accent: obPct === 100,
						},
					].map(s => (
						<div
							key={s.label}
							className='bg-white border border-[#E5E5E5] rounded-xl px-4 py-3.5'
						>
							<p className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5'>
								{s.label}
							</p>
							<p
								className={`text-2xl font-extrabold leading-none ${s.accent ? 'text-gray-900' : 'text-gray-300'}`}
							>
								{s.value}
							</p>
							<p className='text-[11px] text-gray-400 mt-1'>{s.sub}</p>
						</div>
					))}
				</div>

				{/* Setup steps */}
				<div className='mb-5'>
					<p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3'>
						Setup Checklist
					</p>
					<div className='grid grid-cols-3 gap-3'>
						{setupSteps.map(s => (
							<div
								key={s.num}
								className={`bg-white rounded-xl border p-4 flex flex-col transition-all ${
									s.done
										? 'border-green-200 bg-green-50/30'
										: 'border-[#E5E5E5]'
								}`}
							>
								<div className='flex items-center justify-between mb-3'>
									<span className='text-xs font-black text-gray-300'>
										{s.num}
									</span>
									<span
										className={`w-2 h-2 rounded-full shrink-0 ${s.done ? 'bg-green-400' : 'bg-amber-300'}`}
									/>
								</div>
								<p className='text-sm font-bold text-gray-900 mb-1.5'>
									{s.title}
								</p>
								<p className='text-[11px] text-gray-400 leading-relaxed flex-1'>
									{s.desc}
								</p>
								<Link
									href={s.href}
									className={`mt-3 text-xs font-semibold transition-colors ${
										s.done
											? 'text-green-600 hover:text-green-700'
											: 'text-black hover:text-gray-500'
									}`}
								>
									{s.cta} →
								</Link>
							</div>
						))}
					</div>
				</div>

				{/* Integration */}
				<div
					id='integration'
					className='bg-white border border-[#E5E5E5] rounded-xl overflow-hidden'
				>
					<div className='px-5 py-4 border-b border-[#F0F0F0]'>
						<div className='flex items-center justify-between mb-3'>
							<h2 className='text-sm font-bold text-gray-900'>
								Form Integrations
							</h2>
							{forms.length > 0 && (
								<span className='text-xs font-semibold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full'>
									{forms.length} connected
								</span>
							)}
						</div>
						<div className='flex items-start gap-2.5 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg'>
							<span className='text-blue-400 text-xs mt-0.5 shrink-0'>ℹ</span>
							<p className='text-xs text-blue-700 leading-relaxed'>
								Don&apos;t have a Form ID or UTM content value yet?{' '}
								<strong className='font-semibold'>
									Contact your administrator
								</strong>{' '}
								— they will provide you with the credentials needed to connect
								your lead source.
							</p>
						</div>
					</div>

					{forms.length > 0 && (
						<div className='divide-y divide-[#F5F5F5]'>
							{forms.map(f => (
								<div
									key={f.form_id}
									className='flex items-center justify-between px-5 py-3'
								>
									<code className='text-[11px] text-gray-400'>
										/api/leads/form/
										<span className='text-gray-900 font-semibold'>
											{f.form_id}
										</span>
										<span>?utm_content=</span>
										<span className='text-gray-900 font-semibold'>
											{f.utm_content}
										</span>
									</code>
									<button
										onClick={() => removeForm(f.form_id)}
										className='text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer ml-6 shrink-0'
									>
										Remove
									</button>
								</div>
							))}
						</div>
					)}

					<div className='px-5 py-4 bg-[#fafafa] border-t border-[#F0F0F0]'>
						<div className='grid grid-cols-2 gap-2 mb-2'>
							<div>
								<label className='text-[10px] font-bold uppercase tracking-wider block mb-1 text-gray-400'>
									Form ID
								</label>
								<input
									className={inp}
									placeholder='e.g. xX4jrr'
									value={newFormId}
									onChange={e => setNewFormId(e.target.value)}
								/>
							</div>
							<div>
								<label className='text-[10px] font-bold uppercase tracking-wider block mb-1 text-gray-400'>
									utm_content
								</label>
								<input
									className={inp}
									placeholder='e.g. facebook_ad'
									value={newUtmContent}
									onChange={e => setNewUtmContent(e.target.value)}
									onKeyDown={e => e.key === 'Enter' && addForm()}
								/>
							</div>
						</div>
						{newFormId.trim() && newUtmContent.trim() && (
							<p className='text-[10px] text-gray-400 font-mono mb-2'>
								→ /api/leads/form/{newFormId.trim()}?utm_content=
								{newUtmContent.trim()}
							</p>
						)}
						<div className='flex items-center gap-3'>
							<button
								onClick={addForm}
								disabled={loading || !newFormId.trim() || !newUtmContent.trim()}
								className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 cursor-pointer ${
									saved
										? 'bg-green-500 text-white'
										: 'bg-black text-white hover:bg-gray-800'
								}`}
							>
								{loading ? '...' : saved ? '✓ Added' : 'Add Integration'}
							</button>
							{error && <p className='text-sm text-red-500'>{error}</p>}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
