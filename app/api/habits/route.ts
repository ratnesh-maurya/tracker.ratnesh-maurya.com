import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import Habit from '@/models/Habit';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';

const habitSchema = z.object({
  title: z.string().min(1).max(100),
  type: z.enum(['boolean', 'count']),
  schedule: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  target: z.number().min(1).optional(),
  reminders: z.object({
    enabled: z.boolean(),
    times: z.array(z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)),
  }).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const archived = searchParams.get('archived') === 'true';

    const habits = await Habit.find({
      userId: auth.userId,
      archived,
    }).sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: habits,
    });
  } catch (error) {
    console.error('Get habits error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = habitSchema.parse(body);

    await connectDB();

    const habit = new Habit({
      ...validatedData,
      userId: auth.userId,
    });

    await habit.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: habit,
      message: 'Habit created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create habit error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create habit' }, { status: 500 });
  }
}

