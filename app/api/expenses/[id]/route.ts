import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import Expense from '@/models/Expense';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { getStartOfDay } from '@/lib/utils';

const updateExpenseSchema = z.object({
  date: z.string().or(z.date()).optional(),
  amount: z.number().min(0).optional(),
  category: z.string().min(1).max(50).optional(),
  currency: z.string().length(3).optional(),
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
    const validatedData = updateExpenseSchema.parse(body);

    await connectDB();

    const updateData: any = {};
    if (validatedData.date !== undefined) {
      const expenseDate = new Date(validatedData.date);
      updateData.date = getStartOfDay(expenseDate);
    }
    if (validatedData.amount !== undefined) updateData.amount = validatedData.amount;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.currency !== undefined) updateData.currency = validatedData.currency.toUpperCase();
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v').lean();

    if (!expense) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: expense,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Update expense error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to update expense' }, { status: 500 });
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

    const expense = await Expense.findOneAndDelete({
      _id: id,
      userId: auth.userId,
    });

    if (!expense) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to delete expense' }, { status: 500 });
  }
}

