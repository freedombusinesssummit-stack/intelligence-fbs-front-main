'use client';

import { useLeadStore } from '@/store/leadStore';

export default function Stat() {
	const leads = useLeadStore(s => s.leads);
	const filter = useLeadStore(s => s.filter);

	// 🔥 фільтр як у таблиці
	const filtered =
		filter === 'ALL' ? leads : leads.filter(l => l.tier === filter);

	// 🔥 підрахунки
	const total = filtered.length;

	const hot = filtered.filter(l => l.tier === 'HOT').length;
	const warm = filtered.filter(l => l.tier === 'WARM').length;
	const cold = filtered.filter(l => l.tier === 'COLD').length;
	const formatNumber = (num: number) => String(num).padStart(2, '0');
	return (
		<div className='w-full grid grid-cols-5 border-b bg-white border-gray-300'>
			{/* TOTAL */}
			<div className='px-6 py-4 border-r border-gray-300'>
				<div className='text-[10px] uppercase text-gray-400 tracking-wide'>
					Total in feed
				</div>
				<div className='text-2xl font-semibold text-gray-900 mt-1'>
					{formatNumber(total)}
				</div>
				<div className='text-[11px] font-bold text-gray-500 mt-1'>Filtered</div>
			</div>

			{/* HOT */}
			<div className='px-6 py-4 border-r border-gray-300'>
				<div className='text-[10px] uppercase text-gray-400 tracking-wide'>
					HOT
				</div>
				<div className='text-2xl font-semibold text-red-500 mt-1'>
					{formatNumber(hot)}
				</div>
			</div>

			{/* WARM */}
			<div className='px-6 py-4 border-r border-gray-300'>
				<div className='text-[10px] uppercase text-gray-400 tracking-wide'>
					WARM
				</div>
				<div className='text-2xl font-semibold text-orange-500 mt-1'>
					{formatNumber(warm)}
				</div>
			</div>

			{/* COLD */}
			<div className='px-6 py-4 border-r border-gray-300'>
				<div className='text-[10px] uppercase text-gray-400 tracking-wide'>
					COLD
				</div>
				<div className='text-2xl font-semibold text-gray-500 mt-1'>
					{formatNumber(cold)}
				</div>
				<div className='text-[11px] text-gray-500 mt-1'>Low priority</div>
			</div>

			{/* EXTRA */}
			<div className='px-6 py-4'>
				<div className='text-[10px] uppercase text-gray-400 tracking-wide'>
					Visible now
				</div>
				<div className='text-2xl font-semibold text-green-600 mt-1'>
					{formatNumber(total)}
				</div>
				<div className='text-[11px] text-gray-500 mt-1'>after filters</div>
			</div>
		</div>
	);
}
