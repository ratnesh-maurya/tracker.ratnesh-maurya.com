import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from './jwt';
import { generateAccessToken } from './jwt';
import { setAuthCookies } from './cookies';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';

export async function requireAuth(request: NextRequest): Promise<{ userId: string; email: string; newAccessToken?: string } | null> {
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const payload = verifyAccessToken(accessToken);
    return { userId: payload.userId, email: payload.email };
  } catch (error) {
    // Try to refresh
    const refreshToken = request.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
      return null;
    }

    try {
      const refreshPayload = verifyRefreshToken(refreshToken);
      await connectDB();
      const user = await User.findById(refreshPayload.userId);
      
      if (!user) {
        return null;
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(user._id.toString(), user.email);
      
      // Return user info and new token (caller should set cookie)
      return { 
        userId: user._id.toString(), 
        email: user.email,
        newAccessToken 
      };
    } catch (refreshError) {
      return null;
    }
  }
}

export function createAuthResponse(
  data: any,
  status: number = 200,
  newAccessToken?: string
): NextResponse {
  const response = NextResponse.json(data, { status });
  
  if (newAccessToken) {
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }
  
  return response;
}

