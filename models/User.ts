import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  username: string;
  name?: string;
  phone?: string;
  password: string;
  profilePublic: boolean;
  sounds: boolean;
  dietaryPreferences?: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // unique: true automatically creates an index
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true, // unique: true automatically creates an index
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string | null | undefined) {
          if (!v || v === '') return true; // Allow empty/null
          // Remove all non-digit characters except +
          const cleaned = String(v).replace(/[^\d+]/g, '');
          // Check if it's 10-15 digits (with optional + prefix)
          return /^\+?[0-9]{10,15}$/.test(cleaned);
        },
        message: 'Please provide a valid phone number (10-15 digits)',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    profilePublic: {
      type: Boolean,
      default: true,
    },
    sounds: {
      type: Boolean,
      default: true,
    },
    dietaryPreferences: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes are handled by unique: true and index: true in schema fields above

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

