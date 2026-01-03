import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import Sleep from '@/models/Sleep';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';

const updateSleepSchema = z.object({
  date: z.string().or(z.date()).optional(),
  startTime: z.string().or(z.date()).optional(),
  endTime: z.string().or(z.date()).optional(),
  notes: z.string().max(500).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateSleepSchema.parse(body);

    await connectDB();

    const updateData: any = {};
    if (validatedData.date !== undefined) {
      const sleepDate = new Date(validatedData.date);
      updateData.date = getStartOfDay(sleepDate);
    }
    if (validatedData.startTime !== undefined) {
      updateData.startTime = new Date(validatedData.startTime);
    }
    if (validatedData.endTime !== undefined) {
      updateData.endTime = new Date(validatedData.endTime);
    }
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    // Recalculate duration if times changed
    if (updateData.startTime && updateData.endTime) {
      const diffMs = updateData.endTime.getTime() - updateData.startTime.getTime();
      updateData.duration = Math.round(diffMs / (1000 * 60));
    } else if (updateData.startTime || updateData.endTime) {
      // Need to get existing entry to calculate duration
      const existing = await Sleep.findById(id);
      if (existing) {
        const startTime = updateData.startTime || existing.startTime;
        const endTime = updateData.endTime || existing.endTime;
        const diffMs = endTime.getTime() - startTime.getTime();
        updateData.duration = Math.round(diffMs / (1000 * 60));
      }
    }

    const sleep = await Sleep.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v').lean();

    if (!sleep) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Sleep entry not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: sleep,
      message: 'Sleep entry updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Update sleep error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to update sleep entry' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const sleep = await Sleep.findOneAndDelete({
      _id: id,
      userId: auth.userId,
    });

    if (!sleep) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Sleep entry not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Sleep entry deleted successfully',
    });
  } catch (error) {
    console.error('Delete sleep error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to delete sleep entry' }, { status: 500 });
  }
}

