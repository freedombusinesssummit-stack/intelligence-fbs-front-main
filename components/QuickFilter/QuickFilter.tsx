'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X, type LucideIcon } from 'lucide-react';

type Props = {
	Icon: LucideIcon;
	label: string;
	options: string[];
	value: string | null;
	onChange: (v: string | null) => void;
};

export default function QuickFilter({ Icon, label, options, value, onChange }: Props) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	if (options.length === 0) return null;

	return (
		<div ref={ref} className='relative'>
			<button
				onClick={() => setOpen(v => !v)}
				className={`flex items-center gap-1.5 text-xs font-medium border rounded-md px-3 py-1.5 transition-colors ${
					value
						? 'border-gray-800 bg-gray-900 text-white'
						: 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
				}`}
			>
				<Icon size={13} />
				<span className='max-w-28 truncate'>{value ?? label}</span>
				{value ? (
					<X
						size={11}
						className='ml-0.5 opacity-70 hover:opacity-100'
						onClick={e => { e.stopPropagation(); onChange(null); }}
					/>
				) : (
					<ChevronDown size={11} className='ml-0.5 opacity-50' />
				)}
			</button>

			{open && (
				<div className='absolute right-0 top-full mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden'>
					<button
						onClick={() => { onChange(null); setOpen(false); }}
						className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${!value ? 'font-bold text-gray-900' : 'text-gray-500'}`}
					>
						All
					</button>
					<div className='border-t border-gray-100 my-1' />
					<div className='max-h-60 overflow-y-auto'>
						{options.map(opt => (
							<button
								key={opt}
								onClick={() => { onChange(opt); setOpen(false); }}
								className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors leading-snug ${value === opt ? 'font-semibold text-gray-900 bg-gray-50' : 'text-gray-700'}`}
							>
								{opt}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
