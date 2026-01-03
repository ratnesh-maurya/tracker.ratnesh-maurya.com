import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import Sleep from '@/models/Sleep';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';

const sleepSchema = z.object({
  date: z.string().or(z.date()),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()),
  notes: z.string().max(500).optional(),
});

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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const query: any = { userId: auth.userId };

    if (startDate && endDate) {
      query.date = {
        $gte: getStartOfDay(new Date(startDate)),
        $lte: getEndOfDay(new Date(endDate)),
      };
    }

    const [sleepEntries, total] = await Promise.all([
      Sleep.find(query).select('-__v').sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Sleep.countDocuments(query),
    ]);

    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        entries: sleepEntries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + sleepEntries.length < total,
        },
      },
    });

    // Cache for 30 seconds
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    return response;
  } catch (error) {
    console.error('Get sleep entries error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch sleep entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = sleepSchema.parse(body);

    await connectDB();

    // Parse date
    const sleepDate = typeof validatedData.date === 'string' ? new Date(validatedData.date) : validatedData.date;
    if (isNaN(sleepDate.getTime())) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid date format' }, { status: 400 });
    }

    // Parse startTime and endTime - they might be strings (HH:mm) or full datetime strings
    let startTime: Date;
    let endTime: Date;

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

    if (typeof validatedData.endTime === 'string') {
      // If it's just time (HH:mm), combine with date
      if (validatedData.endTime.match(/^\d{2}:\d{2}$/)) {
        const [hours, minutes] = validatedData.endTime.split(':').map(Number);
        endTime = new Date(sleepDate);
        endTime.setHours(hours, minutes, 0, 0);
        // If end time is earlier than start time, assume it's the next day
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

    // Validate dates
    if (isNaN(startTime.getTime())) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid start time format' }, { status: 400 });
    }
    if (isNaN(endTime.getTime())) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid end time format' }, { status: 400 });
    }

    // Check if entry exists for this date
    const startOfDay = getStartOfDay(sleepDate);
    const existingEntry = await Sleep.findOne({
      userId: auth.userId,
      date: {
        $gte: startOfDay,
        $lt: getEndOfDay(sleepDate),
      },
    });

    // Calculate duration in minutes
    const diffMs = endTime.getTime() - startTime.getTime();
    if (diffMs < 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'End time must be after start time' }, { status: 400 });
    }
    const duration = Math.round(diffMs / (1000 * 60)); // Convert to minutes

    if (existingEntry) {
      // Update existing entry
      existingEntry.startTime = startTime;
      existingEntry.endTime = endTime;
      existingEntry.duration = duration;
      if (validatedData.notes !== undefined) {
        existingEntry.notes = validatedData.notes;
      }
      await existingEntry.save();

      return NextResponse.json<ApiResponse>({
        success: true,
        data: existingEntry,
        message: 'Sleep entry updated successfully',
      });
    }

    const sleep = new Sleep({
      userId: auth.userId,
      date: startOfDay,
      startTime,
      endTime,
      duration,
      notes: validatedData.notes,
    });

    await sleep.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: sleep,
      message: 'Sleep entry created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create sleep entry error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create sleep entry' }, { status: 500 });
  }
}

