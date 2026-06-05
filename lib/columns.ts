import { User, Flame, BarChart3, Briefcase, Clock, Phone, CalendarDays, type LucideIcon } from 'lucide-react';

export type ColumnId =
	| 'name'
	| 'tier'
	| 'score'
	| 'leadStatus'
	| 'program'
	| 'timeline'
	| 'status'
	| 'date';

export type SortableColumnId = ColumnId;

export type ColumnDef = {
	id: ColumnId;
	label: string;
	Icon: LucideIcon;
	sortKey?: SortableColumnId;
	defaultVisible: boolean;
};

export const COLUMN_DEFS: ColumnDef[] = [
	{ id: 'name', label: 'Name / Country', Icon: User, sortKey: 'name', defaultVisible: true },
	{ id: 'tier', label: 'Tier', Icon: Flame, sortKey: 'tier', defaultVisible: true },
	{ id: 'score', label: 'Score', Icon: BarChart3, sortKey: 'score', defaultVisible: true },
	{ id: 'leadStatus', label: 'Lead Status', Icon: BarChart3, sortKey: 'leadStatus', defaultVisible: true },
	{ id: 'program', label: 'Residency', Icon: Briefcase, sortKey: 'program', defaultVisible: true },
	{ id: 'timeline', label: 'Timeline', Icon: Clock, sortKey: 'timeline', defaultVisible: true },
	{ id: 'status', label: 'Call', Icon: Phone, sortKey: 'status', defaultVisible: true },
	{ id: 'date', label: 'Date Added', Icon: CalendarDays, sortKey: 'date', defaultVisible: true },
];

export const DEFAULT_VISIBLE_COLUMNS: ColumnId[] = COLUMN_DEFS
	.filter(c => c.defaultVisible)
	.map(c => c.id);