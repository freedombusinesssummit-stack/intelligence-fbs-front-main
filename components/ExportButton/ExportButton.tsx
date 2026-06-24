'use client';

import { exportLeadsToXLSX } from '@/lib/exportLeadsToXLSX';
import { useLeadStore } from '@/store/leadStore';
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

export default function ExportButton() {
	const leads = useLeadStore(state => state.leads);
	const filter = useLeadStore(state => state.filter);
	const [loading, setLoading] = useState(false);

	const handleExport = async () => {
		const filtered = filter === 'ALL' ? leads : leads.filter(l => l.tier === filter);
		setLoading(true);
		try {
			await exportLeadsToXLSX(filtered);
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			onClick={handleExport}
			disabled={loading}
			className='cursor-pointer w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50'
			title='Export to XLSX'
		>
			{loading
				? <Loader2 size={14} className='animate-spin' />
				: <Download size={14} />
			}
		</button>
	);
}
