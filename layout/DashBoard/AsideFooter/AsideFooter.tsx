import React from 'react';

type AsideFooterProps = {
	user?: any;
	profile?: any;
};

const AsideFooter = ({ user, profile }: AsideFooterProps) => {
	const companyName = profile?.company_name || 'Partner Account';

	const initials = companyName
		.split(' ')
		.map((word: string) => word[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className='flex items-center justify-between bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100'>
			<div className='flex items-center gap-3'>
				<div className='w-9 h-9 bg-black text-white flex items-center justify-center rounded-md text-sm font-semibold'>
					{initials}
				</div>

				<div>
					<div className='text-sm font-medium text-gray-900'>{companyName}</div>

					<div className='text-xs text-gray-500'>
						{user?.email || 'No email'}
					</div>
				</div>
			</div>

			<span className='text-gray-400'>›</span>
		</div>
	);
};

export default AsideFooter;
