type Tier = 'HOT' | 'WARM' | 'QUALIFIED' | 'NURTURE';

const tierConfig: Record<Tier, { label: string; icon: string; className: string }> = {
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
	QUALIFIED: {
		label: 'QUALIFIED',
		icon: '🟢',
		className: 'bg-green-100 text-green-700',
	},
	NURTURE: {
		label: 'NURTURE',
		icon: '⚫',
		className: 'bg-gray-100 text-gray-500',
	},
};

export default function TierBadge({ tier }: { tier: Tier }) {
	const config = tierConfig[tier] ?? tierConfig['NURTURE'];
	return (
		<span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${config.className}`}>
			<span>{config.icon}</span>
			{config.label}
		</span>
	);
}
