import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import Journal from '@/models/Journal';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { getStartOfDay } from '@/lib/utils';

const updateJournalSchema = z.object({
  date: z.string().or(z.date()).optional(),
  summary: z.string().min(1).max(5000).optional(),
  highlights: z.array(z.string()).max(10).optional(),
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
    const validatedData = updateJournalSchema.parse(body);

    await connectDB();

    const updateData: any = {};
    if (validatedData.date !== undefined) {
      const journalDate = new Date(validatedData.date);
      updateData.date = getStartOfDay(journalDate);
    }
    if (validatedData.summary !== undefined) updateData.summary = validatedData.summary;
    if (validatedData.highlights !== undefined) updateData.highlights = validatedData.highlights;

    const journal = await Journal.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v').lean();

    if (!journal) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Journal entry not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: journal,
      message: 'Journal entry updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Update journal error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to update journal entry' }, { status: 500 });
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

    const journal = await Journal.findOneAndDelete({
      _id: id,
      userId: auth.userId,
    });

    if (!journal) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Journal entry not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Journal entry deleted successfully',
    });
  } catch (error) {
    console.error('Delete journal error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to delete journal entry' }, { status: 500 });
  }
}

