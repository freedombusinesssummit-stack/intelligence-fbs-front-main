const AsideHeader = () => {
	return (
		<div className='px-4 py-4'>
			<div className='flex items-center gap-2.5'>
				<div className='w-9 h-9 bg-black text-[#AAFF45] flex items-center justify-center rounded-xl font-extrabold text-sm shrink-0'>
					FI
				</div>
				<div>
					<div className='text-sm font-extrabold text-gray-900 leading-tight'>
						FBS Intelligence
					</div>
					<div className='text-[11px] text-gray-400'>Partner Portal</div>
				</div>
			</div>
		</div>
	);
};

export default AsideHeader;
