'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ProgressCircle } from '@/components/ui/progress-circle';

interface DailyGoalsCardProps {
    completed: number;
    total: number;
}

export function DailyGoalsCard({ completed, total }: DailyGoalsCardProps) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const emoji = percentage >= 100 ? '🎉' : percentage >= 75 ? '🔥' : percentage >= 50 ? '💪' : '🌱';

    return (
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-lg">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <ProgressCircle percentage={percentage} size={70} strokeWidth={6} />
                    <div className="flex-1 text-white">
                        <p className="text-sm opacity-90 mb-1">
                            {percentage.toFixed(0)}% Your daily goals {percentage >= 75 ? 'almost done' : 'in progress'}! {emoji}
                        </p>
                        <p className="text-lg font-bold">
                            {completed} of {total} completed
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

