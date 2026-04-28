'use client';

import { useLeadStore } from '@/store/leadStore';

export default function TopBarFilters() {
	const filter = useLeadStore(state => state.filter);
	const setFilter = useLeadStore(state => state.setFilter);

	const base =
		'px-3 py-1 text-xs rounded-md flex items-center gap-1 transition';

	const active = 'bg-black text-white';
	const inactive =
		'cursor-pointer border border-gray-200 bg-white text-gray-700 hover:bg-gray-100';

	return (
		<div className='flex items-center gap-1'>
			<button
				onClick={() => setFilter('ALL')}
				className={`${base} ${filter === 'ALL' ? active : inactive}`}
			>
				All
			</button>

			<button
				onClick={() => setFilter('HOT')}
				className={`${base} ${filter === 'HOT' ? active : inactive}`}
			>
				🔴 HOT
			</button>

			<button
				onClick={() => setFilter('WARM')}
				className={`${base} ${filter === 'WARM' ? active : inactive}`}
			>
				🟡 WARM
			</button>

			<button
				onClick={() => setFilter('COLD')}
				className={`${base} ${filter === 'COLD' ? active : inactive}`}
			>
				⚫ COLD
			</button>
		</div>
	);
}
