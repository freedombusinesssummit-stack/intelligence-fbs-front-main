'use client';

import { useLeadStore } from '@/store/leadStore';

function formatLastUpdated(timestamp: number | null) {
	if (!timestamp) return 'just now';

	const diffMs = Date.now() - timestamp;
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);

	if (diffSec < 60) return 'just now';
	if (diffMin === 1) return '1 min ago';
	if (diffMin < 60) return `${diffMin} min ago`;

	const diffHours = Math.floor(diffMin / 60);
	if (diffHours === 1) return '1 hour ago';
	if (diffHours < 24) return `${diffHours} hours ago`;

	const diffDays = Math.floor(diffHours / 24);
	if (diffDays === 1) return '1 day ago';
	return `${diffDays} days ago`;
}

export default function LeadsMeta() {
	const leads = useLeadStore(s => s.leads);
	const lastUpdated = useLeadStore(s => s.lastUpdated);

	return (
		<span className='text-xs text-gray-500'>
			{leads.length} leads · updated {formatLastUpdated(lastUpdated)}
		</span>
	);
}
