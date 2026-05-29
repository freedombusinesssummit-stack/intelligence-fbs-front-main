'use client';

import { useMemo } from 'react';
import { Tag } from 'lucide-react';
import { useLeadStore } from '@/store/leadStore';
import QuickFilter from '@/components/QuickFilter/QuickFilter';
import { uniqueSorted } from '@/lib/leadFilters';

export default function UtmFilter() {
	const leads = useLeadStore(s => s.leads);
	const utmFilter = useLeadStore(s => s.utmFilter);
	const setUtmFilter = useLeadStore(s => s.setUtmFilter);

	const options = useMemo(
		() => uniqueSorted(leads.map(l => l.utm_source)),
		[leads],
	);

	return (
		<QuickFilter
			Icon={Tag}
			label='UTM Source'
			options={options}
			value={utmFilter}
			onChange={setUtmFilter}
		/>
	);
}
