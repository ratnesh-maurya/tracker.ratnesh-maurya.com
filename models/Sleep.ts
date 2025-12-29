import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISleep extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SleepSchema = new Schema<ISleep>(
  {
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
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number,
      required: true,
      min: [0, 'Duration cannot be negative'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate duration
SleepSchema.pre('save', function (next) {
  if (this.startTime && this.endTime) {
    const diffMs = this.endTime.getTime() - this.startTime.getTime();
    this.duration = Math.round(diffMs / (1000 * 60)); // Convert to minutes
  }
  next();
});

// Indexes
SleepSchema.index({ userId: 1, date: -1 });
SleepSchema.index({ userId: 1, date: 1 }, { unique: true }); // One sleep entry per day per user

const Sleep: Model<ISleep> = mongoose.models.Sleep || mongoose.model<ISleep>('Sleep', SleepSchema);

export default Sleep;

