import { create } from 'zustand';
import { mapLeads } from '@/lib/mapLeads';
import { Lead } from '@/layout/DashBoard/LeadsTable/LeadsTable';

type SortField =
	| 'name'
	| 'tier'
	| 'score'
	| 'program'
	| 'timeline'
	| 'leadStatus'
	| 'status'
	| 'date';
type SortOrder = 'default' | 'asc' | 'desc';
type Tier = 'ALL' | 'HOT' | 'WARM' | 'COLD';

type LeadState = {
	leads: Lead[];
	demoLeads: Lead[];
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
	fetchLeadsDemo: () => Promise<void>;
	updateLeadStatus: (id: number, status: Lead['leadStatus']) => Promise<void>;
};

export const useLeadStore = create<LeadState>((set, get) => ({
	leads: [],
	demoLeads: [],
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
				'https://intelligence-fbs-production-2b6f.up.railway.app/api/leads',
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

	fetchLeadsDemo: async () => {
		set({ loading: true });

		try {
			const res = await fetch(
				'https://intelligence-fbs-production-2b6f.up.railway.app/api/leads/demo',
			);

			const data = await res.json();

			set({
				demoLeads: mapLeads(data),
				lastUpdated: Date.now(),
			});
		} finally {
			set({ loading: false });
		}
	},

	updateLeadStatus: async (id: number, status: Lead['leadStatus']) => {
		set(state => ({
			leads: state.leads.map(lead =>
				lead.id === id ? { ...lead, leadStatus: status } : lead,
			),

			demoLeads: state.demoLeads.map(lead =>
				lead.id === id ? { ...lead, leadStatus: status } : lead,
			),
		}));

		try {
			await fetch(
				`https://intelligence-fbs-production-2b6f.up.railway.app/api/leads/${id}/status`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ status }),
				},
			);
		} catch (e) {
			console.error('❌ Failed to update status in DB', e);

			get().fetchLeads();
			get().fetchLeadsDemo();
		}
	},
}));
