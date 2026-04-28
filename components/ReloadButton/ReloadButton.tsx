'use client';

import { useLeadStore } from '@/store/leadStore';

export default function ReloadButton() {
	const fetchLeads = useLeadStore(s => s.fetchLeads);
	const loading = useLeadStore(s => s.loading);

	return (
		<button
			onClick={fetchLeads}
			disabled={loading}
			className='cursor-pointer w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50'
		>
			<span className={loading ? 'animate-spin' : ''}>↻</span>
		</button>
	);
}
