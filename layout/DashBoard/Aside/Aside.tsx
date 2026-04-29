import React from 'react';
import AsideNav from '../AsideNav/AsideNav';
import AsideHeader from '../AsideHeader/AsideHeader';
import AsideQuota from '../AsideQuota/AsideQuota';
import AsideFooter from '../AsideFooter/AsideFooter';

const Aside = () => {
	return (
		<aside className='w-[230px] h-screen bg-white border-1 border-gray-300 flex flex-col justify-between'>
			<div>
				<AsideHeader />
				<AsideNav />
			</div>
			<div className='px-3 pb-4 space-y-4'>
				<AsideQuota />
				<AsideFooter />
			</div>
		</aside>
	);
};

export default Aside;
