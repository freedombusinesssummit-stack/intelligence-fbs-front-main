'use client';

import { useLeadStore } from '@/store/leadStore';

export default function HeaderLeadTable() {
	const setSort = useLeadStore(s => s.setSort);
	const sortField = useLeadStore(s => s.sortField);
	const sortOrder = useLeadStore(s => s.sortOrder);

	const getArrow = (field: string) => {
		if (sortField !== field) return '↕';
		if (sortOrder === 'asc') return '↑';
		if (sortOrder === 'desc') return '↓';
		return '↕';
	};

	const cell =
		'cursor-pointer flex items-center gap-1 hover:text-gray-600 transition';

	return (
		<div className='grid grid-cols-[30px_3fr_1fr_1fr_1fr_1fr_1fr_1fr_30px] items-center text-[11px] text-gray-400 font-black uppercase border-b border-gray-300 px-4 py-2'>
			<div></div>

			<div onClick={() => setSort('name')} className={cell}>
				Name / Country {getArrow('name')}
			</div>

			<div onClick={() => setSort('tier')} className={cell}>
				Tier {getArrow('tier')}
			</div>

			<div onClick={() => setSort('score')} className={cell}>
				Score {getArrow('score')}
			</div>

			<div onClick={() => setSort('program')} className={cell}>
				Programme {getArrow('program')}
			</div>

			<div onClick={() => setSort('timeline')} className={cell}>
				Timeline {getArrow('timeline')}
			</div>

			<div onClick={() => setSort('status')} className={cell}>
				Call {getArrow('status')}
			</div>

			<div onClick={() => setSort('date')} className={cell}>
				Date Added {getArrow('date')}
			</div>

			<div></div>
		</div>
	);
}
