export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import Food from '@/models/Food';
import { requireAuth } from '@/lib/auth/middleware';
import { clientIdSchema, saveOnce } from '@/lib/api/idempotent';
import { ApiResponse } from '@/types';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';

const mealItemSchema = z.object({
  name: z.string().min(1).max(100),
  calories: z.number().min(0).optional(),
});

const foodSchema = z.object({
  date: z.string().or(z.date()),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  items: z.array(mealItemSchema).min(1),
  notes: z.string().max(500).optional(),
  clientId: clientIdSchema,
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
    const mealType = searchParams.get('mealType');
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

    if (mealType) {
      query.mealType = mealType;
    }

    const [foodEntries, total] = await Promise.all([
      Food.find(query).select('-__v').sort({ date: -1, mealType: 1 }).skip(skip).limit(limit).lean(),
      Food.countDocuments(query),
    ]);

    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        entries: foodEntries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + foodEntries.length < total,
        },
      },
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    return response;
  } catch (error) {
    console.error('Get food entries error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch food entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = foodSchema.parse(body);

    await connectDB();

    // Parse date string as local date to avoid timezone issues
    const foodDate = typeof validatedData.date === 'string' 
      ? validatedData.date 
      : validatedData.date.toISOString().split('T')[0];
    const startOfDay = getStartOfDay(foodDate);

    const food = new Food({
      userId: auth.userId,
      clientId: validatedData.clientId,
      date: startOfDay,
      mealType: validatedData.mealType,
      items: validatedData.items,
      notes: validatedData.notes,
    });

    const { doc, created } = await saveOnce(Food, food, auth.userId, validatedData.clientId);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: doc,
      message: created ? 'Food entry created successfully' : 'Food entry already saved',
    }, { status: created ? 201 : 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create food entry error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create food entry' }, { status: 500 });
  }
}

