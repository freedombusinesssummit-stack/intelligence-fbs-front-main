import { User, Flame, BarChart3, Briefcase, Building2, Globe, Clock, Phone, CalendarDays, FileText, type LucideIcon } from 'lucide-react';

export type ColumnId =
	| 'name'
	| 'form'
	| 'tier'
	| 'score'
	| 'leadStatus'
	| 'programme'
	| 'incorporation'
	| 'residency'
	| 'timeline'
	| 'status'
	| 'date';

export type SortableColumnId = 'name' | 'tier' | 'score' | 'leadStatus' | 'timeline' | 'status' | 'date';

export type ColumnDef = {
	id: ColumnId;
	label: string;
	Icon: LucideIcon;
	sortKey?: SortableColumnId;
	defaultVisible: boolean;
	width?: string;
};

export const COLUMN_DEFS: ColumnDef[] = [
	{ id: 'name',                label: 'Name / Country',       Icon: User,         sortKey: 'name',       defaultVisible: true,  width: '0.7fr'  },
	{ id: 'form',                label: 'Event',                Icon: FileText,     defaultVisible: true,  width: '1.0fr'  },
	{ id: 'tier',                label: 'Tier',                 Icon: Flame,        sortKey: 'tier',       defaultVisible: true,  width: '0.75fr' },
	{ id: 'score',               label: 'Score',                Icon: BarChart3,    sortKey: 'score',      defaultVisible: true,  width: '0.45fr' },
	{ id: 'leadStatus',          label: 'Lead Status',          Icon: BarChart3,    sortKey: 'leadStatus', defaultVisible: false, width: '0.8fr'  },
	{ id: 'programme',           label: 'Programme',            Icon: Briefcase,    defaultVisible: true,  width: '1.1fr'  },
	{ id: 'incorporation',       label: 'Incorporation',        Icon: Building2,    defaultVisible: false, width: '1.0fr'  },
	{ id: 'residency',           label: 'Residency',            Icon: Globe,        defaultVisible: true,  width: '1.1fr'  },
	{ id: 'timeline',            label: 'Timeline',             Icon: Clock,        sortKey: 'timeline',   defaultVisible: true,  width: '1.2fr'  },
	{ id: 'status',              label: 'Call',                 Icon: Phone,        sortKey: 'status',     defaultVisible: false, width: '0.9fr'  },
	{ id: 'date',                label: 'Date Added',           Icon: CalendarDays, sortKey: 'date',       defaultVisible: true,  width: '1.0fr'  },
];

export const DEFAULT_VISIBLE_COLUMNS: ColumnId[] = COLUMN_DEFS
	.filter(c => c.defaultVisible)
	.map(c => c.id);
