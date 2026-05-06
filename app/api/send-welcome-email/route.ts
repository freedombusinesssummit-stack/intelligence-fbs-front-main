import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
	try {
		const body = await req.json();

		const { email, name } = body;

		// EMAIL USER
		await resend.emails.send({
			from: 'onboarding@resend.dev',
			to: email,
			subject: 'Welcome to F Summit',
			html: `
      <div style="font-family:Arial;padding:40px;">
        <h1>Welcome, ${name}</h1>
        <p>Your account has been successfully created.</p>
      </div>
    `,
		});

		// EMAIL ADMIN
		await resend.emails.send({
			from: 'onboarding@resend.dev',
			to: 'freedom.business.summit@gmail.com',
			subject: 'New Partner Registration',
			html: `
      <div style="font-family:Arial;padding:40px;">
        <h2>New Partner Registered</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>
    `,
		});

		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error(error);

		return NextResponse.json(
			{ error: 'Failed to send email' },
			{ status: 500 },
		);
	}
}
