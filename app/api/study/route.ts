import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import Study from '@/models/Study';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';

const studySchema = z.object({
  date: z.string().or(z.date()),
  topic: z.string().min(1).max(200),
  timeSpent: z.number().min(1),
  tags: z.array(z.string()).max(10).optional().default([]),
  projectReference: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
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
    const tag = searchParams.get('tag');
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

    if (tag) {
      query.tags = tag;
    }

    const [studyEntries, total] = await Promise.all([
      Study.find(query).sort({ date: -1 }).skip(skip).limit(limit),
      Study.countDocuments(query),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        entries: studyEntries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + studyEntries.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Get study entries error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch study entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = studySchema.parse(body);

    await connectDB();

    const studyDate = new Date(validatedData.date);
    const startOfDay = getStartOfDay(studyDate);

    const study = new Study({
      userId: auth.userId,
      date: startOfDay,
      topic: validatedData.topic,
      timeSpent: validatedData.timeSpent,
      tags: validatedData.tags,
      projectReference: validatedData.projectReference,
      notes: validatedData.notes,
    });

    await study.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: study,
      message: 'Study entry created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create study entry error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create study entry' }, { status: 500 });
  }
}

