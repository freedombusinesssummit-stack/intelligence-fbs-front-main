import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
	try {
		const body = await req.json();

		const {
			email,
			name,
			companyName,
			website,
			fullName,
			role,
			country,
			bio,
			services,
			jurisdictions,
			nationality,
			budget,
			timeline,
			clientTypes,
			plan,
		} = body;

		// ── EMAIL USER ──────────────────────────────────────────────────────────
		await resend.emails.send({
			from: 'onboarding@resend.dev',
			to: email,
			subject: 'Welcome to F Summit',
			html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#0a0a0a;padding:32px 40px;text-align:center;">
            <span style="display:inline-block;width:8px;height:8px;background:#AAFF45;border-radius:50%;margin-right:8px;vertical-align:middle;"></span>
            <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.08em;vertical-align:middle;">FBS INTELLIGENCE</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0a0a0a;letter-spacing:-0.5px;">Welcome, ${fullName || name} 👋</h1>
            <p style="margin:0 0 32px;font-size:15px;color:#6b6b6b;line-height:1.6;">Your partner account has been successfully created. You now have access to the FBS Intelligence platform.</p>
            <a href="https://platform.fsummit.net/dashboard" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.02em;">Go to Dashboard →</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaa;">© ${new Date().getFullYear()} F Summit · Partner Portal</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
		});

		// ── EMAIL ADMIN ─────────────────────────────────────────────────────────
		const row = (label: string, value: string | undefined | null) =>
			value
				? `<tr>
            <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#999;letter-spacing:0.07em;text-transform:uppercase;white-space:nowrap;width:160px;">${label}</td>
            <td style="padding:10px 16px;font-size:14px;color:#0a0a0a;line-height:1.5;">${value}</td>
           </tr>`
				: '';

		const pill = (text: string) =>
			`<span style="display:inline-block;background:#f0f0f0;color:#333;font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;margin:2px 3px 2px 0;">${text}</span>`;

		const pillList = (items: string[] | undefined) =>
			items && items.length ? items.map(pill).join('') : '—';

		const section = (title: string, content: string) => `
      <tr><td colspan="2" style="padding:24px 16px 8px;">
        <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#AAFF45;background:#0a0a0a;display:inline-block;padding:3px 10px;border-radius:4px;">${title}</p>
      </td></tr>
      ${content}
      <tr><td colspan="2" style="padding:0 16px;"><div style="height:1px;background:#f0f0f0;"></div></td></tr>`;

		await resend.emails.send({
			from: 'onboarding@resend.dev',
			to: 'freedom.business.summit@gmail.com',
			subject: `New Partner: ${fullName || name} · ${companyName || '—'}`,
			html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0a0a0a;padding:28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="display:inline-block;width:8px;height:8px;background:#AAFF45;border-radius:50%;margin-right:8px;vertical-align:middle;"></span>
                  <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.08em;vertical-align:middle;">FBS INTELLIGENCE</span>
                </td>
                <td align="right">
                  <span style="background:#1a1a1a;color:#AAFF45;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:0.06em;">NEW PARTNER</span>
                </td>
              </tr>
            </table>
            <h1 style="margin:20px 0 4px;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">${fullName || name}</h1>
            <p style="margin:0;font-size:14px;color:#888;">${companyName || ''} ${role ? '· ' + role : ''}</p>
          </td>
        </tr>

        <!-- Data table -->
        <tr><td style="padding:8px 24px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">

            ${section(
							'Account',
							`
              ${row('Email', email)}
              ${row('Name', fullName || name)}
            `,
						)}

            ${section(
							'Firm',
							`
              ${row('Company', companyName)}
              ${row('Website', website ? `<a href="https://${website}" style="color:#0a0a0a;">${website}</a>` : undefined)}
              ${row('Role', role)}
              ${row('Country', country)}
              ${row('Bio', bio)}
            `,
						)}

            ${section(
							'Specialisation',
							`
              <tr>
                <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#999;letter-spacing:0.07em;text-transform:uppercase;white-space:nowrap;width:160px;">Services</td>
                <td style="padding:10px 16px;">${pillList(services)}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#999;letter-spacing:0.07em;text-transform:uppercase;white-space:nowrap;">Jurisdictions</td>
                <td style="padding:10px 16px;">${pillList(jurisdictions)}</td>
              </tr>
            `,
						)}

            ${section(
							'Client Profile',
							`
              ${row('Nationality', nationality)}
              ${row('Budget', budget)}
              ${row('Timeline', timeline)}
              <tr>
                <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#999;letter-spacing:0.07em;text-transform:uppercase;white-space:nowrap;width:160px;">Client Types</td>
                <td style="padding:10px 16px;">${pillList(clientTypes)}</td>
              </tr>
            `,
						)}

            ${section(
							'Plan',
							`
              ${row('Selected Plan', plan ? `<strong style="color:#0a0a0a;">${plan}</strong>` : undefined)}
            `,
						)}

          </table>
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaa;">Registered ${new Date().toUTCString()} · FBS Partner Portal</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: 'Failed to send email' },
			{ status: 500 },
		);
	}
}
