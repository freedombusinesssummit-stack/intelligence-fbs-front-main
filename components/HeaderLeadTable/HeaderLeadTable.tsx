'use client';

import { useLeadStore } from '@/store/leadStore';
import { COLUMN_DEFS } from '@/lib/columns';
import type { SortableColumnId } from '@/lib/columns';

export default function HeaderLeadTable() {
	const setSort = useLeadStore(s => s.setSort);
	const sortField = useLeadStore(s => s.sortField);
	const sortOrder = useLeadStore(s => s.sortOrder);
	const visibleColumns = useLeadStore(s => s.visibleColumns);

	const getArrow = (field: string) => {
		if (sortField !== field) return '↕';
		if (sortOrder === 'asc') return '↑';
		if (sortOrder === 'desc') return '↓';
		return '↕';
	};

	const visibleDefs = COLUMN_DEFS.filter(c => visibleColumns.includes(c.id));
	const gridTemplate = visibleDefs.map(c => c.width ?? '1fr').join(' ') + ' 30px';

	const cell = 'cursor-pointer flex items-center gap-1 hover:text-gray-600 transition';

	return (
		<div
			className='grid items-center text-[11px] text-gray-400 font-black uppercase border-b border-gray-300 px-4 py-2'
			style={{ gridTemplateColumns: gridTemplate }}
		>
			{visibleDefs.map(col => {
				const sortKey = col.sortKey as SortableColumnId | undefined;
				return (
					<div
						key={col.id}
						onClick={() => sortKey && setSort(sortKey)}
						className={sortKey ? cell : 'flex items-center gap-1'}
					>
						{col.label}
						{sortKey && (
							<span className='text-[10px] text-gray-300'>
								{getArrow(sortKey)}
							</span>
						)}
					</div>
				);
			})}
			<div />
		</div>
	);
}
