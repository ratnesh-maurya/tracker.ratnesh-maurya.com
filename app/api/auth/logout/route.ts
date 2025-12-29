import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth/cookies';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  const response = NextResponse.json<ApiResponse>({
    success: true,
    message: 'Logged out successfully',
  });

  clearAuthCookies(response);

  return response;
}

