import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import Expense from '@/models/Expense';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';

const expenseSchema = z.object({
  date: z.string().or(z.date()),
  amount: z.number().min(0),
  category: z.string().min(1).max(50),
  currency: z.string().length(3).default('USD'),
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
    const category = searchParams.get('category');
    const currency = searchParams.get('currency');
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

    if (category) {
      query.category = category;
    }

    if (currency) {
      query.currency = currency.toUpperCase();
    }

    const [expenses, total] = await Promise.all([
      Expense.find(query).sort({ date: -1 }).skip(skip).limit(limit),
      Expense.countDocuments(query),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        entries: expenses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + expenses.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = expenseSchema.parse(body);

    await connectDB();

    const expenseDate = new Date(validatedData.date);
    const startOfDay = getStartOfDay(expenseDate);

    const expense = new Expense({
      userId: auth.userId,
      date: startOfDay,
      amount: validatedData.amount,
      category: validatedData.category,
      currency: validatedData.currency.toUpperCase(),
      notes: validatedData.notes,
    });

    await expense.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: expense,
      message: 'Expense created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create expense error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create expense' }, { status: 500 });
  }
}

