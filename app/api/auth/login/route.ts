import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { setAuthCookies } from '@/lib/auth/cookies';
import { ApiResponse } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: validatedData.email.toLowerCase() }).select('+password');

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid email or password',
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(validatedData.password);

    if (!isPasswordValid) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid email or password',
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Set auth cookies
    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
      },
      message: 'Login successful',
    });

    setAuthCookies(response, user._id.toString(), user.email, validatedData.rememberMe);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ApiResponse = {
        success: false,
        error: error.errors[0].message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    console.error('Login error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Login failed. Please try again.',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

