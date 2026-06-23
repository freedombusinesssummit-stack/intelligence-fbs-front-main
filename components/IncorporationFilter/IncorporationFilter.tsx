'use client';

import { useMemo } from 'react';
import { useLeadStore } from '@/store/leadStore';
import { uniqueSorted } from '@/lib/leadFilters';
import MultiSelectFilter from '@/components/MultiSelectFilter/MultiSelectFilter';
import { Building2 } from 'lucide-react';

export default function IncorporationFilter() {
	const leads = useLeadStore(s => s.leads);
	const incorporationFilter = useLeadStore(s => s.incorporationFilter);
	const setIncorporationFilter = useLeadStore(s => s.setIncorporationFilter);

	const options = useMemo(
		() => uniqueSorted(leads.flatMap(l => l.incorporation)),
		[leads],
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
