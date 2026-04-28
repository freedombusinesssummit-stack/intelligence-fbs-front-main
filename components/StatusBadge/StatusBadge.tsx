type Status = 'Completed' | 'In Call' | 'Pending' | 'No Answer';

const statusConfig: Record<
	Status,
	{
		label: string;
		className: string;
	}
> = {
	Completed: {
		label: 'Completed',
		className: 'text-green-600',
	},
	'In Call': {
		label: 'In Call',
		className: 'text-blue-600',
	},
	'No Answer': {
		label: 'No Answer',
		className: 'text-yellow-600',
	},
	Pending: {
		label: 'Pending',
		className: 'text-gray-500',
	},
};

export default function StatusBadge({ status }: { status: Status }) {
	const config = statusConfig[status];

	return (
		<span
			className={`flex items-center gap-1 text-[11px] font-semibold ${config.className}`}
		>
			<span className='w-1.5 h-1.5 rounded-full bg-current'></span>
			{config.label}
		</span>
	);
}
