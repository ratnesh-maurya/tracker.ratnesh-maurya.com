import mongoose, { Schema, Document, Model } from 'mongoose';
import { MealType } from '@/types';

export interface IMealItem {
  name: string;
  calories?: number;
}

export interface IFood extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  mealType: MealType;
  items: IMealItem[];
  totalCalories?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MealItemSchema = new Schema<IMealItem>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters'],
  },
  calories: {
    type: Number,
    min: [0, 'Calories cannot be negative'],
  },
});

const FoodSchema = new Schema<IFood>(
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
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    items: {
      type: [MealItemSchema],
      required: true,
      validate: {
        validator: (items: IMealItem[]) => items.length > 0,
        message: 'At least one item is required',
      },
    },
    totalCalories: {
      type: Number,
      min: [0, 'Total calories cannot be negative'],
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

// Pre-save hook to calculate total calories
FoodSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    this.totalCalories = this.items.reduce((sum, item) => sum + (item.calories || 0), 0);
  }
  next();
});

// Indexes
FoodSchema.index({ userId: 1, date: -1 });
FoodSchema.index({ userId: 1, mealType: 1, date: -1 });

const Food: Model<IFood> = mongoose.models.Food || mongoose.model<IFood>('Food', FoodSchema);

export default Food;

