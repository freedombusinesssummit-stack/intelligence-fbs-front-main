import React from 'react';

const AsideQuota = () => {
	return (
		<div className='bg-gray-50 rounded-lg p-3'>
			<div className='flex justify-between text-xs mb-2'>
				<span className='text-gray-500 font-black'>Lead credits</span>
				<span className='text-orange-500 font-black'>12 / 15</span>
			</div>

			{/* BAR */}
			<div className='w-full h-1.5 bg-gray-200 rounded-full mb-2'>
				<div className='h-1.5 bg-orange-400 rounded-full w-[80%]'></div>
			</div>

			<div className='text-[11px] text-gray-500 mb-2'>
				Business · resets May 1
			</div>

			<button className='w-full text-xs bg-black text-white font-bold py-2 rounded-md hover:opacity-90'>
				3 credits remaining · upgrade
			</button>
		</div>
	);
};

export default AsideQuota;
