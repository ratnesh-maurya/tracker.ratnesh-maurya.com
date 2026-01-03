import mongoose, { Schema, Document, Model } from 'mongoose';
import { HabitType, HabitSchedule } from '@/types';

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: HabitType;
  schedule: HabitSchedule;
  target?: number;
  habitualType?: 'build' | 'quit';
  timeRange?: 'anytime' | 'morning' | 'afternoon' | 'evening';
  reminders?: {
    enabled: boolean;
    times: string[];
    message?: string;
  };
  icon?: string;
  color?: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Habit title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: ['boolean', 'count'],
      default: 'boolean',
    },
    schedule: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom'],
      default: 'daily',
    },
    target: {
      type: Number,
      min: [1, 'Target must be at least 1'],
    },
    reminders: {
      enabled: {
        type: Boolean,
        default: false,
      },
      times: [{
        type: String,
        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'],
      }],
      message: {
        type: String,
        maxlength: [200, 'Reminder message cannot exceed 200 characters'],
      },
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    habitualType: {
      type: String,
      enum: ['build', 'quit'],
      default: 'build',
    },
    timeRange: {
      type: String,
      enum: ['anytime', 'morning', 'afternoon', 'evening'],
      default: 'anytime',
    },
    icon: {
      type: String,
      maxlength: [50, 'Icon name cannot exceed 50 characters'],
    },
    color: {
      type: String,
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code'],
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
HabitSchema.index({ userId: 1, archived: 1 });
HabitSchema.index({ userId: 1, createdAt: -1 });

const Habit: Model<IHabit> = mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema);

export default Habit;

