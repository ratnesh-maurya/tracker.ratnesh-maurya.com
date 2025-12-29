import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { setAuthCookies } from '@/lib/auth/cookies';
import { ApiResponse } from '@/types';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username cannot exceed 30 characters'),
  name: z.string().max(100, 'Name cannot exceed 100 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.email.toLowerCase() },
        { username: validatedData.username },
      ],
    });

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: existingUser.email === validatedData.email.toLowerCase()
          ? 'Email already registered'
          : 'Username already taken',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Create new user
    const user = new User({
      email: validatedData.email.toLowerCase(),
      username: validatedData.username,
      name: validatedData.name || undefined,
      password: validatedData.password,
    });

    await user.save();

    // Set auth cookies
    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
      },
      message: 'Registration successful',
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

    console.error('Registration error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Registration failed. Please try again.',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

