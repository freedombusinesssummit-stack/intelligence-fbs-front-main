type Tier = 'HOT' | 'WARM' | 'COLD';

const tierConfig: Record<
	Tier,
	{
		label: string;
		icon: string;
		className: string;
	}
> = {
	HOT: {
		label: 'HOT',
		icon: '🔴',
		className: 'bg-red-100 text-red-600',
	},
	WARM: {
		label: 'WARM',
		icon: '🟡',
		className: 'bg-yellow-100 text-yellow-700',
	},
	COLD: {
		label: 'COLD',
		icon: '⚫',
		className: 'bg-gray-200 text-gray-600',
	},
};

export default function TierBadge({ tier }: { tier: Tier }) {
	const config = tierConfig[tier];

	return (
		<span
			className={`inline-flex items-center gap-[3px] px-2 py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap ${config.className}`}
		>
			<span>{config.icon}</span>
			{config.label}
		</span>
	);
}
