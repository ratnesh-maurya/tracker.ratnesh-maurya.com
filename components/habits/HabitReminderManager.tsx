'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Habit } from '@/types';
import { requestNotificationPermission, startReminderChecker } from '@/lib/notifications/habit-reminders';

export function HabitReminderManager() {
    const cleanupRef = useRef<(() => void) | null>(null);

    const { data: habits } = useQuery<Habit[]>({
        queryKey: ['habits'],
        queryFn: async () => {
            const res = await fetch('/api/habits', { cache: 'no-store' });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        if (!habits || habits.length === 0) return;

        // Request notification permission on mount
        requestNotificationPermission().then((granted) => {
            if (granted && habits) {
                // Start checking for reminders
                const cleanup = startReminderChecker(habits);
                cleanupRef.current = cleanup;
            }
        });

        // Cleanup on unmount
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, [habits]);

    // Restart checker when habits change
    useEffect(() => {
        if (!habits || habits.length === 0) return;

        // Cleanup previous checker
        if (cleanupRef.current) {
            cleanupRef.current();
        }

        // Start new checker with updated habits
        if (Notification.permission === 'granted') {
            const cleanup = startReminderChecker(habits);
            cleanupRef.current = cleanup;
        }

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, [habits]);

    return null; // This component doesn't render anything
}

