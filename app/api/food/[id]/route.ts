import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import Food from '@/models/Food';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { getStartOfDay } from '@/lib/utils';

const mealItemSchema = z.object({
  name: z.string().min(1).max(100),
  calories: z.number().min(0).optional(),
});

const updateFoodSchema = z.object({
  date: z.string().or(z.date()).optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  items: z.array(mealItemSchema).optional(),
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
    const validatedData = updateFoodSchema.parse(body);

    await connectDB();

    const updateData: any = {};
    if (validatedData.date !== undefined) {
      const foodDate = new Date(validatedData.date);
      updateData.date = getStartOfDay(foodDate);
    }
    if (validatedData.mealType !== undefined) updateData.mealType = validatedData.mealType;
    if (validatedData.items !== undefined) updateData.items = validatedData.items;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    const food = await Food.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v').lean();

    if (!food) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Food entry not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: food,
      message: 'Food entry updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Update food error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to update food entry' }, { status: 500 });
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

    const food = await Food.findOneAndDelete({
      _id: id,
      userId: auth.userId,
    });

    if (!food) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Food entry not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Food entry deleted successfully',
    });
  } catch (error) {
    console.error('Delete food error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to delete food entry' }, { status: 500 });
  }
}

