'use client';

import { useEffect } from 'react';
import LeadsTable from '@/layout/DashBoard/LeadsTable/LeadsTable';
import Stat from '@/layout/DashBoard/Stat/Stat';
import TopBar from '@/layout/DashBoard/TopBar/TopBar';
import TableSkeleton from '@/components/TableSkeleton/TableSkeleton';
import { useLeadStore } from '@/store/leadStore';
import { useUserStore } from '@/store/useUserStore';

export default function LeadFeedPage() {
	const { fetchLeads, loading: leadsLoading, setPartnerFormIds, setPartnerForms } = useLeadStore();
	const { fetchUser, loading: userLoading, forms } = useUserStore();

	useEffect(() => {
		fetchUser();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (forms.length > 0) {
			setPartnerFormIds(forms.map(f => f.form_id));
			setPartnerForms(forms);
		}
		fetchLeads();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [forms]);

	if (userLoading || leadsLoading) return <TableSkeleton />;

	return (
		<div>
			<TopBar />
			<Stat />
			<LeadsTable />
		</div>
	);
}
