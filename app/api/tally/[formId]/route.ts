import { NextResponse } from 'next/server';

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ formId: string }> },
) {
	const { formId } = await params;
	const apiKey = process.env.TALLY_API_KEY;

	if (!apiKey) {
		return NextResponse.json({ error: 'Tally API key not configured' }, { status: 500 });
	}

	try {
		const res = await fetch(`https://api.tally.so/forms/${formId}`, {
			headers: { Authorization: `Bearer ${apiKey}` },
		});

		if (!res.ok) {
			return NextResponse.json({ error: 'Form not found' }, { status: res.status });
		}

		const data = await res.json();
		return NextResponse.json({ name: typeof data.name === 'string' && data.name ? data.name : formId });
	} catch {
		return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
	}
}
