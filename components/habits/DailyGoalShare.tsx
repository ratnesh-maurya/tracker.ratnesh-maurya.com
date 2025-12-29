'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Share2, CheckCircle2 } from 'lucide-react';
import { shareAchievement } from '@/lib/social/share';
import { getStartOfDay } from '@/lib/utils';

export function DailyGoalShare() {
    const [allCompleted, setAllCompleted] = useState(false);
    const today = getStartOfDay(new Date());

    const { data: habitsData } = useQuery({
        queryKey: ['habits'],
        queryFn: async () => {
            const res = await fetch('/api/habits');
            const data = await res.json();
            return data.success ? data.data : [];
        },
    });

    const { data: checkInsData } = useQuery({
        queryKey: ['checkins', 'today'],
        queryFn: async () => {
            if (!habitsData) return [];
            const checkIns = await Promise.all(
                habitsData.map(async (habit: any) => {
                    const res = await fetch(`/api/habits/${habit._id}/checkins?startDate=${today.toISOString()}&endDate=${today.toISOString()}`);
                    const data = await res.json();
                    return { habitId: habit._id, checkIns: data.success ? data.data : [] };
                })
            );
            return checkIns;
        },
        enabled: !!habitsData,
    });

    useEffect(() => {
        if (habitsData && checkInsData) {
            const activeHabits = habitsData.filter((h: any) => !h.archived);
            const completedCount = checkInsData.filter((c: any) => c.checkIns.length > 0).length;
            setAllCompleted(activeHabits.length > 0 && completedCount === activeHabits.length);
        }
    }, [habitsData, checkInsData]);

    const handleShare = async () => {
        await shareAchievement({
            type: 'daily-goal',
            title: 'Daily Goal Completed',
            description: `Completed all ${habitsData?.length || 0} habits today!`,
        });
    };

    if (!allCompleted) {
        return null;
    }

    return (
        <div className="fixed bottom-24 md:bottom-20 right-4 z-40">
            <Button
                onClick={handleShare}
                className="bg-green-500 hover:bg-green-600 text-white shadow-lg flex items-center gap-2"
            >
                <CheckCircle2 className="h-4 w-4" />
                <Share2 className="h-4 w-4" />
                Share Goal
            </Button>
        </div>
    );
}

