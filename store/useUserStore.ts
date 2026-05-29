'use client';

import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';

type PartnerProfile = {
	id: string;
	company_name: string;
	website: string;
	full_name: string;
	role: string;
	country: string;
	bio: string;
	services: string[];
	jurisdictions: string[];
	nationality: string;
	budget: string;
	timeline: string;
	client_types: string[];
	plan: string;
};

type UserState = {
	user: any;
	profile: PartnerProfile | null;
	formIds: string[];
	loading: boolean;
	fetchUser: () => Promise<void>;
	logout: () => Promise<void>;
};

export const useUserStore = create<UserState>(set => ({
	user: null,
	profile: null,
	formIds: [],
	loading: false,

	fetchUser: async () => {
		set({ loading: true });

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				set({ user: null, profile: null, formIds: [] });
				return;
			}

			const [{ data: profile, error: profileError }, { data: forms, error: formsError }] =
				await Promise.all([
					supabase.from('partner_profiles').select('*').eq('id', user.id).single(),
					supabase.from('partner_forms').select('form_id').eq('partner_id', user.id),
				]);

			if (profileError) console.error(profileError);
			if (formsError) console.error(formsError);

			set({
				user,
				profile,
				formIds: forms?.map((r: { form_id: string }) => r.form_id) ?? [],
			});
		} catch (e) {
			console.error(e);
		} finally {
			set({ loading: false });
		}
	},

	logout: async () => {
		await supabase.auth.signOut();
		set({ user: null, profile: null, formIds: [] });
	},
}));
