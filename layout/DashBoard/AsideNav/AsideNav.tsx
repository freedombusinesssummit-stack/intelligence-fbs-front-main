'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AsideNav = () => {
	const pathname = usePathname();

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
					isActive
						? 'bg-gray-100 text-gray-900'
						: 'text-gray-700 hover:bg-gray-100'
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
			{navItem('/dashboard', '⚡', 'Leads Feed')}
			{navItem(
				'/dashboard/intelligence',
				'◈',
				'Intelligence',
				<span className='text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium'>
					NEW
				</span>,
			)}
			{navItem('/dashboard/analytics', '≋', 'Analytics')}

			<div className='px-3 pt-4 pb-1 text-xs text-gray-400 uppercase'>
				Account
			</div>

			{navItem('/dashboard/settings', '⊙', 'Settings')}
			{navItem('/dashboard/upgrade', '◆', 'Upgrade Plan')}
		</nav>
	);
};

export default AsideNav;
