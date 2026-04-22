import React from 'react';

const AsideNav = () => {
	return (
		<nav className='px-2 py-4 space-y-1 text-sm'>
			{/* ITEM */}
			<div className='flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer'>
				<span>◻</span>
				Dashboard
			</div>

			{/* ACTIVE / HOT */}
			<div className='flex items-center justify-between px-3 py-2 rounded-md bg-gray-100 text-gray-900 cursor-pointer'>
				<div className='flex items-center gap-3'>
					<span>⚡</span>
					Leads Feed
				</div>
				<span className='text-xs bg-red-500 text-white px-2 py-[2px] rounded-full'>
					8
				</span>
			</div>

			{/* NEW */}
			<div className='flex items-center justify-between px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer'>
				<div className='flex items-center gap-3'>
					<span>◈</span>
					Intelligence
				</div>
				<span className='text-[10px] bg-green-100 text-green-700 px-2 py-[2px] rounded-full font-medium'>
					NEW
				</span>
			</div>

			<div className='flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer'>
				<span>≋</span>
				Analytics
			</div>

			{/* SEPARATOR */}
			<div className='px-3 pt-4 pb-1 text-xs text-gray-400 uppercase'>
				Account
			</div>

			{/* ACTIVE */}
			<div className='flex items-center gap-3 px-3 py-2 rounded-md text-gray-900 bg-gray-100 cursor-pointer'>
				<span>⊙</span>
				Settings
			</div>

			<div className='flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer'>
				<span>◆</span>
				Upgrade Plan
			</div>
		</nav>
	);
};

export default AsideNav;
