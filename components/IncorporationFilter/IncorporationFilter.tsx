'use client';

import { useMemo } from 'react';
import { useLeadStore } from '@/store/leadStore';
import { applyFormExclude, uniqueSorted } from '@/lib/leadFilters';
import MultiSelectFilter from '@/components/MultiSelectFilter/MultiSelectFilter';
import { Building2 } from 'lucide-react';

export default function IncorporationFilter() {
	const leads = useLeadStore(s => s.leads);
	const formExclude = useLeadStore(s => s.formExclude);
	const incorporationFilter = useLeadStore(s => s.incorporationFilter);
	const setIncorporationFilter = useLeadStore(s => s.setIncorporationFilter);

	const options = useMemo(
		() => uniqueSorted(applyFormExclude(leads, formExclude).flatMap(l => l.incorporation)),
		[leads, formExclude],
	);

	return (
		<MultiSelectFilter
			label='Incorporation'
			icon={Building2}
			options={options}
			selected={incorporationFilter}
			onChange={setIncorporationFilter}
		/>
	);
}
