'use client';

import { useLeadStore } from '@/store/leadStore';
import { COLUMN_DEFS } from '@/lib/columns';
import type { SortableColumnId } from '@/lib/columns';

export default function HeaderLeadTable() {
	const setSort = useLeadStore(s => s.setSort);
	const visibleColumns = useLeadStore(s => s.visibleColumns);

const visibleDefs = COLUMN_DEFS.filter(c => visibleColumns.includes(c.id));
	const gridTemplate = visibleDefs.map(c => c.width ?? '1fr').join(' ');

	const cell = 'cursor-pointer hover:text-gray-600 transition leading-tight pr-2';

	return (
		<div
			className='grid items-start text-[11px] text-gray-400 font-black uppercase border-b border-gray-300 px-4 py-2 gap-x-2 sticky top-0 z-10 bg-white'
			style={{ gridTemplateColumns: gridTemplate }}
		>
			{visibleDefs.map(col => {
				const sortKey = col.sortKey as SortableColumnId | undefined;
				return (
					<div
						key={col.id}
						onClick={() => sortKey && setSort(sortKey)}
						className={sortKey ? cell : 'leading-tight pr-2'}
					>
						{col.label}
					</div>
				);
			})}
		</div>
	);
}
