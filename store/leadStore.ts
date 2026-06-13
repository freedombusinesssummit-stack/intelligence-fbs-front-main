import { create } from 'zustand';
import { mapLeads } from '@/lib/mapLeads';
import { Lead } from '@/layout/DashBoard/LeadsTable/LeadsTable';
import { ColumnId, DEFAULT_VISIBLE_COLUMNS } from '@/lib/columns';
import { storageGet, storageSet } from '@/lib/storage';
import type { PartnerForm } from '@/store/useUserStore';

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
type Tier = 'ALL' | 'HOT' | 'WARM' | 'QUALIFIED' | 'NURTURE';

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

	visibleColumns: ColumnId[];
	toggleColumn: (id: ColumnId) => void;
	resetColumns: () => void;

	programFilter: string[] | null;
	setProgramFilter: (v: string[] | null) => void;

	utmFilter: string | null;
	setUtmFilter: (v: string | null) => void;

	partnerFormIds: string[] | null;
	setPartnerFormIds: (ids: string[]) => void;
	partnerForms: PartnerForm[] | null;
	setPartnerForms: (forms: PartnerForm[]) => void;

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

	visibleColumns: storageGet<ColumnId[]>('fbs_vc3') ?? DEFAULT_VISIBLE_COLUMNS,

	toggleColumn: id =>
		set(state => {
			const next = state.visibleColumns.includes(id)
				? state.visibleColumns.filter(c => c !== id)
				: [...state.visibleColumns, id];
			storageSet('fbs_vc3', next);
			return { visibleColumns: next };
		}),

	resetColumns: () => {
		storageSet('fbs_vc3', DEFAULT_VISIBLE_COLUMNS);
		set({ visibleColumns: DEFAULT_VISIBLE_COLUMNS });
	},

	programFilter: storageGet<string[]>('fbs_pf'),
	setProgramFilter: v => {
		storageSet('fbs_pf', v);
		set({ programFilter: v });
	},

	utmFilter: storageGet<string>('fbs_uf'),
	setUtmFilter: v => {
		storageSet('fbs_uf', v);
		set({ utmFilter: v });
	},

	partnerFormIds: null,
	setPartnerFormIds: ids => set({ partnerFormIds: ids }),
	partnerForms: null,
	setPartnerForms: forms => set({ partnerForms: forms }),

	setSort: field => {
		const { sortField, sortOrder } = get();
		if (sortField === field) {
			if (sortOrder === 'default') set({ sortOrder: 'asc' });
			else if (sortOrder === 'asc') set({ sortOrder: 'desc' });
			else set({ sortField: null, sortOrder: 'default' });
		} else {
			set({ sortField: field, sortOrder: 'asc' });
		}
	},

	fetchLeads: async () => {
		const { partnerForms, partnerFormIds } = get();
		const forms =
			partnerForms ??
			partnerFormIds?.map(id => ({ form_id: id, utm_content: '' }));

		if (!forms || forms.length === 0) {
			set({ leads: [], lastUpdated: Date.now() });
			return;
		}

		set({ loading: true });

		try {
			const results = await Promise.all(
				forms.map(({ form_id, utm_content }) => {
					const url = utm_content
						? `https://intelligence-fbs-production-2b6f.up.railway.app/api/leads/form/${form_id}?utm_content=${encodeURIComponent(utm_content)}`
						: `https://intelligence-fbs-production-2b6f.up.railway.app/api/leads/form/${form_id}`;
					return fetch(url).then(r => r.json());
				}),
			);

			set({ leads: mapLeads(results.flat()), lastUpdated: Date.now() });
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
			set({ demoLeads: mapLeads(data), lastUpdated: Date.now() });
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
					headers: { 'Content-Type': 'application/json' },
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
