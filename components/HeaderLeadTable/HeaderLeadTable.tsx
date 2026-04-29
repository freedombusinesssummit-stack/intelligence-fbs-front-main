'use client';

import { useLeadStore } from '@/store/leadStore';
import {
	User,
	Flame,
	BarChart3,
	Briefcase,
	Clock,
	Phone,
	CalendarDays,
} from 'lucide-react';

export default function HeaderLeadTable() {
	const setSort = useLeadStore(s => s.setSort);
	const sortField = useLeadStore(s => s.sortField);
	const sortOrder = useLeadStore(s => s.sortOrder);

	const getArrow = (field: string) => {
		if (sortField !== field) return '↕';
		if (sortOrder === 'asc') return '↑';
		if (sortOrder === 'desc') return '↓';
		return '↕';
	};

	const cell =
		'cursor-pointer flex items-center gap-1 hover:text-gray-600 transition';

	return (
		<div className='grid grid-cols-[30px_2fr_1fr_1fr_1fr_1fr_1fr_1fr_30px] items-center text-[11px] text-gray-400 font-black uppercase border-b border-gray-300 px-4 py-2'>
			<div></div>

			<div onClick={() => setSort('name')} className={cell}>
				Name / Country <User size={14} />
			</div>

			<div onClick={() => setSort('tier')} className={cell}>
				Tier <Flame size={14} />
			</div>

			<div onClick={() => setSort('score')} className={cell}>
				Score <BarChart3 size={14} />
			</div>

			<div onClick={() => setSort('program')} className={cell}>
				Programme <Briefcase size={14} />
			</div>

			<div onClick={() => setSort('timeline')} className={cell}>
				Timeline <Clock size={14} />
			</div>

			<div onClick={() => setSort('status')} className={cell}>
				Call <Phone size={14} />
			</div>

			<div onClick={() => setSort('date')} className={cell}>
				Date Added <CalendarDays size={14} />
			</div>

			<div></div>
		</div>
	);
}
