import Link from 'next/link';

interface Props {
	title: string;
	description?: string;
}

export default function ComingSoon({ title, description }: Props) {
	return (
		<div className='min-h-[calc(100vh-64px)] bg-[#fafafa] flex items-center justify-center px-6'>
			<div className='max-w-md w-full text-center'>
				{/* Icon */}
				<div className='relative select-none mb-8 flex items-center justify-center'>
					<span
						className='text-[110px] leading-none'
						style={{ filter: 'grayscale(1)', opacity: 0.06 }}
						aria-hidden
					>
						⚙
					</span>
					<span
						className='absolute text-[52px] leading-none'
						style={{ filter: 'none' }}
						aria-hidden
					>
						⚙
					</span>
				</div>

				{/* Badge */}
				<div className='inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F5DF] text-[#2D6A1A] text-[11px] font-bold uppercase tracking-widest rounded-full mb-5'>
					<span
						className='w-1.5 h-1.5 rounded-full bg-[#AAFF45]'
						style={{ animation: 'pulseLime 2.5s ease-in-out infinite' }}
					/>
					In Development
				</div>

				<h1 className='text-2xl font-extrabold text-gray-900 tracking-tight mb-3'>
					{title} is coming soon
				</h1>
				<p className='text-sm text-gray-500 leading-relaxed mb-8'>
					{description ||
						"We're actively building this section. It will be available in an upcoming update."}
				</p>

				<Link
					href='/dashboard'
					className='inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors'
				>
					← Back to Dashboard
				</Link>

				{/* Decorative dots */}
				<div
					className='mt-16 grid grid-cols-8 gap-2 opacity-10 pointer-events-none'
					aria-hidden
				>
					{Array.from({ length: 32 }).map((_, i) => (
						<div
							key={i}
							className='h-1.5 w-1.5 rounded-full bg-gray-400 mx-auto'
							style={{ opacity: (i % 3) === 0 ? 0.9 : 0.3 }}
						/>
					))}
				</div>
			</div>
		</div>
	);
}