import { cn } from '@/lib/utils';

// Building blocks for app pages in the adapted Ledger style (DESIGN.md):
// mono kickers, display-serif headings with one gradient word, hairline rules.

export function PageShell({ className, children }: { className?: string; children: React.ReactNode }) {
    return <main className={cn('mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-10 pb-16', className)}>{children}</main>;
}

// `title` may contain one <em> word; it gets the brand gradient.
export function PageHeader({
    kicker,
    title,
    lede,
    action,
}: {
    kicker: string;
    title: React.ReactNode;
    lede?: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-8 pb-7 sm:pt-12 sm:pb-9">
            <div className="min-w-0">
                <p className="kicker">{kicker}</p>
                <h1 className="display mt-3 text-[clamp(40px,6vw,64px)]">{title}</h1>
                {lede && <p className="mt-3 max-w-lede text-[17px] text-muted-foreground">{lede}</p>}
            </div>
            {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
    );
}

// Opens a section: 1px rule, mono kicker, optional serif heading and aside.
export function Section({
    kicker,
    title,
    aside,
    className,
    children,
}: {
    kicker: string;
    title?: React.ReactNode;
    aside?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <section className={cn('mt-12 first:mt-0', className)}>
            <div className="section-rule flex items-baseline justify-between gap-4">
                <p className="eyebrow">{kicker}</p>
                {aside}
            </div>
            {title && <h2 className="display mt-4 text-[clamp(30px,3.6vw,42px)]">{title}</h2>}
            <div className="mt-6">{children}</div>
        </section>
    );
}

// Big display numeral with its mono label underneath.
export function Stat({
    label,
    value,
    unit,
    className,
}: {
    label: string;
    value: React.ReactNode;
    unit?: string;
    className?: string;
}) {
    return (
        <div className={cn('flex flex-col-reverse gap-2', className)}>
            <dt className="font-mono text-xs text-muted-foreground">{label}</dt>
            <dd className="font-display text-[40px] leading-none sm:text-[56px]">
                {value}
                {unit && <span className="ml-1.5 font-mono text-sm text-muted-foreground">{unit}</span>}
            </dd>
        </div>
    );
}

// Empty list state: a muted line and an optional action.
export function EmptyState({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="rounded-card border border-dashed border-border px-6 py-12 text-center">
            <p className="text-muted-foreground">{children}</p>
            {action && <div className="mt-5 flex justify-center">{action}</div>}
        </div>
    );
}
