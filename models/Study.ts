import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudy extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  topic: string;
  timeSpent: number; // minutes
  tags: string[];
  projectReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudySchema = new Schema<IStudy>(
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
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      maxlength: [200, 'Topic cannot exceed 200 characters'],
    },
    timeSpent: {
      type: Number,
      required: [true, 'Time spent is required'],
      min: [1, 'Time spent must be at least 1 minute'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 10,
        message: 'Cannot have more than 10 tags',
      },
    },
    projectReference: {
      type: String,
      maxlength: [200, 'Project reference cannot exceed 200 characters'],
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
StudySchema.index({ userId: 1, date: -1 });
StudySchema.index({ userId: 1, tags: 1 });

const Study: Model<IStudy> = mongoose.models.Study || mongoose.model<IStudy>('Study', StudySchema);

export default Study;

