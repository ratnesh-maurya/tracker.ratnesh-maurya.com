import Link from 'next/link';

const features = [
    'habits with streaks, built or quit',
    'sleep, from bedtime to wake-up',
    'food, with Indian meals built in',
    'study sessions by topic',
    'expenses in rupees, by category',
    'a journal, one entry a day',
];

// Shared frame for sign-in and sign-up: the pitch on the left (desktop), the
// form card on the right. On phones the pitch shrinks to the wordmark.
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="mx-auto grid min-h-screen w-[min(1200px,100%-2*clamp(16px,4vw,48px))] grid-cols-1 lg:grid-cols-[1fr_440px] lg:gap-16">
            <div className="flex flex-col pt-8 lg:justify-between lg:py-12">
                <Link href="/" className="flex w-fit items-center gap-2.5">
                    <span className="saffron-dot" aria-hidden />
                    <span className="font-display text-[26px] leading-none tracking-[-0.01em]">tracker</span>
                </Link>

                <div className="hidden lg:block">
                    <p className="eyebrow">Personal tracker</p>
                    <h2 className="display mt-4 text-[clamp(46px,5.6vw,80px)]">
                        Six trackers, one <em>habit</em>
                    </h2>
                    <ul className="mt-8 flex flex-col gap-2 text-[17px] text-body">
                        {features.map((f) => (
                            <li key={f}>— {f}</li>
                        ))}
                    </ul>
                </div>

                <p className="hidden font-mono text-xs text-muted-foreground lg:block">
                    built by{' '}
                    <a href="https://ratnesh-maurya.com" target="_blank" rel="noopener noreferrer" className="text-coral hover:text-muted-foreground">
                        ratnesh maurya ↗
                    </a>
                </p>
            </div>

            <main className="flex items-start justify-center py-8 lg:items-center lg:py-12">{children}</main>
        </div>
    );
}
