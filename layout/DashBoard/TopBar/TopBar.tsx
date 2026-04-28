import ExportButton from '@/components/ExportButton/ExportButton';
import LastUpdated from '@/components/LastUpdated/LastUpdated';
import ReloadButton from '@/components/ReloadButton/ReloadButton';
import SearchInput from '@/components/SearchInput/SearchInput';
import TopBarFilters from '@/components/TopbarFilters/TopbarFilters';
import React from 'react';

const TopBar = () => {
	return (
		<div className='w-full border-b border-gray-300 bg-white px-5 py-3 flex items-center justify-between'>
			{/* LEFT */}
			<div className='flex items-center gap-3'>
				<span className='text-sm font-semibold text-gray-900'>Leads Feed</span>

				<LastUpdated />

				{/* LIVE */}
				<div className='flex items-center gap-1 px-2 py-[2px] bg-green-100 text-green-700 text-[10px] rounded-full font-medium'>
					<span className='w-1.5 h-1.5 bg-green-500 rounded-full'></span>
					LIVE
				</div>
			</div>

			{/* RIGHT */}
			<div className='flex items-center gap-3'>
				{/* SEARCH */}
				<SearchInput />

				{/* FILTERS */}
				<TopBarFilters />
				<ExportButton />
				<ReloadButton />
			</div>
		</div>
	);
};

export default TopBar;
