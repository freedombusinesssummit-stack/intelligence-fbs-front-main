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
	updateLeadStatus: (id: number, status: Lead['status']) => Promise<void>;
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

	updateLeadStatus: async (id: number, status: Lead['status']) => {
		// 1. оптимистично обновляем UI
		set(state => ({
			leads: state.leads.map(lead =>
				lead.id === id ? { ...lead, status } : lead,
			),
		}));

		try {
			// 2. отправляем на сервер
			await fetch(`http://localhost:5000/api/leads/${id}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ status }),
			});
			console.log('hello');
		} catch (e) {
			console.error('❌ Failed to update status in DB', e);

			get().fetchLeads();
		}
	},
}));
