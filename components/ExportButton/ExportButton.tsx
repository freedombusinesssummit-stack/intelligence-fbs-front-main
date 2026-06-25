'use client';

import { exportLeadsToXLSX } from '@/lib/exportLeadsToXLSX';
import { useLeadStore } from '@/store/leadStore';
import { getLeadPrograms, normalizeProgram } from '@/lib/leadFilters';
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

export default function ExportButton() {
	const leads              = useLeadStore(s => s.leads);
	const filter             = useLeadStore(s => s.filter);
	const partnerFormIds     = useLeadStore(s => s.partnerFormIds);
	const programFilter      = useLeadStore(s => s.programFilter);
	const programmeFilter    = useLeadStore(s => s.programmeFilter);
	const incorporationFilter = useLeadStore(s => s.incorporationFilter);
	const utmFilter          = useLeadStore(s => s.utmFilter);
	const search             = useLeadStore(s => s.search);
	const [loading, setLoading] = useState(false);

	const handleExport = async () => {
		let filtered = partnerFormIds && partnerFormIds.length > 0
			? leads.filter(l => l.formId && partnerFormIds.includes(l.formId))
			: leads;

		if (filter !== 'ALL') {
			filtered = filtered.filter(l => l.tier === filter);
		}

		if (programFilter && programFilter.length > 0) {
			const norm = programFilter.map(normalizeProgram);
			filtered = filtered.filter(l =>
				getLeadPrograms(l).some(p => norm.includes(normalizeProgram(p))),
			);
		}

		if (programmeFilter && programmeFilter.length > 0) {
			const norm = programmeFilter.map(normalizeProgram);
			filtered = filtered.filter(l =>
				norm.includes(normalizeProgram(l.programme)),
			);
		}

		if (incorporationFilter && incorporationFilter.length > 0) {
			const norm = incorporationFilter.map(normalizeProgram);
			filtered = filtered.filter(l =>
				l.incorporation.some(p => norm.includes(normalizeProgram(p))),
			);
		}

		if (utmFilter) {
			filtered = filtered.filter(l => l.utm_source === utmFilter);
		}

		if (search.trim()) {
			const q = search.toLowerCase();
			filtered = filtered.filter(l =>
				[l.name, l.country, l.program, l.status].join(' ').toLowerCase().includes(q),
			);
		}

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
