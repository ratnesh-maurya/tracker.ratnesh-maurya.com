import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse, DateRange } from '@/types';
import {
  getHabitAnalytics,
  getSleepAnalytics,
  getStudyAnalytics,
  getExpenseAnalytics,
  getFoodAnalytics,
} from '@/lib/analytics/aggregations';

const querySchema = z.object({
  range: z.enum(['daily', 'weekly', 'mtd', 'ytd', 'custom']).default('daily'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') || 'daily') as DateRange;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const validatedData = querySchema.parse({
      range,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    const customStart = validatedData.startDate ? new Date(validatedData.startDate) : undefined;
    const customEnd = validatedData.endDate ? new Date(validatedData.endDate) : undefined;

    const [habits, sleep, study, expenses, food] = await Promise.all([
      getHabitAnalytics(auth.userId, validatedData.range, customStart, customEnd),
      getSleepAnalytics(auth.userId, validatedData.range, customStart, customEnd),
      getStudyAnalytics(auth.userId, validatedData.range, customStart, customEnd),
      getExpenseAnalytics(auth.userId, validatedData.range, customStart, customEnd),
      getFoodAnalytics(auth.userId, validatedData.range, customStart, customEnd),
    ]);

    const { getDateRange } = await import('@/lib/utils');
    const { start, end } = getDateRange(validatedData.range, customStart, customEnd);

    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        dateRange: validatedData.range,
        startDate: start,
        endDate: end,
        habits,
        sleep,
        study,
        expenses,
        food,
      },
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Get analytics error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

