const COLS = 9;
const ROWS = 10;

const widths = [
	['w-28', 'w-16'],
	['w-12'],
	['w-8'],
	['w-16'],
	['w-24'],
	['w-20'],
	['w-14'],
	['w-32'],
];

function ShimmerRow({ index }: { index: number }) {
	return (
		<div
			className='grid items-center px-4 py-3 border-b border-gray-100'
			style={{ gridTemplateColumns: `repeat(${COLS - 1}, 1fr) 30px` }}
		>
			{/* Name + country */}
			<div className='space-y-1.5'>
				<div className='h-3.5 w-28 bg-gray-200 rounded animate-pulse' style={{ animationDelay: `${index * 40}ms` }} />
				<div className='h-2.5 w-16 bg-gray-100 rounded animate-pulse' style={{ animationDelay: `${index * 40 + 20}ms` }} />
			</div>
			{/* Tier badge */}
			<div className='h-5 w-12 bg-gray-200 rounded-full animate-pulse' style={{ animationDelay: `${index * 40}ms` }} />
			{/* Score */}
			<div className='h-3 w-8 bg-gray-100 rounded animate-pulse' style={{ animationDelay: `${index * 40 + 10}ms` }} />
			{/* Lead status */}
			<div className='h-5 w-16 bg-gray-200 rounded-full animate-pulse' style={{ animationDelay: `${index * 40 + 15}ms` }} />
			{/* Programme */}
			<div className='h-3 w-24 bg-gray-100 rounded animate-pulse' style={{ animationDelay: `${index * 40 + 5}ms` }} />
			{/* Timeline */}
			<div className='h-3 w-20 bg-gray-100 rounded animate-pulse' style={{ animationDelay: `${index * 40 + 25}ms` }} />
			{/* Call status */}
			<div className='h-5 w-14 bg-gray-200 rounded-full animate-pulse' style={{ animationDelay: `${index * 40 + 30}ms` }} />
			{/* Date */}
			<div className='h-3 w-28 bg-gray-100 rounded animate-pulse' style={{ animationDelay: `${index * 40 + 35}ms` }} />
			{/* Arrow */}
			<div />
		</div>
	);
}

export default function TableSkeleton() {
	return (
		<div className='flex flex-col'>
			{/* TopBar skeleton */}
			<div className='w-full border-b border-gray-300 bg-white px-5 py-3 flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
					<div className='h-3.5 w-16 bg-gray-100 rounded animate-pulse' />
					<div className='h-5 w-10 bg-green-100 rounded-full animate-pulse' />
				</div>
				<div className='flex items-center gap-3'>
					<div className='h-7 w-40 bg-gray-100 rounded-lg animate-pulse' />
					<div className='h-7 w-28 bg-gray-100 rounded-lg animate-pulse' />
					<div className='h-7 w-20 bg-gray-100 rounded-lg animate-pulse' />
					<div className='h-7 w-8 bg-gray-100 rounded-lg animate-pulse' />
				</div>
			</div>

			{/* Stats skeleton */}
			<div className='w-full grid grid-cols-5 border-b bg-white border-gray-300'>
				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={i}
						className={`px-6 py-4 space-y-2 ${i < 4 ? 'border-r border-gray-300' : ''}`}
					>
						<div className='h-2.5 w-16 bg-gray-100 rounded animate-pulse' style={{ animationDelay: `${i * 60}ms` }} />
						<div className='h-7 w-10 bg-gray-200 rounded animate-pulse' style={{ animationDelay: `${i * 60 + 20}ms` }} />
						<div className='h-2.5 w-12 bg-gray-100 rounded animate-pulse' style={{ animationDelay: `${i * 60 + 40}ms` }} />
					</div>
				))}
			</div>

			{/* Table header skeleton */}
			<div
				className='grid items-center text-[11px] border-b border-gray-200 px-4 py-2 bg-white'
				style={{ gridTemplateColumns: `repeat(${COLS - 1}, 1fr) 30px` }}
			>
				{Array.from({ length: COLS - 1 }).map((_, i) => (
					<div key={i} className='h-2.5 w-16 bg-gray-100 rounded animate-pulse' style={{ animationDelay: `${i * 30}ms` }} />
				))}
				<div />
			</div>

			{/* Rows skeleton */}
			{Array.from({ length: ROWS }).map((_, i) => (
				<ShimmerRow key={i} index={i} />
			))}
		</div>
	);
}
