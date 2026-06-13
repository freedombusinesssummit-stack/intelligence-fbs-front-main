type Tier = 'New' | 'Contacted';

const tierConfig: Record<
	Tier,
	{
		label: string;
		icon: string;
		className: string;
	}
> = {
	New: {
		label: 'NEW',
		icon: '⚫',
		className: 'border-blue-400 bg-blue-50 text-blue-500',
	},
	Contacted: {
		label: 'CONTACTED',
		icon: '🟢',
		className: 'bg-green-100 text-green-600',
	},
};

export default function LeadStatusBadge({ tier }: { tier: Tier }) {
	const config = tierConfig[tier];

	return (
		<span
			className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${config.className}`}
		>
			<span>{config.icon}</span>
			{config.label}
		</span>
	);
}
