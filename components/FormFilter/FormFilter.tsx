'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { useLeadStore } from '@/store/leadStore';

export default function FormFilter() {
	const leads = useLeadStore(s => s.leads);
	const formExclude = useLeadStore(s => s.formExclude);
	const setFormExclude = useLeadStore(s => s.setFormExclude);
	const formNames = useLeadStore(s => s.formNames);
	const fetchFormNames = useLeadStore(s => s.fetchFormNames);

	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const options = useMemo(
		() => Array.from(new Set(leads.map(l => l.formId).filter((id): id is string => !!id))),
		[leads],
	);

	useEffect(() => {
		if (options.length > 0) fetchFormNames(options);
	}, [options, fetchFormNames]);

	const sortedOptions = useMemo(
		() => [...options].sort((a, b) => (formNames[a] ?? a).localeCompare(formNames[b] ?? b)),
		[options, formNames],
	);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	if (sortedOptions.length === 0) return null;

	const isChecked = (id: string) => !formExclude.includes(id);
	const includedOptions = sortedOptions.filter(isChecked);
	const isActive = includedOptions.length < sortedOptions.length;

	function toggle(id: string) {
		setFormExclude(
			isChecked(id) ? [...formExclude, id] : formExclude.filter(v => v !== id),
		);
	}

	const displayLabel =
		includedOptions.length === sortedOptions.length
			? 'Form'
			: includedOptions.length === 0
				? 'None'
				: includedOptions.length === 1
					? (formNames[includedOptions[0]] ?? includedOptions[0])
					: `${includedOptions.length} selected`;

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
				<FileText size={13} />
				<span className='max-w-28 truncate'>{displayLabel}</span>
				<ChevronDown size={11} className='ml-0.5 opacity-50' />
			</button>

			{open && (
				<div className='absolute right-0 top-full mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden'>
					<div className='flex items-center justify-between px-3 py-1'>
						<button
							onClick={() => setFormExclude([])}
							className='text-[11px] font-semibold text-gray-700 hover:text-gray-900'
						>
							All
						</button>
						<button
							onClick={() => setFormExclude([...sortedOptions])}
							className='text-[11px] font-semibold text-gray-400 hover:text-gray-700'
						>
							None
						</button>
					</div>
					<div className='border-t border-gray-100 my-1' />
					<div className='max-h-60 overflow-y-auto'>
						{sortedOptions.map(id => {
							const checked = isChecked(id);
							return (
								<button
									key={id}
									onClick={() => toggle(id)}
									className='w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-gray-50 transition-colors leading-snug text-left'
								>
									<span className={`w-3.5 h-3.5 shrink-0 rounded border flex items-center justify-center ${checked ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}>
										{checked && (
											<svg viewBox='0 0 10 8' className='w-2 h-2 fill-white'>
												<path d='M1 4l3 3 5-6' stroke='white' strokeWidth='1.5' fill='none' strokeLinecap='round' strokeLinejoin='round' />
											</svg>
										)}
									</span>
									<span className={checked ? 'font-semibold text-gray-900' : 'text-gray-400'}>{formNames[id] ?? id}</span>
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
