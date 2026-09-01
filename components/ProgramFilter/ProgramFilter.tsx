'use client';

import { useMemo } from 'react';
import { useLeadStore } from '@/store/leadStore';
import { applyFormExclude, getLeadPrograms, uniqueSorted } from '@/lib/leadFilters';
import MultiSelectFilter from '@/components/MultiSelectFilter/MultiSelectFilter';
import { Globe } from 'lucide-react';

export default function ProgramFilter() {
	const leads = useLeadStore(s => s.leads);
	const formExclude = useLeadStore(s => s.formExclude);
	const programFilter = useLeadStore(s => s.programFilter);
	const setProgramFilter = useLeadStore(s => s.setProgramFilter);

	const options = useMemo(
		() => uniqueSorted(applyFormExclude(leads, formExclude).flatMap(getLeadPrograms)),
		[leads, formExclude],
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
