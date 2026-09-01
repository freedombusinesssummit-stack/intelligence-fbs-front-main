'use client';

import { useLeadStore } from '@/store/leadStore';
import { getLeadPrograms, normalizeProgram } from '@/lib/leadFilters';

type StatProps = {
	type?: 'default' | 'demo';
};

export default function Stat({ type = 'default' }: StatProps) {
	const leads = useLeadStore(s => (type === 'demo' ? s.demoLeads : s.leads));
	const filter = useLeadStore(s => s.filter);
	const partnerFormIds = useLeadStore(s => s.partnerFormIds);

	const programFilter      = useLeadStore(s => s.programFilter);
	const programmeFilter    = useLeadStore(s => s.programmeFilter);
	const incorporationFilter = useLeadStore(s => s.incorporationFilter);
	const utmFilter          = useLeadStore(s => s.utmFilter);
	const formExclude        = useLeadStore(s => s.formExclude);
	const search             = useLeadStore(s => s.search);

	let partnerLeads =
		type === 'default' && partnerFormIds && partnerFormIds.length > 0
			? leads.filter(l => l.formId && partnerFormIds.includes(l.formId))
			: leads;

	if (programFilter && programFilter.length > 0) {
		const norm = programFilter.map(normalizeProgram);
		partnerLeads = partnerLeads.filter(l =>
			getLeadPrograms(l).some(p => norm.includes(normalizeProgram(p))),
		);
	}

	if (programmeFilter && programmeFilter.length > 0) {
		const norm = programmeFilter.map(normalizeProgram);
		partnerLeads = partnerLeads.filter(l =>
			norm.includes(normalizeProgram(l.programme)),
		);
	}

	if (incorporationFilter && incorporationFilter.length > 0) {
		const norm = incorporationFilter.map(normalizeProgram);
		partnerLeads = partnerLeads.filter(l =>
			l.incorporation.some(p => norm.includes(normalizeProgram(p))),
		);
	}

	if (utmFilter) {
		partnerLeads = partnerLeads.filter(l => l.utm_source === utmFilter);
	}

	if (formExclude.length > 0) {
		partnerLeads = partnerLeads.filter(l => !(l.formId && formExclude.includes(l.formId)));
	}

	if (search.trim()) {
		const q = search.toLowerCase();
		partnerLeads = partnerLeads.filter(l =>
			[l.name, l.country, l.program, l.status].join(' ').toLowerCase().includes(q),
		);
	}

	const filtered =
		filter === 'ALL' ? partnerLeads : partnerLeads.filter(l => l.tier === filter);

	const total     = filtered.length;
	const hot       = filtered.filter(l => l.tier === 'HOT').length;
	const warm      = filtered.filter(l => l.tier === 'WARM').length;
	const qualified = filtered.filter(l => l.tier === 'QUALIFIED').length;
	const nurture   = filtered.filter(l => l.tier === 'NURTURE').length;

	const formatNumber = (num: number) => String(num).padStart(2, '0');

	return (
		<div className='w-full grid grid-cols-6 border-b bg-white border-gray-300'>
			<div className='px-4 py-2.5 border-r border-gray-300'>
				<div className='text-[9px] uppercase text-gray-400 tracking-wide'>Total in feed</div>
				<div className='text-2xl font-semibold text-gray-900 mt-0.5'>{formatNumber(total)}</div>
				<div className='text-[10px] font-bold text-gray-400 mt-0.5'>Filtered</div>
			</div>

			<div className='px-4 py-2.5 border-r border-gray-300'>
				<div className='text-[9px] uppercase text-gray-400 tracking-wide'>HOT</div>
				<div className='text-2xl font-semibold text-red-500 mt-0.5'>{formatNumber(hot)}</div>
			</div>

			<div className='px-4 py-2.5 border-r border-gray-300'>
				<div className='text-[9px] uppercase text-gray-400 tracking-wide'>WARM</div>
				<div className='text-2xl font-semibold text-orange-500 mt-0.5'>{formatNumber(warm)}</div>
			</div>

			<div className='px-4 py-2.5 border-r border-gray-300'>
				<div className='text-[9px] uppercase text-gray-400 tracking-wide'>QUALIFIED</div>
				<div className='text-2xl font-semibold text-green-600 mt-0.5'>{formatNumber(qualified)}</div>
			</div>

			<div className='px-4 py-2.5 border-r border-gray-300'>
				<div className='text-[9px] uppercase text-gray-400 tracking-wide'>NURTURE</div>
				<div className='text-2xl font-semibold text-gray-400 mt-0.5'>{formatNumber(nurture)}</div>
				<div className='text-[10px] text-gray-400 mt-0.5'>Low priority</div>
			</div>

			<div className='px-4 py-2.5'>
				<div className='text-[9px] uppercase text-gray-400 tracking-wide'>Visible now</div>
				<div className='text-2xl font-semibold text-green-600 mt-0.5'>{formatNumber(total)}</div>
				<div className='text-[10px] text-gray-400 mt-0.5'>after filters</div>
			</div>
		</div>
	);
}
