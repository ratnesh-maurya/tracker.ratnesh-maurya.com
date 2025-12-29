import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import HabitCheckIn from '@/models/HabitCheckIn';
import Habit from '@/models/Habit';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';

const checkInSchema = z.object({
  date: z.string().or(z.date()),
  value: z.union([z.number(), z.boolean()]),
  notes: z.string().max(500).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = {
      habitId: params.id,
      userId: auth.userId,
    };

    if (startDate && endDate) {
      query.date = {
        $gte: getStartOfDay(new Date(startDate)),
        $lte: getEndOfDay(new Date(endDate)),
      };
    }

    const checkIns = await HabitCheckIn.find(query).sort({ date: -1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: checkIns,
    });
  } catch (error) {
    console.error('Get check-ins error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch check-ins' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = checkInSchema.parse(body);

    await connectDB();

    // Verify habit exists and belongs to user
    const habit = await Habit.findOne({
      _id: params.id,
      userId: auth.userId,
    });

    if (!habit) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Habit not found' }, { status: 404 });
    }

    const checkInDate = new Date(validatedData.date);
    const startOfDay = getStartOfDay(checkInDate);

    // Check if check-in already exists for this date
    const existingCheckIn = await HabitCheckIn.findOne({
      habitId: params.id,
      userId: auth.userId,
      date: {
        $gte: startOfDay,
        $lt: getEndOfDay(checkInDate),
      },
    });

    if (existingCheckIn) {
      // Update existing check-in
      existingCheckIn.value = validatedData.value;
      if (validatedData.notes !== undefined) {
        existingCheckIn.notes = validatedData.notes;
      }
      await existingCheckIn.save();

      return NextResponse.json<ApiResponse>({
        success: true,
        data: existingCheckIn,
        message: 'Check-in updated successfully',
      });
    }

    // Create new check-in
    const checkIn = new HabitCheckIn({
      habitId: params.id,
      userId: auth.userId,
      date: startOfDay,
      value: validatedData.value,
      notes: validatedData.notes,
    });

    await checkIn.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: checkIn,
      message: 'Check-in created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create check-in error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create check-in' }, { status: 500 });
  }
}

