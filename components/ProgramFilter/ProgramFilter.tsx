'use client';

import { useMemo } from 'react';
import { useLeadStore } from '@/store/leadStore';
import { getLeadPrograms, uniqueSorted } from '@/lib/leadFilters';
import MultiSelectFilter from '@/components/MultiSelectFilter/MultiSelectFilter';
import { Globe } from 'lucide-react';

export default function ProgramFilter() {
	const leads = useLeadStore(s => s.leads);
	const programFilter = useLeadStore(s => s.programFilter);
	const setProgramFilter = useLeadStore(s => s.setProgramFilter);

	const options = useMemo(
		() => uniqueSorted(leads.flatMap(getLeadPrograms)),
		[leads],
	);

	return (
		<MultiSelectFilter
			label='Residency'
			icon={Globe}
			options={options}
			selected={programFilter}
			onChange={setProgramFilter}
		/>
	);
}
