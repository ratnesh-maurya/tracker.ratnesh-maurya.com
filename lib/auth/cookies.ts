import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken } from './jwt';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export function setAuthCookies(
  response: NextResponse,
  userId: string,
  email: string,
  rememberMe: boolean = false
): void {
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken(userId, email);

  const maxAge = 30 * 24 * 60 * 60; // 30 days

  response.cookies.set('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  response.cookies.set('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60, // Always 30 days for refresh token
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set('accessToken', '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  response.cookies.set('refreshToken', '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get('accessToken')?.value || null;
}

export function getRefreshTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get('refreshToken')?.value || null;
}

