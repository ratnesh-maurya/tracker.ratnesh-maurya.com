import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { z } from 'zod';

const updateUserSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  name: z.union([
    z.string().max(100, 'Name cannot exceed 100 characters'),
    z.literal(''),
    z.null()
  ]).optional(),
  phone: z.union([
    z.string().regex(/^[+]?[0-9]{10,15}$/, 'Please provide a valid phone number (10-15 digits)'),
    z.literal(''),
    z.null()
  ]).optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  profilePublic: z.boolean().optional(),
  sounds: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(auth.userId).select('-password');

    if (!user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Convert to plain object to ensure all fields are included
    const userObj = user.toObject ? user.toObject() : user;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: userObj,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received update request:', body);
    
    const validatedData = updateUserSchema.parse(body);
    console.log('Validated data:', validatedData);

    // Build update object - include all provided fields
    const updateData: any = {};
    
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name === null || validatedData.name === '' 
        ? null 
        : String(validatedData.name).trim();
    }
    
    if (validatedData.phone !== undefined) {
      updateData.phone = validatedData.phone === null || validatedData.phone === '' 
        ? null 
        : String(validatedData.phone).trim();
    }
    
    if (validatedData.username !== undefined) updateData.username = validatedData.username;
    if (validatedData.dietaryPreferences !== undefined) updateData.dietaryPreferences = validatedData.dietaryPreferences;
    if (validatedData.profilePublic !== undefined) updateData.profilePublic = validatedData.profilePublic;
    if (validatedData.sounds !== undefined) updateData.sounds = validatedData.sounds;

    console.log('Update data to be saved:', updateData);

    await connectDB();

    // Update user - use runValidators: false for optional fields to avoid validation issues
    // We validate with Zod above, so Mongoose validation is redundant for optional fields
    const user = await User.findByIdAndUpdate(
      auth.userId,
      { $set: updateData },
      { new: true, runValidators: false }
    ).select('-password');

    if (!user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'User not found' }, { status: 404 });
    }

    console.log('Updated user:', user);
    console.log('User name field:', user.name);
    console.log('User phone field:', user.phone);

    // Convert to plain object to ensure all fields are included
    const userObj = user.toObject ? user.toObject() : user;
    
    // Ensure name and phone are included even if null
    const responseData = {
      ...userObj,
      name: userObj.name ?? null,
      phone: userObj.phone ?? null,
    };

    console.log('Response data:', responseData);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: responseData,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json<ApiResponse>({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Update user error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}

