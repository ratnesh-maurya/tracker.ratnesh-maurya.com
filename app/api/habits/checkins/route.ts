export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import HabitCheckIn from '@/models/HabitCheckIn';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';

// All of the user's check-ins in one request, instead of one request per habit.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = { userId: auth.userId };
    if (startDate && endDate) {
      query.date = {
        $gte: getStartOfDay(new Date(startDate)),
        $lte: getEndOfDay(new Date(endDate)),
      };
    }

    const checkIns = await HabitCheckIn.find(query).sort({ date: -1 }).select('-__v').lean();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: checkIns,
    });
  } catch (error) {
    console.error('Get all check-ins error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch check-ins' }, { status: 500 });
  }
}
