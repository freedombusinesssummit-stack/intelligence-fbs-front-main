'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLeadStore } from '@/store/leadStore';
import { useUserStore } from '@/store/useUserStore';
import {
	LayoutDashboard,
	Zap,
	Diamond,
	BarChart2,
	Settings,
	Plus,
	Sparkles,
} from 'lucide-react';

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
				stroke='#AAFF45'
				strokeWidth='4'
				strokeDasharray={`${dash} ${circ}`}
				strokeLinecap='round'
				transform='rotate(-90 18 18)'
				style={{ transition: 'stroke-dasharray 0.5s ease' }}
			/>
			<text x='18' y='22' textAnchor='middle' fontSize='9.5' fontWeight='800' fill='#16a34a'>
				{pct}%
			</text>
		</svg>
	);
}

const TOTAL_STEPS = 5;
const LS_KEY = 'ob_state_v1';

type NavItemDef = {
	href: string;
	icon: React.ReactNode;
	label: string;
	badge?: React.ReactNode;
};

const AsideNav = () => {
	const pathname = usePathname();
	const leadsCount = useLeadStore(s => s.leads.length);
	const { user } = useUserStore();

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

	const mainItems: NavItemDef[] = [
		{
			href: '/dashboard',
			icon: <LayoutDashboard size={17} />,
			label: 'Dashboard',
		},
		{
			href: '/dashboard/leads',
			icon: <Zap size={17} />,
			label: 'Lead Feed',
			badge:
				leadsCount > 0 ? (
					<span className='min-w-5 h-5 px-1.5 flex items-center justify-center bg-[#AAFF45] text-black text-[10px] font-black rounded-full'>
						{leadsCount}
					</span>
				) : undefined,
		},
		{
			href: '/dashboard/intelligence',
			icon: <Diamond size={17} />,
			label: 'Intelligence',
			badge: (
				<span
					className='text-[10px] font-black px-2 py-0.5 rounded-full'
					style={{ background: '#AAFF45', color: '#000' }}
				>
					NEW
				</span>
			),
		},
		{
			href: '/dashboard/analytics',
			icon: <BarChart2 size={17} />,
			label: 'Analytics',
		},
	];

	const accountItems: NavItemDef[] = [
		{
			href: '/dashboard/settings',
			icon: <Settings size={17} />,
			label: 'Settings',
		},
		{
			href: '/dashboard/onboarding',
			icon: <Plus size={17} />,
			label: 'Onboarding',
			badge: <OnboardingCircle pct={obPct} />,
		},
		{
			href: '/dashboard/upgrade',
			icon: <Sparkles size={17} />,
			label: 'Upgrade Plan',
		},
	];

	const renderItem = ({ href, icon, label, badge }: NavItemDef) => {
		const isActive = pathname === href;
		return (
			<Link
				key={href}
				href={href}
				className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
					isActive
						? 'bg-black text-white'
						: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
				}`}
			>
				<div className='flex items-center gap-3'>
					<span style={{ color: isActive ? '#c9e85f' : '' }} className={!isActive ? 'text-gray-400' : ''}>
						{icon}
					</span>
					<span className='text-sm font-medium'>{label}</span>
				</div>
				{badge}
			</Link>
		);
	};

	return (
		<nav className='px-3 py-2 space-y-0.5'>
			{mainItems.map(renderItem)}

			<div className='px-3 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400'>
				Account
			</div>

			{accountItems.map(renderItem)}
		</nav>
	);
};

export default AsideNav;
