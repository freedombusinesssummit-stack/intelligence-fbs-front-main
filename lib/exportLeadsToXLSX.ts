import ExcelJS from 'exceljs';
import { Lead } from '@/layout/DashBoard/LeadsTable/LeadsTable';

const TIER_COLORS: Record<Lead['tier'], { bg: string; font: string }> = {
	HOT:       { bg: 'FFFEE2E2', font: 'FF991B1B' },
	WARM:      { bg: 'FFFFF7ED', font: 'FFC2410C' },
	QUALIFIED: { bg: 'FFF0FDF4', font: 'FF166534' },
	NURTURE:   { bg: 'FFF9FAFB', font: 'FF6B7280' },
};

const TIER_LABELS: Record<Lead['tier'], string> = {
	HOT:       '🔴 HOT',
	WARM:      '🟡 WARM',
	QUALIFIED: '🟢 QUALIFIED',
	NURTURE:   '⚫ NURTURE',
};

function fmt(v: unknown): string {
	if (v == null || v === '') return '—';
	return String(v);
}

export async function exportLeadsToXLSX(leads: Lead[]) {
	const wb = new ExcelJS.Workbook();
	wb.creator = 'FSummit Platform';
	wb.created = new Date();

	/* ───────── SHEET 1: LEADS ───────── */
	const ws = wb.addWorksheet('Leads', {
		views: [{ state: 'frozen', ySplit: 1 }],
	});

	const columns: { header: string; key: string; width: number }[] = [
		{ header: 'Name',          key: 'name',          width: 24 },
		{ header: 'Email',         key: 'email',         width: 28 },
		{ header: 'Phone',         key: 'phone',         width: 18 },
		{ header: 'Nationality',   key: 'nationality',   width: 20 },
		{ header: 'Score',         key: 'score',         width: 8  },
		{ header: 'Tier',          key: 'tier',          width: 14 },
		{ header: 'Lead Status',   key: 'leadStatus',    width: 14 },
		{ header: 'Programme',     key: 'programme',     width: 36 },
		{ header: 'Residency',     key: 'residency',     width: 40 },
		{ header: 'Incorporation', key: 'incorporation', width: 32 },
		{ header: 'Timeline',      key: 'timeline',      width: 32 },
		{ header: 'Call Status',   key: 'status',        width: 14 },
		{ header: 'Date Added',    key: 'date',          width: 20 },
		{ header: 'UTM Source',    key: 'utm',           width: 18 },
	];

	ws.columns = columns;

	// Header styling
	const headerRow = ws.getRow(1);
	headerRow.height = 32;
	headerRow.eachCell(cell => {
		cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF111827' } };
		cell.font   = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Calibri' };
		cell.border = {
			bottom: { style: 'thin', color: { argb: 'FF374151' } },
		};
		cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false };
	});

	// Auto-filter
	ws.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + columns.length)}1` };

	// Data rows
	leads.forEach((lead, idx) => {
		const tierColors = TIER_COLORS[lead.tier];
		const submittedAt = lead['Submitted at']
			? new Date(String(lead['Submitted at'])).toLocaleString('en-US', {
					year: 'numeric', month: 'short', day: 'numeric',
					hour: '2-digit', minute: '2-digit',
				})
			: '—';

		const row = ws.addRow({
			name:          fmt(lead.name),
			email:         fmt(lead.email),
			phone:         fmt(lead.phone),
			nationality:   fmt(lead.nationality),
			score:         lead.score ?? '—',
			tier:          TIER_LABELS[lead.tier],
			leadStatus:    fmt(lead.leadStatus),
			programme:     fmt(lead.programme),
			residency:     lead.residency?.join('\n') || '—',
			incorporation: lead.incorporation?.join('\n') || '—',
			timeline:      fmt(lead.timeline),
			status:        fmt(lead.status),
			date:          submittedAt,
			utm:           fmt(lead.utm_source),
		});

		row.height = lead.residency?.length > 1 ? 14 * lead.residency.length + 8 : 22;

		row.eachCell(cell => {
			cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'FFFFFFFF' : 'FFF9FAFB' } };
			cell.font = { size: 10, name: 'Calibri' };
			cell.alignment = { vertical: 'top', wrapText: true };
			cell.border = {
				bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
			};
		});

		// Tier cell color
		const tierCell = row.getCell('tier');
		tierCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tierColors.bg } };
		tierCell.font = { bold: true, size: 10, color: { argb: tierColors.font }, name: 'Calibri' };

		// Score bold
		const scoreCell = row.getCell('score');
		scoreCell.font = { bold: true, size: 11, name: 'Calibri' };
		scoreCell.alignment = { vertical: 'top', horizontal: 'center' };
	});

	/* ───────── SHEET 2: ANSWERS ───────── */
	const ws2 = wb.addWorksheet('Answers', {
		views: [{ state: 'frozen', ySplit: 1 }],
	});

	ws2.columns = [
		{ header: 'Name',     key: 'name',     width: 24 },
		{ header: 'Email',    key: 'email',     width: 28 },
		{ header: 'Section',  key: 'section',   width: 18 },
		{ header: 'Question', key: 'question',  width: 50 },
		{ header: 'Answer',   key: 'answer',    width: 50 },
	];

	const hdr2 = ws2.getRow(1);
	hdr2.height = 32;
	hdr2.eachCell(cell => {
		cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF111827' } };
		cell.font   = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Calibri' };
		cell.alignment = { vertical: 'middle', horizontal: 'left' };
	});

	leads.forEach((lead, idx) => {
		const answers = lead.answers;
		if (!answers) return;

		Object.entries(answers).forEach(([section, questions]) => {
			if (!questions || typeof questions !== 'object') return;
			Object.entries(questions as Record<string, unknown>).forEach(([q, a]) => {
				if (q === 'score' || a == null || String(a).trim() === '') return;
				const row = ws2.addRow({
					name:     fmt(lead.name),
					email:    fmt(lead.email),
					section,
					question: q,
					answer:   fmt(a),
				});
				row.height = 20;
				row.eachCell(cell => {
					cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'FFFFFFFF' : 'FFF9FAFB' } };
					cell.font = { size: 10, name: 'Calibri' };
					cell.alignment = { vertical: 'top', wrapText: true };
					cell.border = { bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } } };
				});
			});
		});
	});

	/* ───────── DOWNLOAD ───────── */
	const buffer = await wb.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	const date = new Date().toISOString().split('T')[0];
	link.download = `leads-${date}.xlsx`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
