'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Check, Edit, Trash2, Flame, Sparkles } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { HabitModal } from '@/components/habits/HabitModal';
import { DateSelector } from '@/components/habits/DateSelector';
import { DailyGoalsCard } from '@/components/habits/DailyGoalsCard';
import { GoalCircles } from '@/components/habits/GoalCircles';
import { HabitReminderManager } from '@/components/habits/HabitReminderManager';
import { Habit } from '@/types';
import { calculateStreak } from '@/lib/habits/streak';
import { getStartOfDay } from '@/lib/utils';
import { format } from 'date-fns';
import { handleApiResponse } from '@/lib/api/client';

export default function HabitsPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'view' | 'done'>('view');

    // Fetch habits
    const { data: habitsData, isLoading } = useQuery({
        queryKey: ['habits'],
        queryFn: async () => {
            const res = await fetch('/api/habits', { cache: 'no-store' });
            return handleApiResponse<Habit[]>(res);
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Fetch check-ins for selected date
    const selectedDateStart = getStartOfDay(selectedDate);
    const { data: checkInsData } = useQuery({
        queryKey: ['checkins', selectedDateStart.toISOString()],
        queryFn: async () => {
            if (!habitsData) return [];
            const checkIns = await Promise.all(
                habitsData.map(async (habit) => {
                    const res = await fetch(`/api/habits/${habit._id}/checkins?startDate=${selectedDateStart.toISOString()}&endDate=${selectedDateStart.toISOString()}`, { cache: 'no-store' });
                    const data = await res.json();
                    return { habitId: habit._id, checkIns: data.success ? data.data : [] };
                })
            );
            return checkIns;
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        enabled: !!habitsData,
    });

    // Fetch all check-ins for streak calculation
    const { data: allCheckInsData } = useQuery({
        queryKey: ['checkins', 'all'],
        queryFn: async () => {
            if (!habitsData) return [];
            const checkIns = await Promise.all(
                habitsData.map(async (habit) => {
                    const res = await fetch(`/api/habits/${habit._id}/checkins`);
                    const data = await res.json();
                    return { habitId: habit._id, checkIns: data.success ? data.data : [] };
                })
            );
            return checkIns;
        },
        enabled: !!habitsData,
    });

    // Create habit mutation
    const createMutation = useMutation({
        mutationFn: async (habit: Partial<Habit>) => {
            const res = await fetch('/api/habits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(habit),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            setIsModalOpen(false);
        },
    });

    // Update habit mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, habit }: { id: string; habit: Partial<Habit> }) => {
            const res = await fetch(`/api/habits/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(habit),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            setIsModalOpen(false);
            setEditingHabit(null);
        },
    });

    // Delete habit mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/habits/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
        },
    });

    // Check-in mutation
    const checkInMutation = useMutation({
        mutationFn: async ({ habitId, value }: { habitId: string; value: boolean | number }) => {
            const res = await fetch(`/api/habits/${habitId}/checkins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: selectedDateStart.toISOString(),
                    value,
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checkins'] });
        },
    });

    const handleSave = async (habit: Partial<Habit>) => {
        if (editingHabit) {
            await updateMutation.mutateAsync({ id: editingHabit._id, habit });
        } else {
            await createMutation.mutateAsync(habit);
        }
    };

    const handleEdit = (habit: Habit) => {
        setEditingHabit(habit);
        setIsModalOpen(true);
    };

    const handleDelete = async (habitId: string) => {
        if (confirm('Are you sure you want to delete this habit?')) {
            await deleteMutation.mutateAsync(habitId);
        }
    };

    const handleCheckIn = async (habitId: string, value: boolean | number) => {
        await checkInMutation.mutateAsync({ habitId, value });
    };

    const handleCircleClick = async (habitId: string, circleIndex: number, currentValue: number, target: number) => {
        // Toggle the specific circle
        const newValue = circleIndex <= currentValue ? circleIndex - 1 : circleIndex;
        await checkInMutation.mutateAsync({ habitId, value: Math.max(0, newValue) });
    };

    const habits = habitsData || [];
    const selectedDateCheckIns = checkInsData || [];
    const allCheckIns = allCheckInsData || [];

    const getDateCheckIn = (habitId: string) => {
        const habitCheckIns = selectedDateCheckIns.find((c) => c.habitId === habitId);
        return habitCheckIns?.checkIns?.[0] || null;
    };

    const getStreak = (habitId: string) => {
        const habitCheckIns = allCheckIns.find((c) => c.habitId === habitId);
        if (!habitCheckIns) return 0;
        return calculateStreak(habitCheckIns.checkIns);
    };

    const completedHabits = habits.filter((habit) => {
        const checkIn = getDateCheckIn(habit._id);
        if (!checkIn) return false;
        if (habit.type === 'boolean') return checkIn.value === true;
        if (habit.type === 'count' && habit.target) {
            return Number(checkIn.value) >= habit.target;
        }
        return Number(checkIn.value) > 0;
    });

    const displayedHabits = viewMode === 'done'
        ? completedHabits
        : habits.filter((habit) => {
            const checkIn = getDateCheckIn(habit._id);
            if (!checkIn) return true;
            if (habit.type === 'boolean') return checkIn.value !== true;
            if (habit.type === 'count' && habit.target) {
                return Number(checkIn.value) < habit.target;
            }
            return Number(checkIn.value) === 0;
        });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <HabitReminderManager />
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">Habits</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{format(selectedDate, 'MMMM, d')}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingHabit(null);
                                setIsModalOpen(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New
                        </Button>
                    </div>
                    <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-20">
                {isLoading ? (
                    <div className="text-center py-12 animate-pulse text-gray-400 dark:text-gray-500">Loading...</div>
                ) : habits.length === 0 ? (
                    <Card className="border-2 border-dashed border-white/40 dark:border-white/20 bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl">
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-600 dark:text-gray-300 mb-4">No habits yet. Create your first habit to get started!</p>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Habit
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <DailyGoalsCard completed={completedHabits.length} total={habits.length} />

                        <div className="mt-6 flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Habits</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('view')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${viewMode === 'view'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                        }`}
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => setViewMode('done')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${viewMode === 'done'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                        }`}
                                >
                                    Done
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {displayedHabits.map((habit) => {
                                const dateCheckIn = getDateCheckIn(habit._id);
                                const currentValue = dateCheckIn ? (habit.type === 'boolean' ? (dateCheckIn.value === true ? 1 : 0) : Number(dateCheckIn.value)) : 0;
                                const isCompleted = habit.type === 'boolean'
                                    ? currentValue === 1
                                    : habit.target ? currentValue >= habit.target : currentValue > 0;
                                const streak = getStreak(habit._id);

                                return (
                                    <Card key={habit._id} className="hover:shadow-2xl transition-shadow bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl border border-white/30 dark:border-white/10">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                                                    style={{ backgroundColor: `${habit.color || '#3B82F6'}20` }}
                                                >
                                                    {habit.icon || '📝'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div className="flex-1 min-w-0 pr-2 overflow-hidden">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold text-lg truncate text-gray-800 dark:text-gray-100">{habit.title}</h3>
                                                                {streak > 0 && (
                                                                    <span className="hidden sm:inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full flex-shrink-0">
                                                                        <Flame className="h-3 w-3" />
                                                                        {streak}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {habit.type === 'count' && habit.target && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                    {currentValue} / {habit.target} {habit.schedule === 'daily' ? 'per day' : 'per week'}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEdit(habit)}
                                                                className="h-8 w-8 flex-shrink-0"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(habit._id)}
                                                                className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {habit.type === 'count' && habit.target && habit.target > 1 && (
                                                        <GoalCircles
                                                            target={habit.target}
                                                            current={currentValue}
                                                            onCircleClick={(circleIndex) => handleCircleClick(habit._id, circleIndex, currentValue, habit.target!)}
                                                        />
                                                    )}

                                                    {habit.type === 'boolean' && (
                                                        <Button
                                                            onClick={() => handleCheckIn(habit._id, !isCompleted)}
                                                            size="lg"
                                                            className={`w-full mt-2 rounded-lg ${isCompleted
                                                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                                                                }`}
                                                        >
                                                            {isCompleted ? (
                                                                <>
                                                                    <Check className="h-5 w-5 mr-2" />
                                                                    Completed
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Plus className="h-5 w-5 mr-2" />
                                                                    Mark Complete
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                )}
            </main>

            <HabitModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingHabit(null);
                }}
                onSave={handleSave}
                habit={editingHabit}
            />
            <NavBar />
        </div>
    );
}
