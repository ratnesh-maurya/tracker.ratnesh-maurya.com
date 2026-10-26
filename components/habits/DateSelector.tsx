'use client';

import { useState, useEffect, useRef } from 'react';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

export function DateSelector({ selectedDate, onDateSelect }: DateSelectorProps) {
    const [dates, setDates] = useState<Date[]>([]);
    const selectedRef = useRef<HTMLButtonElement>(null);

    // Newest day is on the right; keep the selected one visible on narrow screens.
    useEffect(() => {
        // Scroll only the strip, never the page.
        const el = selectedRef.current;
        const strip = el?.parentElement;
        if (el && strip) strip.scrollLeft = el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2;
    }, [dates, selectedDate]);

    useEffect(() => {
        // Show past 7 days + today
        const today = new Date();
        const pastDates = Array.from({ length: 8 }, (_, i) => subDays(today, 7 - i));
        setDates(pastDates);
    }, []);

    return (
        <div className="relative -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
            {dates.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                const dayName = format(date, 'EEE').toUpperCase();
                const dayNumber = format(date, 'd');
                const isToday = isSameDay(date, new Date());

                return (
                    <button
                        key={date.toISOString()}
                        ref={isSelected ? selectedRef : undefined}
                        onClick={() => onDateSelect(date)}
                        aria-pressed={isSelected}
                        aria-label={format(date, 'EEEE, d MMMM')}
                        className={cn(
                            'relative flex min-h-[64px] min-w-[56px] flex-shrink-0 flex-col items-center justify-center gap-1 rounded-full border px-3 transition-colors duration-150',
                            isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-muted-foreground hover:border-rule hover:text-foreground'
                        )}
                    >
                        <span className="font-mono text-[11px] tracking-[0.08em]">{dayName}</span>
                        <span className="font-display text-[22px] leading-none">{dayNumber}</span>
                        {isToday && !isSelected && <span className="saffron-dot absolute bottom-1.5 h-[5px] w-[5px]" aria-hidden />}
                    </button>
                );
            })}
        </div>
    );
}
