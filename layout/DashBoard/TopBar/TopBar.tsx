import ExportButton from '@/components/ExportButton/ExportButton';
import LastUpdated from '@/components/LastUpdated/LastUpdated';
import ReloadButton from '@/components/ReloadButton/ReloadButton';
import SearchInput from '@/components/SearchInput/SearchInput';
import TopBarFilters from '@/components/TopbarFilters/TopbarFilters';
import ColumnsButton from '@/components/ColumnsButton/ColumnsButton';
import ProgramFilter from '@/components/ProgramFilter/ProgramFilter';
import ProgrammeFilter from '@/components/ProgrammeFilter/ProgrammeFilter';
import IncorporationFilter from '@/components/IncorporationFilter/IncorporationFilter';
import UtmFilter from '@/components/UtmFilter/UtmFilter';
import FormFilter from '@/components/FormFilter/FormFilter';
import React from 'react';

const TopBar = () => {
	return (
		<div className='w-full border-b border-gray-300 bg-white px-5 pt-3 pb-2 flex flex-col gap-2'>
			{/* ROW 1: title + filters */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<span className='text-[18px] font-semibold text-gray-900'>Leads Feed</span>
					<LastUpdated />
					<div className='flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-medium'>
						<span className='w-1.5 h-1.5 bg-green-500 rounded-full'></span>
						LIVE
					</div>
				</div>

			</div>

			{/* ROW 2: filters + search + actions */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-1.5'>
					<TopBarFilters />
					<div className='w-px h-3.5 bg-gray-200' />
					<FormFilter />
					<ProgrammeFilter />
					<IncorporationFilter />
					<ProgramFilter />
					<UtmFilter />
				</div>
				<div className='flex items-center gap-1.5'>
					<SearchInput />
					<ColumnsButton />
					<ExportButton />
					<ReloadButton />
				</div>
			</div>
		</div>
	);
};

export default TopBar;
