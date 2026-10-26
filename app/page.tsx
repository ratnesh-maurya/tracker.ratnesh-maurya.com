'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const modules = [
    { kind: 'habits', title: 'Habits', desc: 'Build streaks or quit something. Yes/no or counted, with reminders.' },
    { kind: 'sleep', title: 'Sleep', desc: 'Bedtime and wake-up; it works out the hours and the weekly average.' },
    { kind: 'food', title: 'Food', desc: 'Meals by type, with Indian dishes built in. Poha, dal, rajma chawal.' },
    { kind: 'study', title: 'Study', desc: 'Sessions by topic and tag, so you can see where the hours went.' },
    { kind: 'expenses', title: 'Expenses', desc: 'Amounts in rupees by category, totals by week, month and year.' },
    { kind: 'journal', title: 'Journal', desc: 'One entry a day, with a few highlights. Nothing more.' },
];

const extras = [
    { title: 'Analytics', desc: 'Charts for the week, the month and the year, across every tracker.' },
    { title: 'Activity calendar', desc: 'A year-long heatmap of check-ins, sleep and study, with your streak marked.' },
    { title: 'Public profile', desc: 'Optional. Share your streaks at /u/your-name without sharing the details.' },
    { title: 'Private by default', desc: 'JWT in httpOnly cookies. Your entries are yours; the profile is off until you turn it on.' },
];

const offline = [
    { k: 'install', v: 'Add it to the home screen; it opens like an app, with shortcuts for habits, expenses, meals and the journal.' },
    { k: 'offline', v: 'Last-seen data opens with no connection. Saves made offline wait on the device and sync when you are back.' },
    { k: 'fast', v: 'Data is kept on the device between launches, so pages show at once and refresh in the background.' },
];

const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Personal Tracker',
    description: 'Track your habits, sleep, food, study, expenses, and journal entries.',
    url: 'https://tracker.ratnesh-maurya.com',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Person', name: 'Ratnesh Maurya', url: 'https://ratnesh-maurya.com' },
};

const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'What is Personal Tracker?', acceptedAnswer: { '@type': 'Answer', text: 'A comprehensive web app to track habits, sleep, food, study, expenses, and journal entries.' } },
        { '@type': 'Question', name: 'Is it free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free.' } },
        { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: "Yes, it's a PWA that can be installed on your phone." } },
    ],
};

const linkClass = 'text-[14px] text-secondary-foreground transition-colors duration-150 hover:text-muted-foreground';

export default function LandingPage() {
    const [demoLoading, setDemoLoading] = useState(false);
    const router = useRouter();

    const handleTryDemo = async () => {
        setDemoLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@example.com', password: 'password123', rememberMe: true }),
            });
            const data = await res.json();
            if (data.success) {
                router.push('/dashboard');
                router.refresh();
            } else {
                // Fallback: redirect to login with demo param pre-filled
                router.push('/login?demo=1');
            }
        } catch {
            router.push('/login?demo=1');
        } finally {
            setDemoLoading(false);
        }
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />

            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
                Skip to content
            </a>

            {/* ── Header ── */}
            <header className="sticky top-0 z-50 border-b border-border backdrop-blur-md [background:color-mix(in_srgb,hsl(var(--background))_88%,transparent)]">
                <div className="mx-auto flex min-h-[64px] w-[min(1200px,100%-2*clamp(16px,4vw,48px))] items-center gap-6">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="saffron-dot" aria-hidden />
                        <span className="font-display text-[26px] leading-none tracking-[-0.01em]">tracker</span>
                    </Link>
                    <nav className="ml-auto hidden items-center gap-[26px] sm:flex" aria-label="Main">
                        <a href="#trackers" className={linkClass}>Trackers</a>
                        <a href="#offline" className={linkClass}>Offline</a>
                        <Link href="/login" className={linkClass}>Sign in</Link>
                    </nav>
                    <Link href="/register" className="ml-auto sm:ml-0">
                        <Button size="sm" tabIndex={-1}>Open the app →</Button>
                    </Link>
                </div>
            </header>

            <main id="main" className="mx-auto w-[min(1200px,100%-2*clamp(16px,4vw,48px))]">
                {/* ── Hero ── */}
                <section className="pb-10 pt-[clamp(48px,8vw,96px)]">
                    <p className="eyebrow">Personal tracker · free · installable</p>
                    <h1 className="display mt-5 text-[clamp(56px,11vw,160px)] leading-[0.9] tracking-[-0.04em]">
                        Track your life, keep the <em>streak</em>
                    </h1>
                    <p className="mt-7 max-w-lede text-[clamp(18px,1.9vw,21px)] leading-[1.6] text-muted-foreground">
                        One app for habits, sleep, food, study, expenses and a daily journal. I built it because I wanted all of
                        it in one place, on my phone, working on the metro with no signal.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/register">
                            <Button size="lg" tabIndex={-1}>Start for free →</Button>
                        </Link>
                        <Button size="lg" variant="outline" onClick={handleTryDemo} disabled={demoLoading}>
                            {demoLoading ? '…' : 'Try the demo →'}
                        </Button>
                    </div>
                    <p className="mt-5 font-mono text-xs text-muted-foreground">
                        no card, no trial — demo account: <Link href="/login?demo=1" className="text-coral hover:text-muted-foreground">sign in pre-filled →</Link>
                    </p>
                </section>

                {/* ── § 01 Trackers ── */}
                <section id="trackers" className="pt-24">
                    <div className="section-rule">
                        <p className="eyebrow">§ 01 · Trackers</p>
                        <h2 className="display mt-4 text-[clamp(40px,5.4vw,72px)]">
                            Six trackers, <em>one</em> app
                        </h2>
                    </div>
                    <ul className="mt-10 border-b border-border">
                        {modules.map((m, i) => (
                            <li key={m.kind} className="flex flex-col gap-2 border-t border-border py-6 transition-colors duration-150 hover:bg-hover sm:flex-row sm:items-baseline sm:gap-6 sm:px-2">
                                <span className="font-mono text-xs text-muted-foreground sm:basis-[180px] sm:shrink-0">
                                    {String(i + 1).padStart(2, '0')} — {m.kind}
                                </span>
                                <h3 className="font-display text-[30px] leading-[1.1] sm:basis-[220px] sm:shrink-0">{m.title}</h3>
                                <p className="text-[15px] text-muted-foreground">{m.desc}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* ── § 02 Around them ── */}
                <section className="pt-24">
                    <div className="section-rule">
                        <p className="eyebrow">§ 02 · Around them</p>
                        <h2 className="display mt-4 text-[clamp(40px,5.4vw,72px)]">
                            The parts that make it <em>stick</em>
                        </h2>
                    </div>
                    <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {extras.map((e, i) => (
                            <article key={e.title} className="flex flex-col gap-3 rounded-card bg-card p-7 shadow-card">
                                <span className="kicker">{['i', 'ii', 'iii', 'iv'][i]}</span>
                                <h3 className="font-display text-[clamp(26px,2.9vw,36px)] leading-[1.12] tracking-[-0.03em]">{e.title}</h3>
                                <p className="text-[15px] text-muted-foreground">{e.desc}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* ── § 03 Offline ── */}
                <section id="offline" className="pt-24">
                    <div className="section-rule">
                        <p className="eyebrow">§ 03 · Offline &amp; install</p>
                        <h2 className="display mt-4 text-[clamp(40px,5.4vw,72px)]">
                            Works with no <em>signal</em>
                        </h2>
                    </div>
                    <dl className="mt-10 border-b border-border">
                        {offline.map((o) => (
                            <div key={o.k} className="flex flex-col gap-2 border-t border-border py-6 sm:flex-row sm:gap-6 sm:px-2">
                                <dt className="font-mono text-xs text-kicker sm:basis-[180px] sm:shrink-0 sm:pt-1">{o.k}</dt>
                                <dd className="max-w-[60ch] text-[17px] text-body">{o.v}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {/* ── § 04 Price ── */}
                <section className="pt-24">
                    <div className="section-rule grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <p className="eyebrow">§ 04 · Price</p>
                            <h2 className="display mt-4 text-[clamp(40px,5.4vw,72px)]">
                                Free, and it <em>stays</em> that way
                            </h2>
                            <p className="mt-5 max-w-lede text-[17px] text-muted-foreground">
                                No plans, no paywalled charts. It runs on a small budget and I use it every day.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/register">
                                <Button size="lg" tabIndex={-1}>Create an account →</Button>
                            </Link>
                            <Button size="lg" variant="outline" onClick={handleTryDemo} disabled={demoLoading}>
                                {demoLoading ? '…' : 'Try the demo →'}
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="mt-[clamp(48px,8vw,96px)] border-t border-rule">
                <div className="mx-auto grid w-[min(1200px,100%-2*clamp(16px,4vw,48px))] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-8 py-12">
                    <div>
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="saffron-dot" aria-hidden />
                            <span className="font-display text-[28px] leading-none">tracker</span>
                        </Link>
                        <p className="mt-3 text-[13px] text-muted-foreground">A personal tracker that still opens on the metro.</p>
                    </div>
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">App</p>
                        <ul className="mt-3 flex flex-col gap-2">
                            <li><Link href="/register" className="text-[14px] text-foreground hover:text-muted-foreground">Create an account</Link></li>
                            <li><Link href="/login" className="text-[14px] text-foreground hover:text-muted-foreground">Sign in</Link></li>
                            <li><Link href="/login?demo=1" className="text-[14px] text-foreground hover:text-muted-foreground">Demo</Link></li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Author</p>
                        <ul className="mt-3 flex flex-col gap-2">
                            <li>
                                <a href="https://ratnesh-maurya.com" target="_blank" rel="noopener noreferrer" className="text-[14px] text-foreground hover:text-muted-foreground">
                                    Ratnesh Maurya ↗
                                </a>
                            </li>
                            <li>
                                <a href="https://blog.ratnesh-maurya.com" target="_blank" rel="noopener noreferrer" className="text-[14px] text-foreground hover:text-muted-foreground">
                                    Blog ↗
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mx-auto flex w-[min(1200px,100%-2*clamp(16px,4vw,48px))] flex-wrap items-end justify-between gap-4 border-t border-border py-6">
                    <p className="font-mono text-xs text-muted-foreground">
                        built by{' '}
                        <a href="https://ratnesh-maurya.com" target="_blank" rel="noopener noreferrer" className="text-coral hover:text-muted-foreground">
                            ratnesh maurya ↗
                        </a>
                    </p>
                    <Link href="/register">
                        <Button size="sm" variant="outline" tabIndex={-1}>Open the app →</Button>
                    </Link>
                </div>
            </footer>
        </>
    );
}
