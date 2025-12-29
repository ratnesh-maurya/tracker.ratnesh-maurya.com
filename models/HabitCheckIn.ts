import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHabitCheckIn extends Document {
  habitId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  value: number | boolean;
  notes?: string;
  createdAt: Date;
}

const HabitCheckInSchema = new Schema<IHabitCheckIn>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for efficient queries
HabitCheckInSchema.index({ userId: 1, date: -1 });
HabitCheckInSchema.index({ habitId: 1, date: -1 });
HabitCheckInSchema.index({ userId: 1, habitId: 1, date: -1 }, { unique: true });

const HabitCheckIn: Model<IHabitCheckIn> = mongoose.models.HabitCheckIn || mongoose.model<IHabitCheckIn>('HabitCheckIn', HabitCheckInSchema);

export default HabitCheckIn;

