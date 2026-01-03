'use client';

import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Flame, Bed, GraduationCap, X } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
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

    const getActivityGradient = (activity: DayActivity | undefined) => {
        if (!activity || activity.habits === 0) return '';

        const intensity = Math.min(activity.habits / 5, 1);
        if (intensity < 0.2) return 'from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20';
        if (intensity < 0.4) return 'from-green-200 to-emerald-200 dark:from-green-800/30 dark:to-emerald-800/30';
        if (intensity < 0.6) return 'from-green-300 to-emerald-300 dark:from-green-700/40 dark:to-emerald-700/40';
        if (intensity < 0.8) return 'from-green-400 to-emerald-400 dark:from-green-600/50 dark:to-emerald-600/50';
        return 'from-green-500 to-emerald-500 dark:from-green-500/60 dark:to-emerald-500/60';
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-pink-400 dark:to-blue-400">
                            {format(currentDate, 'MMMM yyyy')}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={goToPreviousMonth}
                                className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={goToToday}
                                className="h-8 px-3 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-full shadow-sm"
                            >
                                Today
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={goToNextMonth}
                                className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6">
                    {/* Week day headers */}
                    <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-3">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="text-center text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-1 md:py-2 uppercase tracking-wider"
                            >
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

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleDayClick(day, activity)}
                                    className={`
                                        relative min-h-[60px] md:min-h-[100px] lg:min-h-[110px] p-1 md:p-2 rounded-lg md:rounded-xl transition-all duration-200
                                        ${isCurrentMonth
                                            ? 'bg-white dark:bg-gray-900/50'
                                            : 'bg-gray-50/50 dark:bg-gray-950/50 opacity-60'
                                        }
                                        ${isCurrentDay
                                            ? 'ring-2 ring-offset-1 md:ring-offset-2 ring-blue-500 dark:ring-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-md scale-105'
                                            : 'border border-gray-100 dark:border-gray-800/50'
                                        }
                                        ${hasActivity && activity ? `bg-gradient-to-br ${getActivityGradient(activity)} border-0 shadow-sm cursor-pointer` : ''}
                                        ${hasActivity ? 'hover:shadow-lg hover:scale-105 hover:z-10' : ''}
                                    `}
                                >
                                    {/* Date number */}
                                    <div className={`
                                        text-xs md:text-sm font-semibold mb-1 md:mb-2
                                        ${isCurrentMonth
                                            ? 'text-gray-700 dark:text-gray-300'
                                            : 'text-gray-400 dark:text-gray-600'
                                        }
                                        ${isCurrentDay
                                            ? 'text-blue-600 dark:text-blue-400 font-bold'
                                            : ''
                                        }
                                        ${hasActivity ? 'text-white dark:text-gray-100' : ''}
                                    `}>
                                        {format(day, 'd')}
                                    </div>

                                    {/* Activity indicators */}
                                    {hasActivity && activity && (
                                        <div className="space-y-0.5 md:space-y-1">
                                            {/* Habit streak indicator */}
                                            {activity.streak && (
                                                <div className="flex items-center gap-0.5 md:gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-1 md:px-2 py-0.5 md:py-1 rounded text-[8px] md:text-[10px]">
                                                    <Flame className="h-2 w-2 md:h-3 md:w-3" />
                                                    <span className="font-bold">
                                                        {activity.habits}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Sleep indicator */}
                                            {activity.sleep && (
                                                <div className="flex items-center gap-0.5 md:gap-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-1 md:px-2 py-0.5 md:py-1 rounded text-[8px] md:text-[10px]">
                                                    <Bed className="h-2 w-2 md:h-3 md:w-3" />
                                                    <span className="font-bold">
                                                        {activity.sleep.hours.toFixed(1)}h
                                                    </span>
                                                </div>
                                            )}

                                            {/* Study indicator */}
                                            {activity.study && activity.study.hours > 0 && (
                                                <div className="flex items-center gap-0.5 md:gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1 md:px-2 py-0.5 md:py-1 rounded text-[8px] md:text-[10px]">
                                                    <GraduationCap className="h-2 w-2 md:h-3 md:w-3" />
                                                    <span className="font-bold">
                                                        {activity.study.hours.toFixed(1)}h
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 md:mt-8 pt-3 md:pt-6 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-[10px] md:text-xs">
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gradient-to-br from-green-400 to-emerald-400 shadow-sm"></div>
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Habits</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gradient-to-r from-orange-500 to-red-500 shadow-sm"></div>
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Streak</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm"></div>
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Sleep</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm"></div>
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Study</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Day Details Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedDay ? format(new Date(selectedDay.date), 'EEEE, MMMM d, yyyy') : 'Day Details'} size="md">
                {selectedDay && (
                    <div className="space-y-4">
                        {selectedDay.habits > 0 && (
                            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    <h3 className="font-bold text-gray-900 dark:text-white">Habits Completed</h3>
                                </div>
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{selectedDay.habits}</p>
                                {selectedDay.streak && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">🔥 Part of active streak!</p>
                                )}
                            </div>
                        )}

                        {selectedDay.sleep && (
                            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Bed className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    <h3 className="font-bold text-gray-900 dark:text-white">Sleep</h3>
                                </div>
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{selectedDay.sleep.hours.toFixed(1)} hours</p>
                                {selectedDay.sleep.startTime && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Started at {selectedDay.sleep.startTime}</p>
                                )}
                            </div>
                        )}

                        {selectedDay.study && selectedDay.study.hours > 0 && (
                            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    <h3 className="font-bold text-gray-900 dark:text-white">Study</h3>
                                </div>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedDay.study.hours.toFixed(1)} hours</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedDay.study.sessions} session{selectedDay.study.sessions !== 1 ? 's' : ''}</p>
                            </div>
                        )}

                        {selectedDay.habits === 0 && !selectedDay.sleep && (!selectedDay.study || selectedDay.study.hours === 0) && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No activity recorded for this day</p>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}
