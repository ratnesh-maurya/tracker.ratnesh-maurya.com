'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState, PageHeader, PageShell, Section } from '@/components/layout/page';
import { formatDate, getStartOfDay, getEndOfDay } from '@/lib/utils';
import { cn } from '@/lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

// Each category is marked by a small dot only (Ledger: brand colour never fills an area).
const CATEGORY_CONFIG = [
    { key: 'habits', label: 'Habits', dotColor: 'bg-marigold' },
    { key: 'sleep', label: 'Sleep', dotColor: 'bg-kumkum' },
    { key: 'food', label: 'Meals', dotColor: 'bg-ok' },
    { key: 'study', label: 'Study', dotColor: 'bg-peacock' },
    { key: 'expenses', label: 'Expenses', dotColor: 'bg-coral' },
    { key: 'journal', label: 'Journal', dotColor: 'bg-muted-foreground' },
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

            // List endpoints answer { entries, pagination }; /api/habits answers an array.
            const list = (r: any): any[] => (r.success ? (Array.isArray(r.data) ? r.data : r.data?.entries ?? []) : []);
            return {
                habits: list(habits),
                sleep: list(sleep),
                food: list(food),
                study: list(study),
                expenses: list(expenses),
                journal: list(journal),
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
        <PageShell className="max-w-3xl">
            <PageHeader
                kicker="§ 09 · Calendar"
                title={<>Any day, <em>recalled</em></>}
                action={
                    !isCurrentMonth && (
                        <Button variant="outline" onClick={goToToday}>
                            Today
                        </Button>
                    )
                }
            />

            <div className="rounded-card bg-card p-4 shadow-card sm:p-6">
                {/* Month navigation */}
                <div className="flex items-center justify-between gap-4 px-1 pb-5">
                    <h2 className="font-display text-[32px] leading-none sm:text-[40px]">
                        {MONTHS[month]} <span className="font-mono text-sm text-muted-foreground">{year}</span>
                    </h2>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')} aria-label="Previous month">
                            <ChevronLeft className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => navigateMonth('next')} aria-label="Next month">
                            <ChevronRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                        </Button>
                    </div>
                </div>

                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 border-t border-border pt-3 pb-1">
                    {DAYS.map(d => (
                        <div key={d} className="py-1 text-center font-mono text-[11px] lowercase tracking-[0.08em] text-muted-foreground">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarCells.map((cell, idx) => {
                        if (!cell) {
                            return <div key={`empty-${idx}`} />;
                        }
                        const { day } = cell;
                        const todayDay = isToday(day);
                        const selectedDay = isSelected(day);
                        const pastDay = new Date(year, month, day) < today && !todayDay;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(new Date(year, month, day))}
                                aria-pressed={selectedDay}
                                aria-current={todayDay ? 'date' : undefined}
                                className={cn(
                                    'relative flex h-11 w-full select-none items-center justify-center rounded-full font-mono text-sm transition-colors duration-150 sm:h-12',
                                    selectedDay && 'bg-primary text-primary-foreground',
                                    !selectedDay && todayDay && 'border border-rule text-foreground',
                                    !selectedDay && !todayDay && pastDay && 'text-muted-foreground hover:bg-hover hover:text-foreground',
                                    !selectedDay && !todayDay && !pastDay && 'text-foreground hover:bg-hover',
                                )}
                            >
                                {day}
                                {todayDay && <span className="saffron-dot absolute bottom-1 h-[5px] w-[5px]" aria-hidden />}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-1 pt-4">
                    {CATEGORY_CONFIG.map(c => (
                        <span key={c.key} className="flex items-center gap-1.5 font-mono text-[11.5px] text-muted-foreground">
                            <span className={cn('inline-block h-[7px] w-[7px] rounded-full', c.dotColor)} aria-hidden />
                            {c.label.toLowerCase()}
                        </span>
                    ))}
                </div>
            </div>

            {/* Detail panel */}
            {!selectedDate ? (
                <div className="mt-10">
                    <EmptyState>Pick a day to see everything you logged on it.</EmptyState>
                </div>
            ) : (
                <Section
                    kicker={`§ 01 · ${formatDate(selectedDate)}`}
                    aside={isLoading ? <span className="font-mono text-xs text-muted-foreground animate-pulse">loading…</span> : undefined}
                    className="mt-12"
                >
                    {!isLoading && !hasActivities && <EmptyState>Nothing was logged on this day.</EmptyState>}

                    {!isLoading && hasActivities && (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {CATEGORY_CONFIG.map(cat => {
                                const items = activities[cat.key as CategoryKey];
                                if (items.length === 0) return null;

                                return (
                                    <div key={cat.key} className="rounded-card bg-card p-6 shadow-card">
                                        <div className="flex items-baseline justify-between gap-3">
                                            <h3 className="flex items-center gap-2 text-[19px] font-semibold">
                                                <span className={cn('inline-block h-[7px] w-[7px] rounded-full', cat.dotColor)} aria-hidden />
                                                {cat.label}
                                            </h3>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                {items.length} {items.length === 1 ? 'entry' : 'entries'}
                                            </p>
                                        </div>

                                        <ul className="mt-4">
                                            {cat.key === 'habits' && items.map((h: any) => (
                                                <li key={h._id} className="border-t border-border py-2.5 text-[15px]">{h.title}</li>
                                            ))}

                                            {cat.key === 'sleep' && items.map((s: any) => (
                                                <li key={s._id} className="flex items-center justify-between border-t border-border py-2.5">
                                                    <span className="text-[15px]">Duration</span>
                                                    <span className="font-mono text-sm">{Math.floor(s.duration / 60)}h {s.duration % 60}m</span>
                                                </li>
                                            ))}

                                            {cat.key === 'food' && items.map((f: any) => (
                                                <li key={f._id} className="flex items-center justify-between border-t border-border py-2.5">
                                                    <span className="text-[15px] capitalize">{f.mealType}</span>
                                                    {f.calories > 0 && <span className="font-mono text-xs text-muted-foreground">{f.calories} kcal</span>}
                                                </li>
                                            ))}

                                            {cat.key === 'study' && items.map((s: any) => (
                                                <li key={s._id} className="flex items-center justify-between gap-3 border-t border-border py-2.5">
                                                    <span className="text-[15px]">{s.topic}</span>
                                                    <span className="font-mono text-xs text-muted-foreground">{Math.floor(s.timeSpent / 60)}h {s.timeSpent % 60}m</span>
                                                </li>
                                            ))}

                                            {cat.key === 'expenses' && items.map((e: any) => (
                                                <li key={e._id} className="flex items-center justify-between border-t border-border py-2.5">
                                                    <span className="text-[15px] capitalize">{e.category}</span>
                                                    <span className="font-mono text-sm">₹{e.amount.toFixed(2)}</span>
                                                </li>
                                            ))}

                                            {cat.key === 'journal' && items.map((j: any) => (
                                                <li key={j._id} className="border-t border-border py-2.5">
                                                    <p className="text-[15px] text-body">{j.summary}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Section>
            )}
        </PageShell>
    );
}
