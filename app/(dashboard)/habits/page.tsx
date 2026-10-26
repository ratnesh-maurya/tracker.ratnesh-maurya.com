'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Check, Edit, Trash2 } from 'lucide-react';
import { EmptyState, PageHeader, PageShell, Section } from '@/components/layout/page';
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
import { HabitCheckIns, applyCheckIn, fetchCheckInsByHabit } from '@/lib/habits/checkins';
import { CHECKIN_KEY, CheckInVars } from '@/lib/offline/queue';

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
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Fetch check-ins for selected date
    const selectedDateStart = getStartOfDay(selectedDate);
    const { data: checkInsData } = useQuery({
        queryKey: ['checkins', selectedDateStart.toISOString()],
        queryFn: () => fetchCheckInsByHabit(habitsData ?? [], selectedDateStart),
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        enabled: !!habitsData,
    });

    // Fetch all check-ins for streak calculation
    const { data: allCheckInsData } = useQuery({
        queryKey: ['checkins', 'all'],
        queryFn: () => fetchCheckInsByHabit(habitsData ?? []),
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
    // Goes through the offline queue (sending is defined in lib/offline/queue.ts).
    // The tap shows at once; the server overwrites by day, so a retry is harmless.
    const checkInMutation = useMutation<unknown, Error, CheckInVars>({
        mutationKey: CHECKIN_KEY,
        onMutate: async ({ habitId, date, value }) => {
            await queryClient.cancelQueries({ queryKey: ['checkins'] });
            const update = (old?: HabitCheckIns[]) => old && applyCheckIn(old, habitId, date, value);
            queryClient.setQueryData(['checkins', date], update);
            queryClient.setQueryData(['checkins', 'all'], update);
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
        checkInMutation.mutate({ habitId, date: selectedDateStart.toISOString(), value });
    };

    const handleCircleClick = async (habitId: string, circleIndex: number, currentValue: number, target: number) => {
        // Toggle the specific circle
        const newValue = circleIndex <= currentValue ? circleIndex - 1 : circleIndex;
        checkInMutation.mutate({ habitId, date: selectedDateStart.toISOString(), value: Math.max(0, newValue) });
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
        <>
            <HabitReminderManager />
            <PageShell>
                <PageHeader
                    kicker={`§ 02 · ${format(selectedDate, 'EEEE, d MMM').toLowerCase()}`}
                    title={<>Small things, <em>daily</em></>}
                    action={
                        <Button
                            onClick={() => {
                                setEditingHabit(null);
                                setIsModalOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                            New habit
                        </Button>
                    }
                />

                <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />

                {isLoading ? (
                    <p className="py-12 text-center font-mono text-sm text-muted-foreground animate-pulse">loading…</p>
                ) : habits.length === 0 ? (
                    <div className="mt-8">
                        <EmptyState
                            action={
                                <Button onClick={() => setIsModalOpen(true)}>
                                    <Plus className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                    Create a habit
                                </Button>
                            }
                        >
                            No habits yet. Start with one you can do in two minutes.
                        </EmptyState>
                    </div>
                ) : (
                    <>
                        <div className="mt-8">
                            <DailyGoalsCard completed={completedHabits.length} total={habits.length} />
                        </div>

                        <Section
                            kicker={viewMode === 'done' ? `§ 01 · done (${completedHabits.length})` : `§ 01 · to do (${habits.length - completedHabits.length})`}
                            aside={
                                <div className="flex gap-2">
                                    {(['view', 'done'] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => setViewMode(mode)}
                                            aria-pressed={viewMode === mode}
                                            className={`inline-flex min-h-[40px] items-center rounded-full border px-4 text-sm font-medium transition-colors duration-150 ${viewMode === mode
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-card text-muted-foreground hover:border-rule hover:text-foreground'
                                                }`}
                                        >
                                            {mode === 'view' ? 'To do' : 'Done'}
                                        </button>
                                    ))}
                                </div>
                            }
                        >
                            {displayedHabits.length === 0 ? (
                                <EmptyState>
                                    {viewMode === 'done' ? 'Nothing checked off yet for this day.' : 'Everything is done for this day.'}
                                </EmptyState>
                            ) : (
                                <ul className="grid gap-3 sm:grid-cols-2">
                                    {displayedHabits.map((habit) => {
                                        const dateCheckIn = getDateCheckIn(habit._id);
                                        const currentValue = dateCheckIn ? (habit.type === 'boolean' ? (dateCheckIn.value === true ? 1 : 0) : Number(dateCheckIn.value)) : 0;
                                        const isCompleted = habit.type === 'boolean'
                                            ? currentValue === 1
                                            : habit.target ? currentValue >= habit.target : currentValue > 0;
                                        const streak = getStreak(habit._id);

                                        return (
                                            <li key={habit._id} className="flex flex-col rounded-card bg-card p-6 shadow-card">
                                                <div className="flex items-start gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-mono text-xs text-muted-foreground">
                                                            {habit.habitualType === 'quit' ? 'quit' : 'build'} · {habit.timeRange || 'anytime'}
                                                        </p>
                                                        <h3 className="mt-2 flex items-center gap-2 text-[19px] font-semibold leading-snug">
                                                            {habit.icon && <span aria-hidden>{habit.icon}</span>}
                                                            <span className="truncate">{habit.title}</span>
                                                        </h3>
                                                    </div>
                                                    <div className="-mr-2 -mt-2 flex shrink-0 items-center">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(habit)} aria-label={`Edit ${habit.title}`}>
                                                            <Edit className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(habit._id)}
                                                            aria-label={`Delete ${habit.title}`}
                                                            className="hover:text-kicker"
                                                        >
                                                            <Trash2 className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {(streak > 0 || (habit.type === 'count' && habit.target)) && (
                                                <p className="mt-3 flex items-center gap-3 font-mono text-xs text-muted-foreground">
                                                    {streak > 0 && (
                                                        <span className="inline-flex items-center gap-1.5 text-foreground">
                                                            <span className="saffron-dot h-[7px] w-[7px]" aria-hidden />
                                                            {streak}-day streak
                                                        </span>
                                                    )}
                                                    {habit.type === 'count' && habit.target && (
                                                        <span>
                                                            {currentValue} / {habit.target} {habit.schedule === 'daily' ? 'today' : 'this week'}
                                                        </span>
                                                    )}
                                                </p>
                                                )}

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
                                                        variant={isCompleted ? 'default' : 'outline'}
                                                        aria-pressed={isCompleted}
                                                        className="mt-5 w-full"
                                                    >
                                                        {isCompleted ? (
                                                            <>
                                                                <Check className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                                                Done
                                                            </>
                                                        ) : (
                                                            'Mark done'
                                                        )}
                                                    </Button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </Section>
                    </>
                )}
            </PageShell>

            <HabitModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingHabit(null);
                }}
                onSave={handleSave}
                habit={editingHabit}
            />
        </>
    );
}
