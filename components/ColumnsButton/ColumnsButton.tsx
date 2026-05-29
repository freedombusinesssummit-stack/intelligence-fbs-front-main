'use client';

import { useEffect, useRef, useState } from 'react';
import { Columns3, RotateCcw } from 'lucide-react';
import { useLeadStore } from '@/store/leadStore';
import { COLUMN_DEFS } from '@/lib/columns';

export default function ColumnsButton() {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const visibleColumns = useLeadStore(s => s.visibleColumns);
	const toggleColumn = useLeadStore(s => s.toggleColumn);
	const resetColumns = useLeadStore(s => s.resetColumns);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	return (
		<div ref={ref} className='relative'>
			<button
				onClick={() => setOpen(v => !v)}
				className='flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 hover:border-gray-400 transition-colors'
			>
				<Columns3 size={14} />
				Columns
				{visibleColumns.length !== COLUMN_DEFS.length && (
					<span className='ml-0.5 bg-gray-800 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center'>
						{visibleColumns.length}
					</span>
				)}
			</button>

			{open && (
				<div className='absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 overflow-hidden'>
					<div className='px-3 pb-2 pt-1 flex items-center justify-between border-b border-gray-100'>
						<span className='text-[10px] uppercase font-black text-gray-400 tracking-wider'>
							Visible columns
						</span>
						<button
							onClick={resetColumns}
							className='flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-700 transition-colors'
						>
							<RotateCcw size={10} />
							Reset
						</button>
					</div>

					<div className='mt-1'>
						{COLUMN_DEFS.map(col => {
							const isVisible = visibleColumns.includes(col.id);
							const Icon = col.Icon;
							return (
								<button
									key={col.id}
									onClick={() => toggleColumn(col.id)}
									className='w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left'
								>
									<div
										className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
											isVisible
												? 'bg-gray-900 border-gray-900'
												: 'border-gray-300'
										}`}
									>
										{isVisible && (
											<svg
												className='w-2.5 h-2.5 text-white'
												fill='none'
												viewBox='0 0 10 10'
												stroke='currentColor'
												strokeWidth={2}
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													d='M2 5l2.5 2.5L8 3'
												/>
											</svg>
										)}
									</div>
									<Icon size={13} className='text-gray-400 shrink-0' />
									<span className='text-xs text-gray-700'>{col.label}</span>
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
