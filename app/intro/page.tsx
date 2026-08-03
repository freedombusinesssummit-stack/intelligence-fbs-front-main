'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ──────────────────────────────────────────────
   /intro — client-facing session walkthrough
   Same stack + design language as the main site.
   ────────────────────────────────────────────── */

interface Part {
	n: number;
	title: string;
	time: string;
	body: string;
	link?: { label: string; href: string };
	mock?: boolean;
	plans?: boolean;
}

const PARTS: Part[] = [
	{
		n: 1,
		title: 'Welcome',
		time: '1 min',
		body: 'We start simple: a quick hello, introductions, and a check that the timing still works for you. No slides yet - just a moment to get comfortable before we get into the detail.',
	},
	{
		n: 2,
		title: 'What we will cover',
		time: '2 min',
		body: 'A short look at the plan for today, so you always know where we are and how long we will need. If one part matters more to you than the rest, this is the moment to tell us - we will shape the call around it.',
	},
	{
		n: 3,
		title: 'About FBS Intelligence',
		time: '7 min',
		body: 'The context that makes everything else click. We will share who we are, how Freedom Business Summit grew into a platform across 16+ jurisdictions, and how we began gathering real investor-intent data through our summits. Then we will show how that data becomes the intelligence layer behind every lead you would receive.',
		link: { label: 'See the platform overview', href: '/overview' },
	},
	{
		n: 4,
		title: 'Live demo',
		time: '12 min',
		body: 'The heart of the call. We open the platform and walk it end to end - the partner dashboard, how each prospect is scored with the Global Mobility Score, and how the HOT / WARM / COLD tiers help your team focus on the right people first. You will see exactly what a lead looks like the moment it reaches you.',
		mock: true,
	},
	{
		n: 5,
		title: 'Pricing and next steps',
		time: '6 min',
		body: 'Finally, the practical side: the ways to work with us, what is included in each, and what a sensible first step looks like for your firm. We keep room for your questions and, if it is a fit, agree a clear next move before we close.',
		plans: true,
		link: { label: 'View pricing in detail', href: '/pricing' },
	},
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  :root{
    --black:#0A0A0A;--off:#F4F4F2;--cream:#EBEBEB;--white:#FFFFFF;
    --lime:#AAFF45;--lime2:#8EE032;--lime-soft:#E8F5DF;--lime-dark:#5A8A20;
    --muted:#6B6B6B;--border:#E5E5E5;--text:#0A0A0A;--text2:#3A3A3A;
    --hot:#D94F3A;--warm:#C07D10;--cold:#4A7FC1;
  }
  html{scroll-behavior:smooth}
  body{background:var(--white);color:var(--text);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  .intro-wrap{max-width:1200px;margin:0 auto;padding:0 32px}
  .intro a{color:inherit;text-decoration:none}

  @keyframes introFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes introPulseLime{0%,100%{box-shadow:0 0 0 0 rgba(170,255,69,.5)}50%{box-shadow:0 0 0 10px rgba(170,255,69,0)}}
  .intro .fade-up{animation:introFadeUp .7s cubic-bezier(.16,1,.3,1) both}
  .intro .fu2{animation-delay:.1s}.intro .fu3{animation-delay:.18s}.intro .fu4{animation-delay:.26s}

  .intro nav{position:fixed;top:0;left:0;right:0;z-index:200;background:rgba(255,255,255,.95);backdrop-filter:blur(16px);border-bottom:1px solid var(--border)}
  .intro .nav-inner{display:flex;align-items:center;justify-content:space-between;height:62px}
  .intro .nav-logo{font-size:14px;font-weight:800;color:var(--black);display:flex;align-items:center;gap:10px;letter-spacing:-.02em}
  .intro .nav-logo-dot{width:8px;height:8px;background:var(--lime);border-radius:50%;animation:introPulseLime 2.5s ease-in-out infinite}
  .intro .nav-logo em{font-style:normal;font-weight:400;color:var(--muted);font-size:12px}
  .intro .nav-right{display:flex;align-items:center;gap:24px}
  .intro .nav-link{font-size:12px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:var(--text2);position:relative;padding:4px 0;transition:color .15s}
  .intro .nav-link::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:var(--lime);transform:scaleX(0);transition:transform .2s}
  .intro .nav-link:hover{color:var(--black)}.intro .nav-link:hover::after{transform:scaleX(1)}
  .intro .nav-btn{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;background:var(--black);color:var(--white);padding:9px 18px;border-radius:7px;transition:all .15s}
  .intro .nav-btn:hover{background:var(--lime);color:var(--black)}

  .intro .hero{padding:150px 0 84px;background:var(--white);border-bottom:1px solid var(--border);position:relative;overflow:hidden}
  .intro .hero-grid-bg{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(to bottom,rgba(0,0,0,.04) 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(ellipse 70% 50% at 50% 30%,black 40%,transparent 100%);-webkit-mask-image:radial-gradient(ellipse 70% 50% at 50% 30%,black 40%,transparent 100%);pointer-events:none}
  .intro .hero>.intro-wrap{position:relative;z-index:2}
  .intro .eyebrow{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--lime-dark);margin-bottom:20px;display:inline-flex;align-items:center;gap:10px}
  .intro .eyebrow-line{width:24px;height:1px;background:currentColor;opacity:.4}
  .intro .hero h1{font-size:clamp(40px,5.4vw,66px);font-weight:800;line-height:1.03;letter-spacing:-.035em;color:var(--black);max-width:900px}
  .intro .accent{position:relative;display:inline-block}
  .intro .accent::after{content:'';position:absolute;bottom:.04em;left:-2px;right:-2px;height:.3em;background:var(--lime);z-index:-1;border-radius:2px}
  .intro .hero-sub{font-size:clamp(24px,3.4vw,40px);font-weight:800;line-height:1.08;letter-spacing:-.035em;color:#AAAAAA;margin-top:8px;max-width:900px}
  .intro .hero-desc{font-size:18px;line-height:1.65;color:var(--text2);max-width:600px;margin-top:26px}
  .intro .hero-pill{display:inline-flex;align-items:center;gap:10px;margin-top:30px;padding:6px 16px 6px 6px;background:var(--white);border:1px solid var(--border);border-radius:100px}
  .intro .hero-pill b{background:var(--lime);color:var(--black);font-size:10px;font-weight:800;padding:4px 11px;border-radius:100px;letter-spacing:.08em;text-transform:uppercase}
  .intro .hero-pill span{font-size:13px;color:var(--text);font-weight:500}
  .intro .hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:34px}
  .intro .btn{font-family:'Inter',sans-serif;font-size:13px;font-weight:700;letter-spacing:.01em;padding:14px 26px;border-radius:8px;border:1px solid var(--border);background:var(--white);color:var(--text2);cursor:pointer;transition:all .2s}
  .intro .btn:hover{color:var(--black);border-color:#cfcfcf}
  .intro .btn.primary{background:var(--black);color:var(--white);border-color:var(--black)}
  .intro .btn.primary:hover{background:var(--lime);color:var(--black);border-color:var(--lime);box-shadow:0 12px 32px -8px rgba(170,255,69,.4)}
  .intro .btn:disabled{opacity:.4;cursor:default}

  .intro .section{padding:96px 0}
  .intro .section-off{background:var(--off);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
  .intro .section h2{font-size:clamp(30px,3.8vw,50px);font-weight:800;letter-spacing:-.03em;line-height:1.05;color:var(--black);margin-bottom:16px;max-width:820px}
  .intro .hl-sm{background:linear-gradient(120deg,var(--lime),var(--lime));background-repeat:no-repeat;background-size:100% .32em;background-position:0 88%;padding:0 4px}
  .intro .section-body{font-size:17px;line-height:1.6;color:var(--text2);max-width:620px;margin-bottom:40px}

  .intro .meter{display:flex;align-items:center;gap:16px;margin-bottom:28px}
  .intro .meter-label{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text2);white-space:nowrap}
  .intro .meter-bar{flex:1;height:6px;background:var(--border);border-radius:100px;overflow:hidden}
  .intro .meter-fill{height:100%;background:var(--lime);border-radius:100px;transition:width .45s cubic-bezier(.16,1,.3,1)}
  .intro .meter-total{font-size:12px;font-weight:700;color:var(--black);white-space:nowrap;font-variant-numeric:tabular-nums}

  .intro .walk{display:grid;grid-template-columns:340px 1fr;gap:28px;align-items:start}
  .intro .steps{display:flex;flex-direction:column;gap:8px}
  .intro .step{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;width:100%;text-align:left;font-family:'Inter',sans-serif;background:var(--white);border:1px solid var(--border);border-radius:14px;padding:15px 16px;cursor:pointer;transition:all .2s;color:inherit}
  .intro .step:hover{border-color:#cfcfcf}
  .intro .step.active{border-color:var(--lime2);box-shadow:0 0 0 3px rgba(170,255,69,.28)}
  .intro .step-num{width:26px;height:26px;border-radius:50%;background:var(--off);color:var(--muted);display:grid;place-items:center;font-size:12px;font-weight:800;transition:all .2s}
  .intro .step.active .step-num{background:var(--lime);color:var(--black)}
  .intro .step.done .step-num{background:var(--lime-soft);color:var(--lime-dark)}
  .intro .step-t{font-size:14.5px;font-weight:700;letter-spacing:-.01em;color:var(--black)}
  .intro .step-time{font-size:12px;font-weight:600;color:var(--muted);font-variant-numeric:tabular-nums}

  .intro .panel{background:var(--white);border:1px solid var(--border);border-radius:18px;padding:40px 40px 34px;min-height:420px;position:relative}
  .intro .panel-eyebrow{display:flex;align-items:center;gap:12px;margin-bottom:18px}
  .intro .panel-circle{width:34px;height:34px;border-radius:50%;background:var(--lime);color:var(--black);display:grid;place-items:center;font-size:14px;font-weight:800}
  .intro .panel-chip{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--lime-dark);background:var(--lime-soft);border:1px solid rgba(170,255,69,.5);padding:5px 11px;border-radius:100px}
  .intro .panel h3{font-size:clamp(24px,2.6vw,32px);font-weight:800;letter-spacing:-.025em;color:var(--black);margin-bottom:16px;line-height:1.1}
  .intro .panel p{font-size:16.5px;line-height:1.62;color:var(--text2);max-width:600px}
  .intro .panel-link{display:inline-flex;align-items:center;gap:8px;margin-top:24px;font-size:13px;font-weight:700;color:var(--black);background:var(--off);border:1px solid var(--border);padding:11px 16px;border-radius:9px;transition:all .18s}
  .intro .panel-link:hover{background:var(--lime);border-color:var(--lime)}
  .intro .panel-nav{display:flex;justify-content:space-between;gap:12px;margin-top:30px;padding-top:24px;border-top:1px solid var(--border)}

  .intro .mock{margin-top:24px;border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 16px 40px -18px rgba(0,0,0,.2)}
  .intro .mock-chrome{background:#f5f4f0;padding:10px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border)}
  .intro .mock-dots{display:flex;gap:6px}
  .intro .mock-dots i{width:10px;height:10px;border-radius:50%;display:block}
  .intro .mock-url{flex:1;text-align:center;font-size:11px;color:#999;background:var(--white);padding:4px 12px;border-radius:6px;max-width:260px;margin:0 auto;border:1px solid var(--border)}
  .intro .mock-head,.intro .mock-row{display:grid;grid-template-columns:1.6fr .7fr .8fr;gap:10px;padding:10px 16px;align-items:center}
  .intro .mock-head{background:#fafaf6;font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
  .intro .mock-row{border-top:1px solid var(--border);font-size:12px}
  .intro .mock-lead{display:flex;align-items:center;gap:9px}
  .intro .mock-av{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:10px;font-weight:700;color:#fff}
  .intro .mock-name{font-size:12px;font-weight:600;color:var(--black)}
  .intro .mock-gms{font-weight:800;color:var(--black);font-variant-numeric:tabular-nums}
  .intro .mock-gms small{color:var(--muted);font-weight:500}
  .intro .tier{font-size:10px;font-weight:700;padding:3px 9px;border-radius:5px;letter-spacing:.04em;justify-self:start}
  .intro .tier.hot{background:rgba(217,79,58,.12);color:var(--hot)}
  .intro .tier.warm{background:rgba(192,125,16,.12);color:var(--warm)}
  .intro .tier.cold{background:rgba(74,127,193,.12);color:var(--cold)}

  .intro .plans{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:24px}
  .intro .plan{border:1px solid var(--border);border-radius:12px;padding:16px}
  .intro .plan:first-child{border-color:var(--lime2);box-shadow:0 0 0 3px rgba(170,255,69,.18)}
  .intro .plan .pn{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--text2)}
  .intro .plan .pa{font-size:22px;font-weight:800;letter-spacing:-.02em;margin-top:6px}
  .intro .plan .pa span{font-size:12px;font-weight:600;color:var(--muted);letter-spacing:0}
  .intro .plan .pd{font-size:12px;line-height:1.45;color:var(--text2);margin-top:6px}

  .intro footer{padding:48px 0;background:var(--white);border-top:1px solid var(--border)}
  .intro .foot-inner{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
  .intro .foot-logo{font-size:14px;font-weight:800;display:flex;align-items:center;gap:9px}
  .intro .foot-note{font-size:12.5px;color:var(--muted);margin-top:8px}
  .intro .foot-links{display:flex;gap:22px}
  .intro .foot-links a{font-size:12.5px;color:var(--text2)}
  .intro .foot-links a:hover{color:var(--black)}

  @media(max-width:880px){
    .intro .walk{grid-template-columns:1fr;gap:18px}
    .intro .steps{flex-direction:row;overflow-x:auto;padding-bottom:4px}
    .intro .step{min-width:210px;grid-template-columns:auto 1fr;flex:0 0 auto}
    .intro .step-time{grid-column:1/-1;margin-top:2px}
    .intro .panel{padding:28px 22px}
    .intro .plans{grid-template-columns:1fr}
    .intro .hero{padding:120px 0 64px}
  }
  @media(prefers-reduced-motion:reduce){.intro *{animation:none!important;transition:none!important}}
`;

function Mock() {
	return (
		<div className='mock'>
			<div className='mock-chrome'>
				<div className='mock-dots'>
					<i style={{ background: '#FF5F57' }} />
					<i style={{ background: '#FEBC2E' }} />
					<i style={{ background: '#28C840' }} />
				</div>
				<div className='mock-url'>app.fbsintelligence.com/leads</div>
			</div>
			<div className='mock-head'>
				<span>Prospect</span>
				<span>GMS</span>
				<span>Tier</span>
			</div>
			<div className='mock-row'>
				<div className='mock-lead'>
					<div
						className='mock-av'
						style={{ background: 'linear-gradient(135deg,#D94F3A,#C07D10)' }}
					>
						AK
					</div>
					<span className='mock-name'>A. Karim · Portugal GV</span>
				</div>
				<div className='mock-gms'>
					86<small>/100</small>
				</div>
				<span className='tier hot'>Hot</span>
			</div>
			<div className='mock-row'>
				<div className='mock-lead'>
					<div
						className='mock-av'
						style={{ background: 'linear-gradient(135deg,#C07D10,#8EE032)' }}
					>
						MR
					</div>
					<span className='mock-name'>M. Reyes · Malta MEIN</span>
				</div>
				<div className='mock-gms'>
					61<small>/100</small>
				</div>
				<span className='tier warm'>Warm</span>
			</div>
			<div className='mock-row'>
				<div className='mock-lead'>
					<div
						className='mock-av'
						style={{ background: 'linear-gradient(135deg,#4A7FC1,#7C5BA8)' }}
					>
						JT
					</div>
					<span className='mock-name'>J. Tan · Greece GV</span>
				</div>
				<div className='mock-gms'>
					34<small>/100</small>
				</div>
				<span className='tier cold'>Cold</span>
			</div>
		</div>
	);
}

function Plans() {
	return (
		<div className='plans'>
			<div className='plan'>
				<div className='pn'>Dedicated funnel</div>
				<div className='pa'>
					$5,000 <span>build</span>
				</div>
				<div className='pd'>
					Then $499/mo. 3-month minimum. You hold your own media budget.
				</div>
			</div>
			<div className='plan'>
				<div className='pn'>Shared pool</div>
				<div className='pa'>
					from $499 <span>/mo</span>
				</div>
				<div className='pd'>
					Subscription access to the shared lead pool across jurisdictions.
				</div>
			</div>
			<div className='plan'>
				<div className='pn'>Summit</div>
				<div className='pa'>
					from $1,950 <span>/pkg</span>
				</div>
				<div className='pd'>Participation in the live and virtual summits.</div>
			</div>
		</div>
	);
}

export default function Intro() {
	const [active, setActive] = useState(0);
	const p = PARTS[active];
	const last = PARTS.length - 1;

	const go = (i: number) => {
		if (active === last && i > last) return setActive(0);
		setActive(Math.max(0, Math.min(last, i)));
	};

	return (
		<div className='intro'>
			<style>{css}</style>

			<nav>
				<div className='intro-wrap nav-inner'>
					<Link className='nav-logo' href='/'>
						<span className='nav-logo-dot' />
						FBS Intelligence <em>/ Your session</em>
					</Link>
					<div className='nav-right'>
						<Link className='nav-link' href='/overview'>
							Overview
						</Link>
						<Link className='nav-link' href='/pricing'>
							Pricing
						</Link>
						<Link className='nav-btn' href='/'>
							fbsintelligence.com ↗
						</Link>
					</div>
				</div>
			</nav>

			<header className='hero'>
				<div className='hero-grid-bg' />
				<div className='intro-wrap'>
					<div className='eyebrow fade-up'>
						<span className='eyebrow-line' />
						Your session · FBS Intelligence
					</div>
					<h1 className='fade-up fu2'>
						Here is how our <span className='accent'>conversation</span> will go.
					</h1>
					<div className='hero-sub fade-up fu2'>
						About 30 minutes, five simple parts.
					</div>
					<p className='hero-desc fade-up fu3'>
						This page is your map for our call. You will always know what we are
						covering, what comes next, and how long we will need - so you can
						relax and focus on what matters to your firm.
					</p>
					<div className='hero-pill fade-up fu3'>
						<b>~30 min</b>
						<span>5 parts · live demo included</span>
					</div>
					<div className='hero-actions fade-up fu4'>
						<button
							className='btn primary'
							onClick={() =>
								document
									.getElementById('walk')
									?.scrollIntoView({ behavior: 'smooth' })
							}
						>
							See the walkthrough
						</button>
						<Link className='btn' href='/'>
							Explore the platform
						</Link>
					</div>
				</div>
			</header>

			<section className='section section-off' id='walk'>
				<div className='intro-wrap'>
					<div className='eyebrow'>
						<span className='eyebrow-line' />
						The agenda
					</div>
					<h2>
						What we will cover <span className='hl-sm'>together</span>
					</h2>
					<p className='section-body'>
						Tap any part to see what happens in it. Nothing here is a surprise -
						this is exactly how we will spend our time.
					</p>

					<div className='meter'>
						<span className='meter-label'>Progress</span>
						<div className='meter-bar'>
							<div
								className='meter-fill'
								style={{ width: `${((active + 1) / PARTS.length) * 100}%` }}
							/>
						</div>
						<span className='meter-total'>
							Part {active + 1} of {PARTS.length}
						</span>
					</div>

					<div className='walk'>
						<div className='steps'>
							{PARTS.map((s, i) => (
								<button
									key={s.n}
									className={`step ${i === active ? 'active' : ''} ${
										i < active ? 'done' : ''
									}`}
									onClick={() => go(i)}
								>
									<span className='step-num'>{s.n}</span>
									<span className='step-t'>{s.title}</span>
									<span className='step-time'>{s.time}</span>
								</button>
							))}
						</div>

						<div className='panel'>
							<div className='panel-eyebrow'>
								<span className='panel-circle'>{p.n}</span>
								<span className='panel-chip'>{p.time}</span>
							</div>
							<h3>{p.title}</h3>
							<p>{p.body}</p>
							{p.mock && <Mock />}
							{p.plans && <Plans />}
							{p.link && (
								<Link className='panel-link' href={p.link.href}>
									{p.link.label} ↗
								</Link>
							)}
							<div className='panel-nav'>
								<button
									className='btn'
									disabled={active === 0}
									onClick={() => go(active - 1)}
								>
									← Previous
								</button>
								<button className='btn primary' onClick={() => go(active + 1)}>
									{active === last ? 'Start again' : 'Next part →'}
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>

			<footer>
				<div className='intro-wrap foot-inner'>
					<div>
						<div className='foot-logo'>
							<span className='nav-logo-dot' />
							FBS Intelligence
						</div>
						<div className='foot-note'>
							Part of Freedom Business Summit · Lead intelligence for global
							mobility firms
						</div>
					</div>
					<div className='foot-links'>
						<Link href='/overview'>Overview</Link>
						<Link href='/pricing'>Pricing</Link>
						<Link href='/'>fbsintelligence.com</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
