import { NextRequest, NextResponse } from 'next/server';
import { getRefreshTokenFromRequest } from '@/lib/auth/cookies';
import { verifyRefreshToken } from '@/lib/auth/jwt';
import { generateAccessToken } from '@/lib/auth/jwt';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshTokenFromRequest(request);

    if (!refreshToken) {
      const response: ApiResponse = {
        success: false,
        error: 'No refresh token provided',
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    await connectDB();

    // Verify user still exists
    const user = await User.findById(payload.userId);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id.toString(), user.email);

    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: 'Token refreshed successfully',
    });

    // Set new access token
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    return response;
  } catch (error: any) {
    console.error('Refresh token error:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Token refresh failed',
    };
    return NextResponse.json(response, { status: 401 });
  }
}

