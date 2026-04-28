import { create } from 'zustand';
import { mapLeads } from '@/lib/mapLeads';
import { Lead } from '@/layout/DashBoard/LeadsTable/LeadsTable';

type SortField =
	| 'name'
	| 'tier'
	| 'score'
	| 'program'
	| 'timeline'
	| 'status'
	| 'date';
type SortOrder = 'default' | 'asc' | 'desc';
type Tier = 'ALL' | 'HOT' | 'WARM' | 'COLD';

type LeadState = {
	leads: Lead[];
	loading: boolean;
	lastUpdated: number | null;
	search: string;
	setSearch: (value: string) => void;

	filter: Tier;
	setFilter: (filter: Tier) => void;

	sortField: SortField | null;
	sortOrder: SortOrder;

	setSort: (field: SortField) => void;

	fetchLeads: () => Promise<void>;
};

export const useLeadStore = create<LeadState>((set, get) => ({
	leads: [],
	loading: false,
	lastUpdated: null,
	filter: 'ALL',

	search: '',

	setSearch: value => set({ search: value }),

	sortField: null,
	sortOrder: 'default',

	setFilter: filter => set({ filter }),

	setSort: field => {
		const { sortField, sortOrder } = get();

		// якщо клік по тому ж полю → циклічне переключення
		if (sortField === field) {
			if (sortOrder === 'default') {
				set({ sortOrder: 'asc' });
			} else if (sortOrder === 'asc') {
				set({ sortOrder: 'desc' });
			} else {
				set({ sortField: null, sortOrder: 'default' });
			}
		} else {
			set({
				sortField: field,
				sortOrder: 'asc',
			});
		}
	},

	fetchLeads: async () => {
		set({ loading: true });

		try {
			const res = await fetch(
				'https://intelligence-fbs-production.up.railway.app/api/leads',
			);
			const data = await res.json();

			set({
				leads: mapLeads(data),
				lastUpdated: Date.now(),
			});
		} finally {
			set({ loading: false });
		}
	},
}));
