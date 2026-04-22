import { Lead } from '@/layout/DashBoard/LeadsTable/LeadsTable';

function format(value: any) {
	return value || '—';
}

function escape(value: any) {
	return String(value).replace(/"/g, '""');
}

function formatTier(tier: Lead['tier']) {
	const map = {
		HOT: '🔴 HOT',
		WARM: '🟡 WARM',
		COLD: '⚫ COLD',
	};

	return map[tier];
}

function formatStatus(status: Lead['status']) {
	const map = {
		Completed: '🟢 Completed',
		'In Call': '🔵 In Call',
		'No Answer': '🟡 No Answer',
		Pending: '⚪ Pending',
	};

	return map[status];
}

function formatDate(date: string) {
	if (!date) return '—';

	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

export function exportLeadsToCSV(leads: Lead[]) {
	const headers = [
		'👤 Name',
		'🌍 Country',
		'🔥 Tier',
		'📊 Score',
		'📈 Progress (%)',
		'📦 Program',
		'⏱ Timeline',
		'📞 Status',
		'📅 Date Added',
	];

	const rows = leads.map(lead => [
		format(lead.name),
		format(lead.country),
		formatTier(lead.tier),
		lead.score ?? '—',
		lead.progress ?? '—',
		format(lead.program),
		format(lead.timeline),
		formatStatus(lead.status),
		formatDate(lead.date),
	]);

	const csvContent = [
		headers.join(';'),
		...rows.map(row => row.map(cell => `"${escape(cell)}"`).join(';')),
	].join('\n');

	downloadCSV(csvContent);
}

function downloadCSV(csv: string) {
	const BOM = '\uFEFF'; // 👈 фикс для Excel

	const blob = new Blob([BOM + csv], {
		type: 'text/csv;charset=utf-8;',
	});

	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;

	const date = new Date().toISOString().split('T')[0];
	link.setAttribute('download', `leads-${date}.csv`);

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
