import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import Habit from '@/models/Habit';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';

const updateHabitSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.enum(['boolean', 'count']).optional(),
  schedule: z.enum(['daily', 'weekly', 'monthly', 'custom']).optional(),
  target: z.number().min(1).optional(),
  habitualType: z.enum(['build', 'quit']).optional(),
  timeRange: z.enum(['anytime', 'morning', 'afternoon', 'evening']).optional(),
  reminders: z.object({
    enabled: z.boolean(),
    times: z.array(z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)),
    message: z.string().max(200).optional(),
  }).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  archived: z.boolean().optional(),
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

    const habit = await Habit.findOne({
      _id: params.id,
      userId: auth.userId,
    });

    if (!habit) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: habit,
    });
  } catch (error) {
    console.error('Get habit error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch habit' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateHabitSchema.parse(body);

    await connectDB();

    const habit = await Habit.findOneAndUpdate(
      { _id: params.id, userId: auth.userId },
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    if (!habit) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: habit,
      message: 'Habit updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Update habit error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to update habit' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const habit = await Habit.findOneAndDelete({
      _id: params.id,
      userId: auth.userId,
    });

    if (!habit) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Habit deleted successfully',
    });
  } catch (error) {
    console.error('Delete habit error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to delete habit' }, { status: 500 });
  }
}

