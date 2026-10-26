import { HabitCheckIn } from '@/types';
import { handleApiResponse } from '@/lib/api/client';
import { getStartOfDay } from '@/lib/utils';

export interface HabitCheckIns {
    habitId: string;
    checkIns: HabitCheckIn[];
}

// Fetches every check-in in one request and groups them per habit, in the
// order of `habits`. Pass `day` to limit to a single day.
export async function fetchCheckInsByHabit(habits: { _id: string }[], day?: Date): Promise<HabitCheckIns[]> {
    const params = day ? `?startDate=${day.toISOString()}&endDate=${day.toISOString()}` : '';
    const res = await fetch(`/api/habits/checkins${params}`, { cache: 'no-store' });
    const all = await handleApiResponse<HabitCheckIn[]>(res);

    const byHabit = new Map<string, HabitCheckIn[]>();
    for (const checkIn of all) {
        const id = String(checkIn.habitId);
        const list = byHabit.get(id);
        if (list) list.push(checkIn);
        else byHabit.set(id, [checkIn]);
    }

    return habits.map((habit) => ({ habitId: habit._id, checkIns: byHabit.get(habit._id) ?? [] }));
}

// Returns `groups` with the habit's check-in for `date`'s day set to `value`,
// replacing that day's existing one. Used to show a tap instantly, before the
// server (or the offline queue) confirms it.
export function applyCheckIn(groups: HabitCheckIns[], habitId: string, date: string, value: boolean | number): HabitCheckIns[] {
    const day = getStartOfDay(new Date(date)).getTime();
    return groups.map((group) => {
        if (group.habitId !== habitId) return group;
        const others = group.checkIns.filter((c) => getStartOfDay(new Date(c.date)).getTime() !== day);
        const pending = {
            _id: `local-${habitId}-${day}`,
            habitId,
            userId: '',
            date: new Date(day),
            value,
            createdAt: new Date(),
        };
        return { ...group, checkIns: [pending, ...others] };
    });
}
