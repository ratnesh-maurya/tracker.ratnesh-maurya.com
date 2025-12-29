import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  // Check for MONGODB_URI lazily (when function is called, not at module load)
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    
    // Provide helpful error messages
    if (e?.name === 'MongooseServerSelectionError') {
      const errorMessage = e.message || 'Could not connect to MongoDB';
      if (errorMessage.includes('IP') || errorMessage.includes('whitelist')) {
        throw new Error(
          'MongoDB Atlas connection failed: Your IP address is not whitelisted. ' +
          'Please add your server IP to MongoDB Atlas Network Access. ' +
          'For Vercel deployments, whitelist 0.0.0.0/0 or use Vercel IP ranges. ' +
          'See DEPLOYMENT.md for instructions.'
        );
      }
      throw new Error(`MongoDB connection failed: ${errorMessage}. Check your MONGODB_URI and network access settings.`);
    }
    
    throw e;
  }

  return cached.conn;
}

export default connectDB;

