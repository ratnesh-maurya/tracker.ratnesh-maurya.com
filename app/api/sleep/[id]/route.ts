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

    // Get existing entry to use as reference for date if needed
    const existing = await Sleep.findById(id);
    if (!existing) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Sleep entry not found' }, { status: 404 });
    }

    const updateData: any = {};
    let sleepDate: Date = existing.date;

    if (validatedData.date !== undefined) {
      sleepDate = typeof validatedData.date === 'string' ? new Date(validatedData.date) : validatedData.date;
      if (isNaN(sleepDate.getTime())) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid date format' }, { status: 400 });
      }
      updateData.date = getStartOfDay(sleepDate);
    }

    if (validatedData.startTime !== undefined) {
      let startTime: Date;
      if (typeof validatedData.startTime === 'string') {
        // If it's just time (HH:mm), combine with date
        if (validatedData.startTime.match(/^\d{2}:\d{2}$/)) {
          const [hours, minutes] = validatedData.startTime.split(':').map(Number);
          startTime = new Date(sleepDate);
          startTime.setHours(hours, minutes, 0, 0);
        } else {
          // Full datetime string
          startTime = new Date(validatedData.startTime);
        }
      } else {
        startTime = validatedData.startTime;
      }
      if (isNaN(startTime.getTime())) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid start time format' }, { status: 400 });
      }
      updateData.startTime = startTime;
    }

    if (validatedData.endTime !== undefined) {
      let endTime: Date;
      if (typeof validatedData.endTime === 'string') {
        // If it's just time (HH:mm), combine with date
        if (validatedData.endTime.match(/^\d{2}:\d{2}$/)) {
          const [hours, minutes] = validatedData.endTime.split(':').map(Number);
          endTime = new Date(sleepDate);
          endTime.setHours(hours, minutes, 0, 0);
          // If end time is earlier than start time, assume it's the next day
          const startTime = updateData.startTime || existing.startTime;
          if (endTime < startTime) {
            endTime.setDate(endTime.getDate() + 1);
          }
        } else {
          // Full datetime string
          endTime = new Date(validatedData.endTime);
        }
      } else {
        endTime = validatedData.endTime;
      }
      if (isNaN(endTime.getTime())) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid end time format' }, { status: 400 });
      }
      updateData.endTime = endTime;
    }

    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    // Recalculate duration if times changed
    if (updateData.startTime && updateData.endTime) {
      const diffMs = updateData.endTime.getTime() - updateData.startTime.getTime();
      if (diffMs < 0) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'End time must be after start time' }, { status: 400 });
      }
      updateData.duration = Math.round(diffMs / (1000 * 60));
    } else if (updateData.startTime || updateData.endTime) {
      // Need to get existing entry to calculate duration
      const startTime = updateData.startTime || existing.startTime;
      const endTime = updateData.endTime || existing.endTime;
      const diffMs = endTime.getTime() - startTime.getTime();
      if (diffMs < 0) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'End time must be after start time' }, { status: 400 });
      }
      updateData.duration = Math.round(diffMs / (1000 * 60));
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

