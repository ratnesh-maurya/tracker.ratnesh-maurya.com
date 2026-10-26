'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    Home,
    Sparkles,
    IndianRupee,
    GraduationCap,
    Coffee,
    Bed,
    BookOpen,
    BarChart3,
    User,
    Settings,
    Calendar,
    LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Habits', href: '/habits', icon: Sparkles },
    { name: 'Food', href: '/food', icon: Coffee },
    { name: 'Sleep', href: '/sleep', icon: Bed },
    { name: 'Study', href: '/study', icon: GraduationCap },
    { name: 'Expenses', href: '/expenses', icon: IndianRupee },
    { name: 'Journal', href: '/journal', icon: BookOpen },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
];

// Bottom nav: 4 most-used on mobile, everything else behind "More"
const mobileItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Habits', href: '/habits', icon: Sparkles },
    { name: 'Food', href: '/food', icon: Coffee },
    { name: 'Expenses', href: '/expenses', icon: IndianRupee },
];
const mobileHrefs = new Set(mobileItems.map((item) => item.href));
const moreItems = navItems.filter((item) => !mobileHrefs.has(item.href));

export function NavBar() {
    const pathname = usePathname();

    const [moreOpen, setMoreOpen] = useState(false);
    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
    const moreActive = moreItems.some((item) => isActive(item.href));

    useEffect(() => {
        if (!moreOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMoreOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [moreOpen]);

    return (
        <>
            {/* ── Desktop sidebar ── */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-full w-56 xl:w-60 flex-col bg-background/90 backdrop-blur-md border-r border-border z-40">
                {/* Wordmark: lowercase display serif after a gradient dot */}
                <Link href="/dashboard" className="flex items-center gap-2.5 px-6 pt-7 pb-6">
                    <span className="saffron-dot" aria-hidden />
                    <span className="font-display text-[26px] leading-none tracking-[-0.01em]">tracker</span>
                </Link>

                <nav className="flex-1 px-3 overflow-y-auto" aria-label="Main">
                    <ul className="flex flex-col gap-0.5">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        aria-current={active ? 'page' : undefined}
                                        className={cn(
                                            'flex min-h-[44px] items-center gap-3 rounded-full px-4 text-sm transition-colors duration-150',
                                            active
                                                ? 'bg-muted text-foreground font-medium'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} aria-hidden />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <p className="px-6 py-5 border-t border-border font-mono text-[11px] text-muted-foreground">
                    built by{' '}
                    <a href="https://ratnesh-maurya.com" target="_blank" rel="noopener noreferrer" className="text-coral hover:text-muted-foreground transition-colors">
                        ratnesh maurya ↗
                    </a>
                </p>
            </aside>

            {/* ── Mobile "More" sheet: every page not in the bottom bar ── */}
            {moreOpen && (
                <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="All pages">
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="absolute inset-0 bg-[rgba(10,10,16,.6)]"
                        onClick={() => setMoreOpen(false)}
                    />
                    <div className="saffron-hairline absolute bottom-0 left-0 right-0 bg-popover border-t border-border rounded-t-card px-4 pt-5 pb-24 safe-bottom">
                        <p className="eyebrow px-2 pb-3">All pages</p>
                        <div className="grid grid-cols-3 gap-2">
                            {moreItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMoreOpen(false)}
                                        aria-current={active ? 'page' : undefined}
                                        className={cn(
                                            'flex flex-col items-center justify-center gap-2 min-h-[76px] rounded-inner border text-[13px] transition-colors duration-150',
                                            active
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-rule'
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Mobile bottom nav ── */}
            <nav
                aria-label="Main"
                className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border backdrop-blur-md safe-bottom [background:color-mix(in_srgb,hsl(var(--background))_88%,transparent)]"
            >
                <div className="flex items-stretch">
                    {mobileItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'relative flex-1 flex flex-col items-center justify-center gap-1 min-h-[58px] transition-colors duration-150',
                                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {active && <span className="saffron-dot absolute top-1.5 h-[5px] w-[5px]" aria-hidden />}
                                <item.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                                <span className="text-[11px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => setMoreOpen((open) => !open)}
                        aria-expanded={moreOpen}
                        aria-haspopup="dialog"
                        className={cn(
                            'relative flex-1 flex flex-col items-center justify-center gap-1 min-h-[58px] transition-colors duration-150',
                            moreOpen || moreActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {moreActive && !moreOpen && <span className="saffron-dot absolute top-1.5 h-[5px] w-[5px]" aria-hidden />}
                        <LayoutGrid className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                        <span className="text-[11px] font-medium">More</span>
                    </button>
                </div>
            </nav>
        </>
    );
}
