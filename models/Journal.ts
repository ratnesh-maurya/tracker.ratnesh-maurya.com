import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJournal extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  summary: string;
  highlights?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new Schema<IJournal>(
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
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      maxlength: [5000, 'Summary cannot exceed 5000 characters'],
    },
    highlights: {
      type: [String],
      default: [],
      validate: {
        validator: (highlights: string[]) => highlights.length <= 10,
        message: 'Cannot have more than 10 highlights',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
JournalSchema.index({ userId: 1, date: -1 });
JournalSchema.index({ userId: 1, date: 1 }, { unique: true }); // One journal entry per day per user

const Journal: Model<IJournal> = mongoose.models.Journal || mongoose.model<IJournal>('Journal', JournalSchema);

export default Journal;

