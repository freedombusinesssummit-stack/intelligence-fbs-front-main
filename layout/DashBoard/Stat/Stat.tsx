'use client';

import { useLeadStore } from '@/store/leadStore';
import { getLeadProgram } from '@/lib/leadFilters';

type StatProps = {
	type?: 'default' | 'demo';
};

export default function Stat({ type = 'default' }: StatProps) {
	const leads = useLeadStore(s => (type === 'demo' ? s.demoLeads : s.leads));
	const filter = useLeadStore(s => s.filter);
	const partnerFormIds = useLeadStore(s => s.partnerFormIds);

	const programFilter = useLeadStore(s => s.programFilter);
	const utmFilter = useLeadStore(s => s.utmFilter);

	let partnerLeads =
		type === 'default' && partnerFormIds && partnerFormIds.length > 0
			? leads.filter(l => l.formId && partnerFormIds.includes(l.formId))
			: leads;

	if (programFilter && programFilter.length > 0) {
		partnerLeads = partnerLeads.filter(l => {
			const p = getLeadProgram(l);
			return p != null && programFilter.includes(p);
		});
	}
	if (utmFilter) {
		partnerLeads = partnerLeads.filter(l => l.utm_source === utmFilter);
	}

	const filtered =
		filter === 'ALL' ? partnerLeads : partnerLeads.filter(l => l.tier === filter);

	// 🔥 підрахунки
	const total = filtered.length;

	const hot       = filtered.filter(l => l.tier === 'HOT').length;
	const warm      = filtered.filter(l => l.tier === 'WARM').length;
	const qualified = filtered.filter(l => l.tier === 'QUALIFIED').length;
	const nurture   = filtered.filter(l => l.tier === 'NURTURE').length;
	const formatNumber = (num: number) => String(num).padStart(2, '0');
	return (
		<div className='w-full grid grid-cols-6 border-b bg-white border-gray-300'>
			{/* TOTAL */}
			<div className='px-6 py-4 border-r border-gray-300'>
				<div className='text-[10px] uppercase text-gray-500 tracking-wide'>
					Total in feed
				</div>
				<div className='text-2xl font-semibold text-gray-900 mt-1'>
					{formatNumber(total)}
				</div>
				<div className='text-[11px] font-bold text-gray-500 mt-1'>Filtered</div>
			</div>

			{/* HOT */}
			<div className='px-6 py-4 border-r border-gray-300'>
				<div className='text-[10px] uppercase text-gray-500 tracking-wide'>
					HOT
				</div>
				<div className='text-2xl font-semibold text-red-500 mt-1'>
					{formatNumber(hot)}
				</div>
			</div>

			{/* WARM */}
			<div className='px-6 py-4 border-r border-gray-300'>
				<div className='text-[10px] uppercase text-gray-500 tracking-wide'>
					WARM
				</div>
				<div className='text-2xl font-semibold text-orange-500 mt-1'>
					{formatNumber(warm)}
				</div>
			</div>

			{/* QUALIFIED */}
			<div className='px-6 py-4 border-r border-gray-300'>
				<div className='text-[10px] uppercase text-gray-500 tracking-wide'>QUALIFIED</div>
				<div className='text-2xl font-semibold text-green-600 mt-1'>{formatNumber(qualified)}</div>
			</div>

			{/* NURTURE */}
			<div className='px-6 py-4 border-r border-gray-300'>
				<div className='text-[10px] uppercase text-gray-500 tracking-wide'>NURTURE</div>
				<div className='text-2xl font-semibold text-gray-400 mt-1'>{formatNumber(nurture)}</div>
				<div className='text-[11px] text-gray-400 mt-1'>Low priority</div>
			</div>

			{/* EXTRA */}
			<div className='px-6 py-4'>
				<div className='text-[10px] uppercase text-gray-500 tracking-wide'>
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
