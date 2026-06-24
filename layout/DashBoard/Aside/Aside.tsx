'use client';

import React, { useEffect } from 'react';

import AsideNav from '../AsideNav/AsideNav';
import AsideHeader from '../AsideHeader/AsideHeader';
import AsideQuota from '../AsideQuota/AsideQuota';
import AsideFooter from '../AsideFooter/AsideFooter';

import { useUserStore } from '@/store/useUserStore';

const Aside = () => {
	const { user, profile, fetchUser } = useUserStore();

	useEffect(() => {
		fetchUser();
	}, []);

	return (
		<aside className='w-48 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 z-40'>
			<div>
				<AsideHeader />
				<AsideNav />
			</div>

			<div className='px-3 pb-4 space-y-4'>
				<AsideFooter user={user} profile={profile} />
			</div>
		</aside>
	);
};

export default Aside;
