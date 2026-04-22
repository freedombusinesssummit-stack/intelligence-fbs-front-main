'use client';

import { useLeadStore } from '@/store/leadStore';

export default function SearchInput() {
	const search = useLeadStore(s => s.search);
	const setSearch = useLeadStore(s => s.setSearch);

	return (
		<div className='flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md text-xs text-gray-500'>
			<span className='text-gray-400'>⌕</span>

			<input
				value={search}
				onChange={e => setSearch(e.target.value)}
				type='text'
				placeholder='Search leads...'
				className='bg-transparent outline-none text-gray-700 placeholder:text-gray-400 w-[160px]'
			/>
		</div>
	);
}
