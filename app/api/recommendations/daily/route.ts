import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { getFoodRecommendations } from '@/lib/recommendations/food';

const querySchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const mealType = searchParams.get('mealType') as 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;

    if (mealType) {
      // Single meal recommendation
      const recommendation = await getFoodRecommendations(auth.userId, mealType);
      return NextResponse.json<ApiResponse>({
        success: true,
        data: recommendation,
      });
    }

    // All meal recommendations
    const [breakfast, lunch, dinner, snack] = await Promise.all([
      getFoodRecommendations(auth.userId, 'breakfast'),
      getFoodRecommendations(auth.userId, 'lunch'),
      getFoodRecommendations(auth.userId, 'dinner'),
      getFoodRecommendations(auth.userId, 'snack'),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        breakfast,
        lunch,
        dinner,
        snack,
      },
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

