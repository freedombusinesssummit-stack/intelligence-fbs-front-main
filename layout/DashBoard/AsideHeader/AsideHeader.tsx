import React from 'react';

const AsideHeader = () => {
	return (
		<div className='px-4 py-5 border-b-1 border-gray-300'>
			<div className='flex items-center gap-3'>
				<div className='w-7 h-7 bg-black text-[#AAFF45] flex items-center justify-center rounded-md font-bold'>
					FI
				</div>
				<div>
					<div className='text-sm font-semibold text-gray-900'>
						FBS Intelligence
					</div>
					<div className='text-xs text-gray-500'>Partner Portal</div>
				</div>
			</div>
		</div>
	);
};

export default AsideHeader;
