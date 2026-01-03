import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import HabitCheckIn from '@/models/HabitCheckIn';
import Sleep from '@/models/Sleep';
import Study from '@/models/Study';
import { ApiResponse } from '@/types';
import {
  getHabitAnalytics,
  getSleepAnalytics,
  getStudyAnalytics,
  getExpenseAnalytics,
  getFoodAnalytics,
} from '@/lib/analytics/aggregations';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';
import { format } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    await connectDB();

    const user = await User.findOne({ username }).select('-password -email').lean();

    if (!user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!user.profilePublic) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Profile is private' }, { status: 403 });
    }

    // Prepare date range for calendar (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const startDate = getStartOfDay(threeMonthsAgo);
    const endDate = getEndOfDay(new Date());

    // Run all queries in parallel for maximum performance
    const [habits, sleep, study, expenses, food, habitCheckIns, sleepEntries, studyEntries] = await Promise.all([
      getHabitAnalytics(user._id.toString(), 'ytd'),
      getSleepAnalytics(user._id.toString(), 'ytd'),
      getStudyAnalytics(user._id.toString(), 'ytd'),
      getExpenseAnalytics(user._id.toString(), 'ytd'),
      getFoodAnalytics(user._id.toString(), 'ytd'),
      // Calendar data - optimized queries with minimal fields
      HabitCheckIn.find({
        userId: user._id,
        date: { $gte: startDate, $lte: endDate },
      })
        .select('date')
        .lean(),
      Sleep.find({
        userId: user._id,
        date: { $gte: startDate, $lte: endDate },
      })
        .select('date duration startTime')
        .lean(),
      Study.find({
        userId: user._id,
        date: { $gte: startDate, $lte: endDate },
      })
        .select('date timeSpent')
        .lean(),
    ]);

    // Get expense breakdown
    const expenseBreakdown = expenses.byCategory || {};

    // Calculate additional stats
    const totalStudyHours = study.totalHours || 0;
    const averageSleepHours = sleep.averageDuration ? Math.round(sleep.averageDuration / 60 * 10) / 10 : 0;
    const totalExpenses = expenses.total || 0;
    const totalMeals = food.totalMeals || 0;

    // Group activities by date - optimized processing
    const activitiesMap = new Map<string, {
      habits: number;
      sleep?: { hours: number; startTime?: string };
      study?: { hours: number; sessions: number };
    }>();

    // Process habit check-ins - batch process
    for (const checkIn of habitCheckIns) {
      const dateStr = format(new Date(checkIn.date), 'yyyy-MM-dd');
      const existing = activitiesMap.get(dateStr) || { habits: 0 };
      existing.habits += 1;
      activitiesMap.set(dateStr, existing);
    }

    // Process sleep entries
    for (const entry of sleepEntries) {
      const dateStr = format(new Date(entry.date), 'yyyy-MM-dd');
      const existing = activitiesMap.get(dateStr) || { habits: 0 };
      const hours = (entry.duration || 0) / 60;
      existing.sleep = {
        hours: Math.round(hours * 10) / 10,
        startTime: entry.startTime ? format(new Date(entry.startTime), 'HH:mm') : undefined,
      };
      activitiesMap.set(dateStr, existing);
    }

    // Process study entries
    for (const entry of studyEntries) {
      const dateStr = format(new Date(entry.date), 'yyyy-MM-dd');
      const existing = activitiesMap.get(dateStr) || { habits: 0 };
      const hours = (entry.timeSpent || 0) / 60;
      if (existing.study) {
        existing.study.hours += hours;
        existing.study.sessions += 1;
      } else {
        existing.study = {
          hours: Math.round(hours * 10) / 10,
          sessions: 1,
        };
      }
      activitiesMap.set(dateStr, existing);
    }

    // Convert to array format
    const dailyActivities = Array.from(activitiesMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    // Calculate streak days - optimized algorithm
    const sortedDates = Array.from(activitiesMap.keys())
      .filter(date => activitiesMap.get(date)!.habits > 0)
      .sort()
      .reverse();

    const streakDates = new Set<string>();
    if (sortedDates.length > 0) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      
      // Check if today or yesterday has activity
      if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
        let lastDate = sortedDates[0];
        streakDates.add(lastDate);

        for (let i = 1; i < sortedDates.length; i++) {
          const currentDate = new Date(sortedDates[i]);
          const lastDateObj = new Date(lastDate);
          const diffDays = Math.floor((lastDateObj.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            streakDates.add(sortedDates[i]);
            lastDate = sortedDates[i];
          } else {
            break;
          }
        }
      }
    }

    // Mark streak days in activities
    for (const activity of dailyActivities) {
      if (streakDates.has(activity.date)) {
        (activity as any).streak = true;
      }
    }

    const stats = {
      username: user.username,
      name: user.name || user.username,
      profilePublic: user.profilePublic,
      createdAt: user.createdAt,
      stats: {
        habits: {
          totalHabits: habits.totalHabits || 0,
          completionRate: Math.round(habits.completionRate || 0),
          activeStreaks: habits.activeStreaks || 0,
        },
        sleep: {
          totalDays: sleep.totalDays || 0,
          averageHours: averageSleepHours,
        },
        study: {
          totalHours: totalStudyHours,
          totalSessions: study.totalSessions || 0,
        },
        expenses: {
          total: totalExpenses,
          currency: expenses.currency || 'INR',
          byCategory: expenseBreakdown,
        },
        food: {
          totalMeals,
        },
      },
      dailyActivities,
    };

    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: stats,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  } catch (error) {
    console.error('Get public profile error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}
