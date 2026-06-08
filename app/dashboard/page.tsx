'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { useLeadStore } from '@/store/leadStore';

const LS_KEY = 'ob_state_v1';

export default function DashboardPage() {
	const { user, profile, fetchUser } = useUserStore();
	const leads = useLeadStore(s => s.leads);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	const completedOb = useMemo(() => {
		if (!user?.id) return new Set<string>();
		try {
			const raw = localStorage.getItem(`${LS_KEY}_${user.id}`);
			if (!raw) return new Set<string>();
			const done: string[] = JSON.parse(raw).completed ?? [];
			return new Set(done);
		} catch {
			return new Set<string>();
		}
	}, [user]);

	const profileComplete =
		!!profile?.company_name &&
		!!user?.email &&
		!!profile?.full_name &&
		!!profile?.website;

	const obSteps = [
		{
			label: 'Complete profile',
			done: profileComplete,
			href: '/dashboard/settings',
		},
		{
			label: 'Jurisdictions & programs',
			done: completedOb.has('jurisdictions') && completedOb.has('programs'),
			href: '/dashboard/onboarding',
		},
		{
			label: 'Define ideal client profile',
			done: completedOb.has('icp'),
			href: '/dashboard/onboarding',
		},
	];
	const obDone = obSteps.filter(s => s.done).length;

	const now = Date.now();
	const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
	const fortyEightHAgo = now - 48 * 60 * 60 * 1000;

	const newLeads7d = leads.filter(
		l => new Date(String(l['Submitted at'])).getTime() > sevenDaysAgo,
	).length;
	const hotAwaiting = leads.filter(
		l => l.tier === 'HOT' && l.leadStatus === 'New',
	).length;
	const activeLeads = leads.filter(l => l.leadStatus === 'Contacted').length;
	const hotUntouched = leads.filter(
		l =>
			l.tier === 'HOT' &&
			l.leadStatus === 'New' &&
			new Date(String(l['Submitted at'])).getTime() < fortyEightHAgo,
	).length;

	const firstName =
		profile?.full_name?.split(' ')[0] || profile?.company_name || 'there';

	return (
		<div className='min-h-screen bg-white px-8 py-8'>
			<div className='max-w-3xl'>
				{/* Lead Feed button */}
				<div className='flex justify-end mb-6'>
					<Link
						href='/dashboard/leads'
						className='flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors'
					>
						<span style={{ color: '#AAFF45' }}>⚡</span> Lead Feed
						{leads.length > 0 && (
							<span className='bg-white text-black text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none'>
								{leads.length}
							</span>
						)}
					</Link>
				</div>

				{/* Greeting */}
				<div className='mb-8'>
					<h1 className='text-center text-3xl font-extrabold text-gray-900 mb-1.5'>
						Hello, {firstName}
					</h1>
					<p className='text-center text-sm text-gray-500'>
						{newLeads7d > 0
							? `${newLeads7d} new lead${newLeads7d !== 1 ? 's' : ''} this week${hotAwaiting > 0 ? ` · ${hotAwaiting} need${hotAwaiting === 1 ? 's' : ''} your attention today.` : '.'}`
							: 'Complete your setup to start receiving leads.'}
					</p>
				</div>

				{/* Onboarding card */}
				<div className='border border-gray-200 rounded-2xl p-6 mb-4'>
					<div className='flex items-start justify-between mb-5'>
						<div>
							<p className='text-[11px] font-black uppercase tracking-widest text-green-500 mb-1'>
								Onboarding
							</p>
							<p className='text-base font-bold text-gray-900'>
								Finish your setup to sharpen lead matching
							</p>
						</div>
						<div className='text-right shrink-0 ml-6'>
							<p className='text-xs text-gray-400 font-medium mb-1.5'>
								{obDone} of {obSteps.length} complete
							</p>
							<div className='w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
								<div
									className='h-full rounded-full transition-all duration-500'
									style={{
										width: `${(obDone / obSteps.length) * 100}%`,
										background: '#111',
									}}
								/>
							</div>
						</div>
					</div>
					<div className='grid grid-cols-3 gap-3'>
						{obSteps.map((step, i) => {
							const isNext =
								!step.done && obSteps.slice(0, i).every(s => s.done);
							return (
								<div
									key={step.label}
									className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
										step.done
											? 'border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200'
											: isNext
												? 'border-black bg-white shadow-sm hover:shadow-md cursor-pointer'
												: 'border-gray-100 bg-gray-50 opacity-50'
									}`}
								>
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
											step.done
												? 'bg-green-500 text-white'
												: isNext
													? 'bg-black text-white'
													: 'bg-gray-200 text-gray-400'
										}`}
									>
										{step.done ? '✓' : i + 1}
									</div>
									<div className='min-w-0'>
										<p className='text-xs font-semibold text-gray-900 leading-snug'>
											{step.label}
										</p>
										{step.done ? (
											<p className='text-[11px] text-green-500 font-medium mt-0.5'>
												Done
											</p>
										) : isNext ? (
											<Link
												href={step.href}
												className='text-[11px] text-gray-400 font-medium mt-0.5 block hover:text-black transition-colors'
											>
												Continue →
											</Link>
										) : null}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Stats row */}
				<div className='grid grid-cols-4 gap-3 mb-4'>
					{[
						{
							label: 'NEW LEADS · 7D',
							value: newLeads7d,
							sub: newLeads7d > 0 ? 'This week' : 'No new leads yet',
							green: false,
						},
						{
							label: 'HOT · AWAITING CONTACT',
							value: hotAwaiting,
							sub: hotAwaiting > 0 ? 'Act today' : 'None pending',
							green: hotAwaiting > 0,
						},
						{
							label: 'ACTIVE LEADS',
							value: activeLeads,
							sub: activeLeads > 0 ? 'In progress' : 'None yet',
							green: false,
						},
						{
							label: 'TOTAL LEADS',
							value: leads.length,
							sub: 'All time',
							green: false,
						},
					].map(s => (
						<div
							key={s.label}
							className={`rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-default ${s.green ? 'border-green-200 bg-green-50 hover:border-green-300' : 'border-gray-100 bg-white hover:border-gray-200'}`}
						>
							<p className='text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 leading-tight'>
								{s.label}
							</p>
							<p className='text-3xl font-extrabold text-gray-900 leading-none mb-1'>
								{s.value}
							</p>
							<p
								className={`text-[11px] font-medium ${s.green ? 'text-green-600' : 'text-gray-400'}`}
							>
								{s.sub}
							</p>
						</div>
					))}
				</div>

				{/* Alert banner — only when hot leads untouched 48h+ */}
				{hotUntouched > 0 && (
					<div
						className='rounded-2xl mb-4 flex items-center justify-between px-5 py-4'
						style={{ background: '#0d0d0d' }}
					>
						<div className='flex items-center gap-3'>
							<div
								className='w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm'
								style={{ background: '#AAFF45' }}
							>
								⚡
							</div>
							<div>
								<p className='text-sm font-bold text-white'>
									{hotUntouched} hot lead{hotUntouched !== 1 ? 's' : ''}{' '}
									untouched for 48h+
								</p>
								<p
									className='text-xs mt-0.5'
									style={{ color: 'rgba(255,255,255,0.4)' }}
								>
									Lead value decays fast — reach out before they go cold.
								</p>
							</div>
						</div>
						<Link
							href='/dashboard/leads'
							className='shrink-0 ml-4 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap'
							style={{ background: '#AAFF45', color: '#000' }}
						>
							Review in Lead Feed →
						</Link>
					</div>
				)}

				{/* Account manager */}
				<div className='flex justify-end'>
					<div className='border border-gray-100 rounded-2xl p-5 w-72'>
						<div className='flex items-center gap-3 mb-3'>
							<div
								className='w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0'
								style={{ background: '#AAFF45', color: '#000' }}
							>
								SM
							</div>
							<div>
								<p className='text-sm font-bold text-gray-900'>Sofia M.</p>
								<p className='text-xs text-gray-400'>
									Your FBS account manager
								</p>
							</div>
						</div>
						<p className='text-xs text-gray-500 leading-relaxed mb-4'>
							Questions about your leads or want to sharpen your ideal client
							profile? I&apos;m one message away.
						</p>
						<button className='w-full py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 hover:bg-black hover:text-white hover:border-black transition-all duration-150 cursor-pointer'>
							Message Sofia
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
