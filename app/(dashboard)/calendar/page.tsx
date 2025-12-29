'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { formatDate, getStartOfDay, getEndOfDay } from '@/lib/utils';
import { Activity, Moon, UtensilsCrossed, BookOpen, DollarSign, FileText } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fetch data for selected date
    const { data: dayData } = useQuery({
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

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
    };

    const getDayClass = (day: number) => {
        const date = new Date(year, month, day);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
        const isPast = date < today && !isToday;

        return `
      w-10 h-10 flex items-center justify-center rounded-lg transition-colors
      ${isSelected ? 'bg-blue-600 text-white' : ''}
      ${isToday && !isSelected ? 'bg-blue-100 text-blue-600 font-bold' : ''}
      ${!isSelected && !isToday ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
      ${isPast && !isSelected && !isToday ? 'text-gray-400' : 'text-gray-900 dark:text-white'}
      cursor-pointer
    `;
    };

    const renderCalendar = () => {
        const days = [];

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            days.push(
                <button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={getDayClass(day)}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const activities = dayData || {
        habits: [],
        sleep: [],
        food: [],
        study: [],
        expenses: [],
        journal: [],
    };

    const hasActivities =
        activities.habits.length > 0 ||
        activities.sleep.length > 0 ||
        activities.food.length > 0 ||
        activities.study.length > 0 ||
        activities.expenses.length > 0 ||
        activities.journal.length > 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold dark:text-white">Calendar</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
                {/* Calendar */}
                <Card className="mb-6 dark:bg-gray-800">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="dark:text-white">
                                {MONTHS[month]} {year}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigateMonth('prev')}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigateMonth('next')}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {DAYS.map((day) => (
                                <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {day}
                                </div>
                            ))}
                        </div>
                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {renderCalendar()}
                        </div>
                    </CardContent>
                </Card>

                {/* Selected Day Activities */}
                {selectedDate && (
                    <Card className="dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="dark:text-white">
                                {formatDate(selectedDate)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!hasActivities ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No activities recorded for this day</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activities.habits.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2 flex items-center gap-2 dark:text-white">
                                                <Activity className="h-4 w-4" />
                                                Habits ({activities.habits.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {activities.habits.map((habit: any) => (
                                                    <div key={habit._id} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                        <p className="text-sm dark:text-white">{habit.title}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activities.sleep.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2 flex items-center gap-2 dark:text-white">
                                                <Moon className="h-4 w-4" />
                                                Sleep
                                            </h3>
                                            {activities.sleep.map((sleep: any) => (
                                                <div key={sleep._id} className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                                                    <p className="text-sm dark:text-white">
                                                        {Math.floor(sleep.duration / 60)}h {sleep.duration % 60}m
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activities.food.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2 flex items-center gap-2 dark:text-white">
                                                <UtensilsCrossed className="h-4 w-4" />
                                                Meals ({activities.food.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {activities.food.map((meal: any) => (
                                                    <div key={meal._id} className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                                        <p className="text-sm dark:text-white capitalize">{meal.mealType}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activities.study.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2 flex items-center gap-2 dark:text-white">
                                                <BookOpen className="h-4 w-4" />
                                                Study ({activities.study.length} sessions)
                                            </h3>
                                            <div className="space-y-2">
                                                {activities.study.map((session: any) => (
                                                    <div key={session._id} className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                                        <p className="text-sm dark:text-white">
                                                            {session.topic} - {Math.floor(session.timeSpent / 60)}h {session.timeSpent % 60}m
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activities.expenses.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2 flex items-center gap-2 dark:text-white">
                                                <DollarSign className="h-4 w-4" />
                                                Expenses ({activities.expenses.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {activities.expenses.map((expense: any) => (
                                                    <div key={expense._id} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                                        <p className="text-sm dark:text-white">
                                                            {expense.category} - ₹{expense.amount.toFixed(2)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activities.journal.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2 flex items-center gap-2 dark:text-white">
                                                <FileText className="h-4 w-4" />
                                                Journal
                                            </h3>
                                            {activities.journal.map((entry: any) => (
                                                <div key={entry._id} className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded">
                                                    <p className="text-sm dark:text-white">{entry.summary}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {!selectedDate && (
                    <Card className="dark:bg-gray-800">
                        <CardContent className="py-12 text-center">
                            <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">Select a date to view activities</p>
                        </CardContent>
                    </Card>
                )}
            </main>
            <NavBar />
        </div>
    );
}

