'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Sparkles,
    IndianRupee,
    GraduationCap,
    Coffee
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Habits', href: '/habits', icon: Sparkles },
    { name: 'Expenses', href: '/expenses', icon: IndianRupee },
    { name: 'Study', href: '/study', icon: GraduationCap },
    { name: 'Food', href: '/food', icon: Coffee },
];

export function NavBar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto w-full px-4">
                <div className="flex items-center justify-around py-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard'));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-[60px]',
                                    isActive
                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                )}
                            >
                                <Icon className="h-5 w-5 mb-1" />
                                <span className="text-xs font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
