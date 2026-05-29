import Link from 'next/link';

export default function NotFound() {
	return (
		<div className='min-h-screen bg-[#fafafa] flex items-center justify-center px-6'>
			<div className='max-w-md w-full text-center'>
				{/* Glitch number */}
				<div className='relative select-none mb-8'>
					<span
						className='text-[120px] font-black tracking-tighter text-gray-100 leading-none block'
						aria-hidden
					>
						404
					</span>
					<span className='absolute inset-0 flex items-center justify-center text-[120px] font-black tracking-tighter text-gray-900 leading-none'>
						404
					</span>
					<span
						className='absolute inset-0 flex items-center justify-center text-[120px] font-black tracking-tighter leading-none'
						style={{
							color: '#AAFF45',
							clipPath: 'inset(40% 0 50% 0)',
							transform: 'translateX(-4px)',
						}}
						aria-hidden
					>
						404
					</span>
				</div>

				{/* Badge */}
				<div className='inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 text-[11px] font-bold uppercase tracking-widest rounded-full mb-5'>
					<span className='w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse' />
					Page not found
				</div>

				<h1 className='text-2xl font-extrabold text-gray-900 tracking-tight mb-3'>
					This page doesn't exist
				</h1>
				<p className='text-sm text-gray-500 leading-relaxed mb-8'>
					The URL you visited is wrong or the page was moved.
					<br />
					Let's get you back to the dashboard.
				</p>

				<Link
					href='/dashboard'
					className='inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors'
				>
					← Back to Dashboard
				</Link>

				{/* Decorative grid */}
				<div className='mt-16 grid grid-cols-6 gap-1.5 opacity-20 pointer-events-none' aria-hidden>
					{Array.from({ length: 24 }).map((_, i) => (
						<div
							key={i}
							className='h-1.5 rounded-full bg-gray-400'
							style={{ opacity: Math.random() * 0.8 + 0.2 }}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
