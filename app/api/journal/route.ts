import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import Journal from '@/models/Journal';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';

const journalSchema = z.object({
  date: z.string().or(z.date()),
  summary: z.string().min(1).max(5000),
  highlights: z.array(z.string()).max(10).optional().default([]),
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

    const [journalEntries, total] = await Promise.all([
      Journal.find(query).sort({ date: -1 }).skip(skip).limit(limit),
      Journal.countDocuments(query),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        entries: journalEntries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + journalEntries.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Get journal entries error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch journal entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = journalSchema.parse(body);

    await connectDB();

    const journalDate = new Date(validatedData.date);
    const startOfDay = getStartOfDay(journalDate);

    // Check if entry exists for this date
    const existingEntry = await Journal.findOne({
      userId: auth.userId,
      date: {
        $gte: startOfDay,
        $lt: getEndOfDay(journalDate),
      },
    });

    if (existingEntry) {
      // Update existing entry
      existingEntry.summary = validatedData.summary;
      existingEntry.highlights = validatedData.highlights;
      await existingEntry.save();

      return NextResponse.json<ApiResponse>({
        success: true,
        data: existingEntry,
        message: 'Journal entry updated successfully',
      });
    }

    const journal = new Journal({
      userId: auth.userId,
      date: startOfDay,
      summary: validatedData.summary,
      highlights: validatedData.highlights,
    });

    await journal.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: journal,
      message: 'Journal entry created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create journal entry error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create journal entry' }, { status: 500 });
  }
}

