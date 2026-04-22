import React from 'react';

const AsideFooter = () => {
	return (
		<div className='flex items-center justify-between bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100'>
			<div className='flex items-center gap-3'>
				<div className='w-9 h-9 bg-black text-white flex items-center justify-center rounded-md text-sm font-semibold'>
					CG
				</div>
				<div>
					<div className='text-sm font-medium text-gray-900'>
						Citizenship Group
					</div>
					<div className='text-xs text-gray-500'>Business · $599/mo</div>
				</div>
			</div>
			<span className='text-gray-400'>›</span>
		</div>
	);
};

export default AsideFooter;
