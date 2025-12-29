import { HabitCheckIn } from '@/types';
import { getStartOfDay } from '@/lib/utils';

export function calculateStreak(checkIns: HabitCheckIn[]): number {
  if (checkIns.length === 0) return 0;

  // Sort check-ins by date (newest first)
  const sorted = [...checkIns].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  // Filter to only completed check-ins
  const completed = sorted.filter((checkIn) => {
    if (typeof checkIn.value === 'boolean') {
      return checkIn.value === true;
    }
    return checkIn.value > 0;
  });

  if (completed.length === 0) return 0;

  let streak = 0;
  const today = getStartOfDay(new Date());
  let currentDate = getStartOfDay(new Date(completed[0].date));

  // Check if the most recent check-in is today or yesterday
  const daysDiff = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) {
    // If the most recent check-in is more than 1 day ago, streak is broken
    return 0;
  }

  // Count consecutive days
  for (let i = 0; i < completed.length; i++) {
    const checkInDate = getStartOfDay(new Date(completed[i].date));
    const expectedDate = getStartOfDay(new Date(currentDate));
    expectedDate.setDate(expectedDate.getDate() - i);

    if (checkInDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      // Gap found, streak is broken
      break;
    }
  }

  return streak;
}

