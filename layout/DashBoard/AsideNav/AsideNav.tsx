'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLeadStore } from '@/store/leadStore';
import { useUserStore } from '@/store/useUserStore';

const TOTAL_STEPS = 5;
const LS_KEY = 'ob_state_v1';

function OnboardingCircle({ pct }: { pct: number }) {
	const r = 14;
	const circ = 2 * Math.PI * r;
	const dash = (pct / 100) * circ;
	return (
		<svg width='36' height='36' viewBox='0 0 36 36' className='shrink-0'>
			<circle cx='18' cy='18' r={r} fill='none' stroke='#dcfce7' strokeWidth='4' />
			<circle
				cx='18' cy='18' r={r}
				fill='none'
				stroke='#22c55e'
				strokeWidth='4'
				strokeDasharray={`${dash} ${circ}`}
				strokeLinecap='round'
				transform='rotate(-90 18 18)'
				style={{ transition: 'stroke-dasharray 0.5s ease' }}
			/>
			<text
				x='18' y='22'
				textAnchor='middle'
				fontSize='9.5'
				fontWeight='800'
				fill='#16a34a'
			>
				{pct}%
			</text>
		</svg>
	);
}

const AsideNav = () => {
	const pathname = usePathname();
	const leadsCount = useLeadStore(s => s.leads.length);
	const { user } = useUserStore();

	const obPct = useMemo(() => {
		if (!user?.id) return 0;
		try {
			const raw = localStorage.getItem(`${LS_KEY}_${user.id}`);
			if (!raw) return 0;
			const state = JSON.parse(raw);
			const done: string[] = state.completed ?? [];
			return Math.round((done.length / TOTAL_STEPS) * 100);
		} catch {
			return 0;
		}
	}, [user]);

	const navItem = (
		href: string,
		icon: string,
		label: string,
		badge?: React.ReactNode,
	) => {
		const isActive = pathname === href;
		return (
			<Link
				href={href}
				className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer ${
					isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
				}`}
			>
				<div className='flex items-center gap-3'>
					<span>{icon}</span>
					{label}
				</div>
				{badge}
			</Link>
		);
	};

	return (
		<nav className='px-2 py-4 space-y-1 text-sm'>
			{navItem('/dashboard', '◻', 'Dashboard')}
			{navItem(
				'/dashboard/leads',
				'⚡',
				'Lead Feed',
				leadsCount > 0 ? (
					<span className='min-w-5 h-5 px-1.5 flex items-center justify-center bg-red-700 text-white text-[11px] font-bold rounded-full'>
						{leadsCount}
					</span>
				) : undefined,
			)}
			{navItem(
				'/dashboard/intelligence',
				'◈',
				'Intelligence',
				<span className='text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium'>
					NEW
				</span>,
			)}
			{navItem('/dashboard/analytics', '≋', 'Analytics')}

			<div className='px-3 pt-4 pb-1 text-xs text-gray-400 uppercase'>Account</div>

			{navItem('/dashboard/settings', '⊙', 'Settings')}
			{navItem('/dashboard/onboarding', '◉', 'Onboarding', <OnboardingCircle pct={obPct} />)}
			{navItem('/dashboard/upgrade', '◆', 'Upgrade Plan')}
		</nav>
	);
};

export default AsideNav;
