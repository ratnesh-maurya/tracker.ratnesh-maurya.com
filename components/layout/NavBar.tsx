'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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

// Bottom nav: only 5 most-used on mobile
const mobileItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Habits', href: '/habits', icon: Sparkles },
    { name: 'Food', href: '/food', icon: Coffee },
    { name: 'Study', href: '/study', icon: GraduationCap },
    { name: 'Expenses', href: '/expenses', icon: IndianRupee },
];

export function NavBar() {
    const pathname = usePathname();

    const isActive = (href: string) =>
        pathname === href ||
        (href === '/dashboard' && pathname === '/dashboard');

    return (
        <>
            {/* ── Desktop sidebar ── */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-full w-56 xl:w-60 flex-col bg-[#0d0d14] border-r border-white/6 z-40">
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/6">
                    <Image src="/web-app-manifest-192x192.png" alt="Logo" width={28} height={28} className="rounded-lg" />
                    <span className="text-sm font-semibold text-white">Personal Tracker</span>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                                    active
                                        ? 'bg-indigo-600/18 text-indigo-300 border border-indigo-500/20'
                                        : 'text-gray-500 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                                )}
                            >
                                <item.icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-indigo-400' : 'text-gray-500')} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom branding */}
                <div className="px-5 py-4 border-t border-white/6">
                    <p className="text-xs text-gray-700">
                        Built by{' '}
                        <a href="https://ratnesh-maurya.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-400 transition-colors">
                            Ratnesh Maurya
                        </a>
                    </p>
                </div>
            </aside>

            {/* ── Mobile bottom nav ── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d14]/90 backdrop-blur-xl border-t border-white/8 z-50 safe-bottom">
                <div className="flex items-stretch">
                    {mobileItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all duration-150',
                                    active
                                        ? 'text-indigo-400'
                                        : 'text-gray-600 hover:text-gray-300'
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
