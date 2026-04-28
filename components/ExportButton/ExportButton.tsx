'use client';

import { exportLeadsToCSV } from '@/lib/exportLeadsToCSV';
import { useLeadStore } from '@/store/leadStore';

export default function ExportButton() {
	const leads = useLeadStore(state => state.leads);
	const filter = useLeadStore(state => state.filter);

	const handleExport = () => {
		const filteredLeads =
			filter === 'ALL' ? leads : leads.filter(lead => lead.tier === filter);

		exportLeadsToCSV(filteredLeads);
	};

	return (
		<button
			onClick={handleExport}
			className='cursor-pointer w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-500 hover:bg-gray-100'
		>
			↓
		</button>
	);
}
