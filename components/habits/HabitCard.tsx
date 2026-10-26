'use client';

import { Habit } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface HabitCardProps {
    habit: Habit;
    onCheckIn: (habitId: string, value: boolean | number) => void;
    onEdit: (habit: Habit) => void;
    onDelete: (habitId: string) => void;
    streak?: number;
    todayChecked?: boolean;
}

export function HabitCard({ habit, onCheckIn, onEdit, onDelete, streak = 0, todayChecked = false }: HabitCardProps) {
    const [isChecking, setIsChecking] = useState(false);

    const handleCheckIn = async () => {
        setIsChecking(true);
        try {
            if (habit.type === 'boolean') {
                await onCheckIn(habit._id, !todayChecked);
            } else {
                // For count type, increment by 1
                await onCheckIn(habit._id, (todayChecked ? 0 : 1));
            }
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        {habit.icon && (
                            <div className="text-2xl" aria-hidden>{habit.icon}</div>
                        )}
                        <div className="flex-1">
                            <CardTitle className="font-sans text-[19px] font-semibold leading-snug tracking-normal mb-1">{habit.title}</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[12.5px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                                    {habit.schedule}
                                </span>
                                {streak > 0 && (
                                    <span className="font-mono text-[12.5px] px-2.5 py-1 rounded-full bg-muted text-foreground flex items-center gap-1.5">
                                        <span className="saffron-dot h-[7px] w-[7px]" aria-hidden />
                                        {streak} day streak
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(habit)}
                        >
                            <Edit className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(habit._id)}
                            className="hover:text-kicker"
                        >
                            <Trash2 className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        {habit.type === 'count' && habit.target && (
                            <p className="font-mono text-xs text-muted-foreground">
                                Target: {habit.target} {habit.schedule === 'daily' ? 'per day' : 'per week'}
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={handleCheckIn}
                        disabled={isChecking}
                        variant={todayChecked ? 'default' : 'outline'}
                        aria-pressed={todayChecked}
                        className="min-w-[120px]"
                    >
                        {isChecking ? (
                            '…'
                        ) : todayChecked ? (
                            <>
                                <Check className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                Done
                            </>
                        ) : (
                            <>
                                <X className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                Check In
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
