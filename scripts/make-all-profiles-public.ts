import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import connectDB from '../lib/db/connect';
import User from '../models/User';

async function makeAllProfilesPublic() {
    try {
        console.log('Connecting to database...');
        console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
        await connectDB();

        console.log('Updating all user profiles to public...');
        const result = await User.updateMany(
            { profilePublic: { $ne: true } }, // Only update profiles that are not already public
            { $set: { profilePublic: true } }
        );

        console.log(`✅ Successfully updated ${result.modifiedCount} user profiles to public`);
        console.log(`Total profiles checked: ${result.matchedCount}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating profiles:', error);
        process.exit(1);
    }
}

makeAllProfilesPublic();

