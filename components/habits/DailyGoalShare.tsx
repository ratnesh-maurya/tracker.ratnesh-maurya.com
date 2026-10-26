'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { shareAchievement } from '@/lib/social/share';
import { getStartOfDay } from '@/lib/utils';
import { fetchCheckInsByHabit } from '@/lib/habits/checkins';

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
        queryFn: () => fetchCheckInsByHabit(habitsData ?? [], today),
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
        <div className="fixed bottom-24 lg:bottom-6 right-4 z-40">
            <Button onClick={handleShare} className="shadow-float">
                <span className="h-[7px] w-[7px] rounded-full bg-ok" aria-hidden />
                Share today ↗
            </Button>
        </div>
    );
}

