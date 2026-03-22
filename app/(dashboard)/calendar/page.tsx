'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Activity,
    Moon,
    UtensilsCrossed,
    BookOpen,
    DollarSign,
    FileText,
} from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { formatDate, getStartOfDay, getEndOfDay } from '@/lib/utils';
import { cn } from '@/lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const CATEGORY_CONFIG = [
    {
        key: 'habits',
        label: 'Habits',
        icon: Activity,
        dotColor: 'bg-indigo-500',
        borderColor: 'border-l-indigo-500',
        badgeColor: 'bg-indigo-500/10 text-indigo-600',
    },
    {
        key: 'sleep',
        label: 'Sleep',
        icon: Moon,
        dotColor: 'bg-violet-500',
        borderColor: 'border-l-violet-500',
        badgeColor: 'bg-violet-500/10 text-violet-600',
    },
    {
        key: 'food',
        label: 'Meals',
        icon: UtensilsCrossed,
        dotColor: 'bg-green-500',
        borderColor: 'border-l-green-500',
        badgeColor: 'bg-green-500/10 text-green-600',
    },
    {
        key: 'study',
        label: 'Study',
        icon: BookOpen,
        dotColor: 'bg-blue-500',
        borderColor: 'border-l-blue-500',
        badgeColor: 'bg-blue-500/10 text-blue-600',
    },
    {
        key: 'expenses',
        label: 'Expenses',
        icon: DollarSign,
        dotColor: 'bg-amber-500',
        borderColor: 'border-l-amber-500',
        badgeColor: 'bg-amber-500/10 text-amber-600',
    },
    {
        key: 'journal',
        label: 'Journal',
        icon: FileText,
        dotColor: 'bg-pink-500',
        borderColor: 'border-l-pink-500',
        badgeColor: 'bg-pink-500/10 text-pink-600',
    },
] as const;

type CategoryKey = (typeof CATEGORY_CONFIG)[number]['key'];

interface DayActivities {
    habits: any[];
    sleep: any[];
    food: any[];
    study: any[];
    expenses: any[];
    journal: any[];
}

export default function CalendarPage() {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const isToday = (day: number) => {
        const d = new Date(year, month, day);
        return d.toDateString() === today.toDateString();
    };

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return new Date(year, month, day).toDateString() === selectedDate.toDateString();
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setSelectedDate(today);
    };

    const { data: dayData, isLoading } = useQuery<DayActivities | null>({
        queryKey: ['calendar-day', selectedDate?.toISOString()],
        queryFn: async () => {
            if (!selectedDate) return null;
            const start = getStartOfDay(selectedDate);
            const end = getEndOfDay(selectedDate);

            const [habits, sleep, food, study, expenses, journal] = await Promise.all([
                fetch('/api/habits').then(r => r.json()),
                fetch(`/api/sleep?startDate=${start.toISOString()}&endDate=${end.toISOString()}`).then(r => r.json()),
                fetch(`/api/food?startDate=${start.toISOString()}&endDate=${end.toISOString()}`).then(r => r.json()),
                fetch(`/api/study?startDate=${start.toISOString()}&endDate=${end.toISOString()}`).then(r => r.json()),
                fetch(`/api/expenses?startDate=${start.toISOString()}&endDate=${end.toISOString()}`).then(r => r.json()),
                fetch(`/api/journal?startDate=${start.toISOString()}&endDate=${end.toISOString()}`).then(r => r.json()),
            ]);

            return {
                habits: habits.success ? habits.data : [],
                sleep: sleep.success ? sleep.data : [],
                food: food.success ? food.data : [],
                study: study.success ? study.data : [],
                expenses: expenses.success ? expenses.data : [],
                journal: journal.success ? journal.data : [],
            };
        },
        enabled: !!selectedDate,
    });

    const activities: DayActivities = dayData ?? {
        habits: [], sleep: [], food: [], study: [], expenses: [], journal: [],
    };

    const hasActivities = CATEGORY_CONFIG.some(c => activities[c.key as CategoryKey].length > 0);

    // Build calendar grid cells
    const calendarCells: Array<{ day: number } | null> = [];
    for (let i = 0; i < firstDay; i++) calendarCells.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarCells.push({ day: d });

    const isCurrentMonth =
        year === today.getFullYear() && month === today.getMonth();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-foreground">Calendar</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-6">

                {/* Calendar Card */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">

                    {/* Month navigation */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">
                                {MONTHS[month]}
                            </h2>
                            <p className="text-sm text-muted-foreground">{year}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            {!isCurrentMonth && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToToday}
                                    className="mr-1 h-8 text-xs px-3"
                                >
                                    Today
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigateMonth('prev')}
                                className="h-9 w-9"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigateMonth('next')}
                                className="h-9 w-9"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Day-of-week headers */}
                    <div className="grid grid-cols-7 px-3 pb-1">
                        {DAYS.map(d => (
                            <div
                                key={d}
                                className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground py-1"
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
                        {calendarCells.map((cell, idx) => {
                            if (!cell) {
                                return <div key={`empty-${idx}`} />;
                            }
                            const { day } = cell;
                            const todayDay = isToday(day);
                            const selectedDay = isSelected(day);
                            const pastDay = new Date(year, month, day) < today && !todayDay;

                            return (
                                <div key={day} className="flex flex-col items-center py-0.5">
                                    <button
                                        onClick={() => setSelectedDate(new Date(year, month, day))}
                                        className={cn(
                                            'relative flex items-center justify-center w-full h-12 rounded-xl text-sm font-medium transition-all select-none',
                                            todayDay && !selectedDay && 'bg-indigo-600 text-white shadow-md',
                                            selectedDay && !todayDay && 'ring-2 ring-foreground ring-offset-2 ring-offset-card text-foreground',
                                            selectedDay && todayDay && 'bg-indigo-600 text-white ring-2 ring-white ring-offset-2 ring-offset-indigo-600 shadow-md',
                                            !todayDay && !selectedDay && pastDay && 'text-muted-foreground hover:bg-muted',
                                            !todayDay && !selectedDay && !pastDay && 'text-foreground hover:bg-muted',
                                        )}
                                    >
                                        {day}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 pb-4">
                        {CATEGORY_CONFIG.map(c => (
                            <span key={c.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <span className={cn('inline-block w-1.5 h-1.5 rounded-full', c.dotColor)} />
                                {c.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Detail Panel */}
                {!selectedDate ? (
                    <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                        <span className="text-5xl mb-4 select-none" aria-hidden>📅</span>
                        <p className="text-base font-semibold text-foreground mb-1">Pick a day</p>
                        <p className="text-sm text-muted-foreground">Tap any date above to see your tracked activities.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-baseline justify-between px-1">
                            <h2 className="text-base font-semibold text-foreground">
                                {formatDate(selectedDate)}
                            </h2>
                            {isLoading && (
                                <span className="text-xs text-muted-foreground animate-pulse">Loading…</span>
                            )}
                        </div>

                        {!isLoading && !hasActivities && (
                            <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                                <span className="text-5xl mb-4 select-none" aria-hidden>🌿</span>
                                <p className="text-base font-semibold text-foreground mb-1">Nothing recorded</p>
                                <p className="text-sm text-muted-foreground">No activities were logged for this day.</p>
                            </div>
                        )}

                        {!isLoading && hasActivities && CATEGORY_CONFIG.map(cat => {
                            const items = activities[cat.key as CategoryKey];
                            if (items.length === 0) return null;
                            const Icon = cat.icon;

                            return (
                                <div
                                    key={cat.key}
                                    className={cn(
                                        'bg-card border border-border rounded-2xl overflow-hidden border-l-4',
                                        cat.borderColor,
                                    )}
                                >
                                    <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                                        <span className={cn('flex items-center justify-center w-8 h-8 rounded-lg shrink-0', cat.badgeColor)}>
                                            <Icon className="w-4 h-4" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {items.length} {items.length === 1 ? 'entry' : 'entries'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-4 pb-4 space-y-2">
                                        {cat.key === 'habits' && items.map((h: any) => (
                                            <div key={h._id} className="flex items-center gap-2 py-1.5 border-t border-border">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                                <span className="text-sm text-foreground">{h.title}</span>
                                            </div>
                                        ))}

                                        {cat.key === 'sleep' && items.map((s: any) => (
                                            <div key={s._id} className="flex items-center justify-between py-1.5 border-t border-border">
                                                <span className="text-sm text-foreground">Duration</span>
                                                <span className="text-sm font-medium text-foreground tabular-nums">
                                                    {Math.floor(s.duration / 60)}h {s.duration % 60}m
                                                </span>
                                            </div>
                                        ))}

                                        {cat.key === 'food' && items.map((f: any) => (
                                            <div key={f._id} className="flex items-center justify-between py-1.5 border-t border-border">
                                                <span className="text-sm text-foreground capitalize">{f.mealType}</span>
                                                {f.calories > 0 && (
                                                    <span className="text-xs text-muted-foreground">{f.calories} kcal</span>
                                                )}
                                            </div>
                                        ))}

                                        {cat.key === 'study' && items.map((s: any) => (
                                            <div key={s._id} className="flex items-center justify-between py-1.5 border-t border-border">
                                                <span className="text-sm text-foreground">{s.topic}</span>
                                                <span className="text-xs text-muted-foreground tabular-nums">
                                                    {Math.floor(s.timeSpent / 60)}h {s.timeSpent % 60}m
                                                </span>
                                            </div>
                                        ))}

                                        {cat.key === 'expenses' && items.map((e: any) => (
                                            <div key={e._id} className="flex items-center justify-between py-1.5 border-t border-border">
                                                <span className="text-sm text-foreground capitalize">{e.category}</span>
                                                <span className="text-sm font-medium text-foreground tabular-nums">
                                                    ₹{e.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}

                                        {cat.key === 'journal' && items.map((j: any) => (
                                            <div key={j._id} className="pt-2 border-t border-border">
                                                <p className="text-sm text-foreground leading-relaxed">{j.summary}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <NavBar />
        </div>
    );
}
