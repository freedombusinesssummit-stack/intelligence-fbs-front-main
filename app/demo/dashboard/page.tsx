'use client';

import { useEffect } from 'react';
import LeadsTableDemo from '@/layout/DashBoard/LeadsTable/LeadsTableDemo';
import Stat from '@/layout/DashBoard/Stat/Stat';
import TopBar from '@/layout/DashBoard/TopBar/TopBar';
import { useLeadStore } from '@/store/leadStore';

export default function Home() {
	const { fetchLeadsDemo, loading } = useLeadStore();

	useEffect(() => {
		fetchLeadsDemo();
	}, []);

	if (loading) return <div>Loading...</div>;

	return (
		<div>
			<TopBar />
			<Stat type='demo' />
			<LeadsTableDemo />
		</div>
	);
}
