'use client';

import { useEffect } from 'react';
import LeadsTable from '@/layout/DashBoard/LeadsTable/LeadsTable';
import Stat from '@/layout/DashBoard/Stat/Stat';
import TopBar from '@/layout/DashBoard/TopBar/TopBar';
import { useLeadStore } from '@/store/leadStore';

export default function Home() {
	const { fetchLeads, loading } = useLeadStore();

	useEffect(() => {
		fetchLeads();
	}, []);

	if (loading) return <div>Loading...</div>;

	return (
		<div>
			<TopBar />
			<Stat />
			<LeadsTable />
		</div>
	);
}
