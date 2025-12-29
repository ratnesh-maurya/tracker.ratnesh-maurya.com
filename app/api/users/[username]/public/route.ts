import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    await connectDB();

    const user = await User.findOne({ username: params.username }).select('-password -email');

    if (!user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!user.profilePublic) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Profile is private' }, { status: 403 });
    }

    // Get safe aggregated stats
    const stats = {
      username: user.username,
      profilePublic: user.profilePublic,
      // Add more safe stats here as needed
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}

