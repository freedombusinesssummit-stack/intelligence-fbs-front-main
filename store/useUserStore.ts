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

	loading: boolean;

	fetchUser: () => Promise<void>;
	logout: () => Promise<void>;
};

export const useUserStore = create<UserState>(set => ({
	user: null,
	profile: null,
	loading: false,

	fetchUser: async () => {
		set({ loading: true });

		try {
			// USER
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				set({
					user: null,
					profile: null,
				});

				return;
			}

			// PROFILE
			const { data: profile, error } = await supabase
				.from('partner_profiles')
				.select('*')
				.eq('id', user.id)
				.single();

			if (error) {
				console.error(error);
			}

			set({
				user,
				profile,
			});
		} catch (e) {
			console.error(e);
		} finally {
			set({ loading: false });
		}
	},

	logout: async () => {
		await supabase.auth.signOut();

		set({
			user: null,
			profile: null,
		});
	},
}));
