import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import Study from '@/models/Study';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { getStartOfDay } from '@/lib/utils';

const updateStudySchema = z.object({
  date: z.string().or(z.date()).optional(),
  topic: z.string().min(1).max(200).optional(),
  timeSpent: z.number().min(1).optional(),
  tags: z.array(z.string()).max(10).optional(),
  projectReference: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
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
    const validatedData = updateStudySchema.parse(body);

    await connectDB();

    const updateData: any = {};
    if (validatedData.date !== undefined) {
      const studyDate = new Date(validatedData.date);
      updateData.date = getStartOfDay(studyDate);
    }
    if (validatedData.topic !== undefined) updateData.topic = validatedData.topic;
    if (validatedData.timeSpent !== undefined) updateData.timeSpent = validatedData.timeSpent;
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags;
    if (validatedData.projectReference !== undefined) updateData.projectReference = validatedData.projectReference;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    const study = await Study.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v').lean();

    if (!study) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Study entry not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: study,
      message: 'Study entry updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Update study error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to update study entry' }, { status: 500 });
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

    const study = await Study.findOneAndDelete({
      _id: id,
      userId: auth.userId,
    });

    if (!study) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Study entry not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Study entry deleted successfully',
    });
  } catch (error) {
    console.error('Delete study error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to delete study entry' }, { status: 500 });
  }
}

