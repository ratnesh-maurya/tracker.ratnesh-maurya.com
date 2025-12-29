'use client';

import { Habit } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Edit, Trash2, Flame } from 'lucide-react';
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
        <Card className="hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: habit.color || '#3B82F6' }}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                        {habit.icon && (
                            <div className="text-3xl">{habit.icon}</div>
                        )}
                        <div className="flex-1">
                            <CardTitle className="text-xl mb-1">{habit.title}</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                                    {habit.schedule}
                                </span>
                                {streak > 0 && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600 flex items-center gap-1">
                                        <Flame className="h-3 w-3" />
                                        {streak} day streak
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(habit)}
                            className="h-8 w-8"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(habit._id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        {habit.type === 'count' && habit.target && (
                            <p className="text-sm text-gray-600">
                                Target: {habit.target} {habit.schedule === 'daily' ? 'per day' : 'per week'}
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={handleCheckIn}
                        disabled={isChecking}
                        size="lg"
                        className={`min-w-[120px] ${todayChecked
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                    >
                        {isChecking ? (
                            '...'
                        ) : todayChecked ? (
                            <>
                                <Check className="h-5 w-5 mr-2" />
                                Done
                            </>
                        ) : (
                            <>
                                <X className="h-5 w-5 mr-2" />
                                Check In
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
