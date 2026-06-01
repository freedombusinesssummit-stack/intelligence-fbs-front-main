import { NextResponse } from 'next/server';

export async function POST(req: Request) {
	try {
		const body = await req.json();

		const res = await fetch(
			`https://intelligence-fbs-production-2b6f.up.railway.app//api/email/registration`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			},
		);

		if (!res.ok) throw new Error('Server error');

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: 'Failed to send email' },
			{ status: 500 },
		);
	}
}
