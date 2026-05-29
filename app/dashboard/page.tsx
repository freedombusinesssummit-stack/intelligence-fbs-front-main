'use client';

import { useEffect } from 'react';
import LeadsTable from '@/layout/DashBoard/LeadsTable/LeadsTable';
import Stat from '@/layout/DashBoard/Stat/Stat';
import TopBar from '@/layout/DashBoard/TopBar/TopBar';
import TableSkeleton from '@/components/TableSkeleton/TableSkeleton';
import { useLeadStore } from '@/store/leadStore';
import { useUserStore } from '@/store/useUserStore';

export default function Home() {
	const { fetchLeads, loading: leadsLoading, setPartnerFormIds } = useLeadStore();
	const { fetchUser, loading: userLoading, formIds } = useUserStore();

	useEffect(() => {
		fetchUser();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (formIds.length > 0) {
			setPartnerFormIds(formIds);
		}
		fetchLeads();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formIds]);

	if (userLoading || leadsLoading) return <TableSkeleton />;

	return (
		<div>
			<TopBar />
			<Stat />
			<LeadsTable />
		</div>
	);
}
