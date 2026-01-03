import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const auth = await requireAuth(request);
        if (!auth) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Update all user profiles to public
        const result = await User.updateMany(
            { profilePublic: { $ne: true } }, // Only update profiles that are not already public
            { $set: { profilePublic: true } }
        );

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                modifiedCount: result.modifiedCount,
                matchedCount: result.matchedCount,
            },
            message: `Successfully updated ${result.modifiedCount} user profiles to public`,
        });
    } catch (error) {
        console.error('Error updating profiles:', error);
        return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to update profiles' }, { status: 500 });
    }
}

