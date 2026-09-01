'use client';

import { useMemo } from 'react';
import { useLeadStore } from '@/store/leadStore';
import { applyFormExclude, uniqueSorted } from '@/lib/leadFilters';
import MultiSelectFilter from '@/components/MultiSelectFilter/MultiSelectFilter';
import { Briefcase } from 'lucide-react';

export default function ProgrammeFilter() {
	const leads = useLeadStore(s => s.leads);
	const formExclude = useLeadStore(s => s.formExclude);
	const programmeFilter = useLeadStore(s => s.programmeFilter);
	const setProgrammeFilter = useLeadStore(s => s.setProgrammeFilter);

	const options = useMemo(
		() => uniqueSorted(applyFormExclude(leads, formExclude).map(l => l.programme)),
		[leads, formExclude],
	);

	return (
		<MultiSelectFilter
			label='Programme'
			icon={Briefcase}
			options={options}
			selected={programmeFilter}
			onChange={setProgrammeFilter}
		/>
	);
}
