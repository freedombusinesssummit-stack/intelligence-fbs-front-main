'use client';

import { useMemo } from 'react';
import { Globe } from 'lucide-react';
import { useLeadStore } from '@/store/leadStore';
import QuickFilter from '@/components/QuickFilter/QuickFilter';
import { getLeadProgram, uniqueSorted } from '@/lib/leadFilters';

export default function ProgramFilter() {
	const leads = useLeadStore(s => s.leads);
	const programFilter = useLeadStore(s => s.programFilter);
	const setProgramFilter = useLeadStore(s => s.setProgramFilter);

	const options = useMemo(
		() => uniqueSorted(leads.map(getLeadProgram)),
		[leads],
	);

	return (
		<QuickFilter
			Icon={Globe}
			label='Programme'
			options={options}
			value={programFilter}
			onChange={setProgramFilter}
		/>
	);
}
