'use client';

import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { Modal } from './modal';

interface DayActivity {
    date: string; // YYYY-MM-DD
    habits: number; // number of habits checked in
    sleep?: {
        hours: number;
        startTime?: string;
    };
    study?: {
        hours: number;
        sessions: number;
    };
    streak?: boolean; // part of active streak
}

interface ActivityCalendarProps {
    activities: DayActivity[];
    currentStreak: number;
}

export function ActivityCalendar({ activities, currentStreak }: ActivityCalendarProps) {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [selectedDay, setSelectedDay] = React.useState<DayActivity | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const activitiesMap = new Map(
        (activities || []).map(activity => [activity.date, activity])
    );

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const handleDayClick = (day: Date, activity: DayActivity | undefined) => {
        if (activity && (activity.habits > 0 || activity.sleep || activity.study)) {
            setSelectedDay(activity || { date: format(day, 'yyyy-MM-dd'), habits: 0 });
            setIsModalOpen(true);
        }
    };

    // Ledger heatmap levels (DESIGN.md --heat-1..4): marigold into kumkum.
    const HEAT = ['rgba(255,122,24,.32)', 'rgba(255,122,24,.68)', 'rgba(232,51,109,.85)', '#E8336D'];
    const getHeat = (activity: DayActivity | undefined) => {
        if (!activity || activity.habits === 0) return undefined;
        return HEAT[Math.min(HEAT.length - 1, Math.floor(Math.min(activity.habits / 5, 0.99) * HEAT.length))];
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <>
            <div className="rounded-card bg-card p-4 shadow-card sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-5">
                    <h3 className="font-display text-[30px] leading-none sm:text-[36px]">
                        {format(currentDate, 'MMMM')} <span className="font-mono text-sm text-muted-foreground">{format(currentDate, 'yyyy')}</span>
                    </h3>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={goToPreviousMonth} aria-label="Previous month">
                            <ChevronLeft className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                        </Button>
                        <Button variant="outline" onClick={goToToday}>
                            Today
                        </Button>
                        <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="Next month">
                            <ChevronRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                        </Button>
                    </div>
                </div>

                {/* Week day headers */}
                <div className="grid grid-cols-7 gap-1 border-t border-border pt-3 pb-1 md:gap-2">
                    {weekDays.map((day) => (
                        <div key={day} className="py-1 text-center font-mono text-[11px] lowercase tracking-[0.08em] text-muted-foreground">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {days.map((day, index) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const activity = activitiesMap.get(dateStr);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isCurrentDay = isToday(day);
                        const hasActivity = activity && activity.habits > 0;
                        const heat = getHeat(activity);

                        return (
                            <div
                                key={index}
                                onClick={() => handleDayClick(day, activity)}
                                style={heat ? { backgroundColor: heat } : undefined}
                                className={`relative min-h-[52px] rounded-tile p-1.5 transition-colors duration-150 md:min-h-[88px] md:p-2
                                    ${heat ? '' : isCurrentMonth ? 'bg-muted' : 'bg-transparent'}
                                    ${isCurrentMonth ? '' : 'opacity-40'}
                                    ${isCurrentDay ? 'outline outline-1 outline-offset-1 outline-rule' : ''}
                                    ${hasActivity ? 'cursor-pointer' : ''}`}
                            >
                                <div className={`font-mono text-[11px] md:text-xs ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {format(day, 'd')}
                                </div>

                                {hasActivity && activity && (
                                    <div className="mt-1 hidden flex-col gap-0.5 font-mono text-[10px] leading-tight text-foreground md:flex">
                                        <span>{activity.habits} habit{activity.habits === 1 ? '' : 's'}</span>
                                        {activity.sleep && <span>{activity.sleep.hours.toFixed(1)}h sleep</span>}
                                        {activity.study && activity.study.hours > 0 && <span>{activity.study.hours.toFixed(1)}h study</span>}
                                    </div>
                                )}
                                {activity?.streak && (
                                    <span className="saffron-dot absolute right-1.5 top-1.5 h-[6px] w-[6px] md:right-2 md:top-2" aria-label="Part of streak" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-1 pt-4 font-mono text-[11.5px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        less
                        <span className="h-3 w-3 rounded-[2.5px] bg-muted" aria-hidden />
                        {HEAT.map((c) => (
                            <span key={c} className="h-3 w-3 rounded-[2.5px]" style={{ backgroundColor: c }} aria-hidden />
                        ))}
                        more habits
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="saffron-dot h-[6px] w-[6px]" aria-hidden />
                        streak · {currentStreak} days
                    </span>
                </div>
            </div>

            {/* Day Details Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedDay ? format(new Date(selectedDay.date), 'EEEE, d MMMM') : 'Day details'} size="md">
                {selectedDay && (
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-8">
                        {selectedDay.habits > 0 && (
                            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4">
                                <dt className="font-mono text-xs text-muted-foreground">
                                    habits done{selectedDay.streak ? ' · in a streak' : ''}
                                </dt>
                                <dd className="font-display text-[48px] leading-none">{selectedDay.habits}</dd>
                            </div>
                        )}
                        {selectedDay.sleep && (
                            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4">
                                <dt className="font-mono text-xs text-muted-foreground">
                                    hours of sleep{selectedDay.sleep.startTime ? ` · from ${selectedDay.sleep.startTime}` : ''}
                                </dt>
                                <dd className="font-display text-[48px] leading-none">{selectedDay.sleep.hours.toFixed(1)}</dd>
                            </div>
                        )}
                        {selectedDay.study && selectedDay.study.hours > 0 && (
                            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4">
                                <dt className="font-mono text-xs text-muted-foreground">
                                    hours of study · {selectedDay.study.sessions} session{selectedDay.study.sessions !== 1 ? 's' : ''}
                                </dt>
                                <dd className="font-display text-[48px] leading-none">{selectedDay.study.hours.toFixed(1)}</dd>
                            </div>
                        )}
                        {selectedDay.habits === 0 && !selectedDay.sleep && (!selectedDay.study || selectedDay.study.hours === 0) && (
                            <p className="col-span-2 py-8 text-center text-muted-foreground">No activity recorded for this day</p>
                        )}
                    </dl>
                )}
            </Modal>
        </>
    );
}
