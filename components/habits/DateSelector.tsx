'use client';

import { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

export function DateSelector({ selectedDate, onDateSelect }: DateSelectorProps) {
    const [dates, setDates] = useState<Date[]>([]);

    useEffect(() => {
        // Show past 7 days + today
        const today = new Date();
        const pastDates = Array.from({ length: 8 }, (_, i) => subDays(today, 7 - i));
        setDates(pastDates);
    }, []);

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {dates.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                const dayName = format(date, 'EEE').toUpperCase();
                const dayNumber = format(date, 'd');
                const isToday = isSameDay(date, new Date());

                return (
                    <button
                        key={date.toISOString()}
                        onClick={() => onDateSelect(date)}
                        className={cn(
                            'flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg transition-all flex-shrink-0',
                            isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                            isToday && !isSelected && 'border-2 border-blue-400'
                        )}
                    >
                        <span className="text-xs font-medium">{dayName}</span>
                        <span className="text-lg font-bold">{dayNumber}</span>
                    </button>
                );
            })}
        </div>
    );
}
