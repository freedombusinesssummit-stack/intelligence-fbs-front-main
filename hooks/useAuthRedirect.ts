'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export const useAuthRedirect = () => {
	const router = useRouter();

	useEffect(() => {
		const checkUser = async () => {
			const { data } = await supabase.auth.getSession();

			if (!data.session) {
				router.replace('/login');
			}
		};

		checkUser();
	}, [router]);
};
