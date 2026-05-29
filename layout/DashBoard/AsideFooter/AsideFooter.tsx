import React from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type AsideFooterProps = {
	user?: any;
	profile?: any;
};

const AsideFooter = ({ user, profile }: AsideFooterProps) => {
	const router = useRouter();
	const companyName = profile?.company_name || 'Partner Account';

	const initials = companyName
		.split(' ')
		.map((word: string) => word[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	const { logout } = useUserStore();

	const logoutFunction = () => {
		logout();
		router.push('/login');
	};

	return (
		<div className='relative group'>
			{/* MAIN BUTTON */}
			<div className='flex items-center justify-between bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition'>
				<div className='flex items-center gap-3'>
					<div className='w-9 h-9 bg-black text-white flex items-center justify-center rounded-md text-sm font-semibold'>
						{initials}
					</div>

					<div>
						<div className='text-sm font-medium text-gray-900 break-words max-w-[127px]'>
							{companyName}
						</div>

						<div className='text-xs text-gray-500 break-words max-w-[127px]'>
							{user?.email || 'No email'}
						</div>
					</div>
				</div>

				<span className='text-gray-400'>›</span>
			</div>

			{/* DROPDOWN */}
			<div className='absolute left-full bottom-0 ml-2 w-52 bg-white border border-gray-200 rounded-sm shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden'>
				<button
					onClick={logoutFunction}
					className='w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-50 transition cursor-pointer'
				>
					Log Out
				</button>

				<Link
					href='/dashboard/settings'
					className='block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer'
				>
					Account Settings
				</Link>

				<button className='w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer'>
					Billing
				</button>

				<Link
					href='/demo/dashboard'
					className='block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer border-t border-gray-100'
				>
					Demo
				</Link>
			</div>
		</div>
	);
};

export default AsideFooter;
