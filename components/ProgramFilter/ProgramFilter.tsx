'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Globe, X } from 'lucide-react';
import { useLeadStore } from '@/store/leadStore';
import { getLeadProgram, uniqueSorted } from '@/lib/leadFilters';

export default function ProgramFilter() {
	const leads = useLeadStore(s => s.leads);
	const programFilter = useLeadStore(s => s.programFilter);
	const setProgramFilter = useLeadStore(s => s.setProgramFilter);

	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const options = useMemo(
		() => uniqueSorted(leads.map(getLeadProgram)),
		[leads],
	);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	if (options.length === 0) return null;

	const selected = programFilter ?? [];

	function toggle(opt: string) {
		const next = selected.includes(opt)
			? selected.filter(v => v !== opt)
			: [...selected, opt];
		setProgramFilter(next.length > 0 ? next : null);
	}

	function clear(e: React.MouseEvent) {
		e.stopPropagation();
		setProgramFilter(null);
	}

	const label =
		selected.length === 0
			? 'Residency'
			: selected.length === 1
				? selected[0]
				: `${selected.length} selected`;

	const isActive = selected.length > 0;

	return (
		<div ref={ref} className='relative'>
			<button
				onClick={() => setOpen(v => !v)}
				className={`flex items-center gap-1.5 text-xs font-medium border rounded-md px-3 py-1.5 transition-colors ${
					isActive
						? 'border-gray-800 bg-gray-900 text-white'
						: 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
				}`}
			>
				<Globe size={13} />
				<span className='max-w-28 truncate'>{label}</span>
				{isActive ? (
					<X
						size={11}
						className='ml-0.5 opacity-70 hover:opacity-100'
						onClick={clear}
					/>
				) : (
					<ChevronDown size={11} className='ml-0.5 opacity-50' />
				)}
			</button>

			{open && (
				<div className='absolute right-0 top-full mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden'>
					<button
						onClick={() => { setProgramFilter(null); setOpen(false); }}
						className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${selected.length === 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}
					>
						All
					</button>
					<div className='border-t border-gray-100 my-1' />
					<div className='max-h-60 overflow-y-auto'>
						{options.map(opt => {
							if (opt == null) return null;
							const checked = selected.includes(opt);
							return (
								<button
									key={opt}
									onClick={() => toggle(opt)}
									className='w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-gray-50 transition-colors leading-snug text-left'
								>
									<span
										className={`w-3.5 h-3.5 shrink-0 rounded border flex items-center justify-center ${
											checked
												? 'bg-gray-900 border-gray-900'
												: 'border-gray-300'
										}`}
									>
										{checked && (
											<svg viewBox='0 0 10 8' className='w-2 h-2 fill-white'>
												<path d='M1 4l3 3 5-6' stroke='white' strokeWidth='1.5' fill='none' strokeLinecap='round' strokeLinejoin='round' />
											</svg>
										)}
									</span>
									<span className={checked ? 'font-semibold text-gray-900' : 'text-gray-700'}>
										{opt}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
