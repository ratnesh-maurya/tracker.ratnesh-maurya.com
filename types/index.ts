// User Types
export interface User {
  _id: string;
  email: string;
  username: string;
  password: string;
  profilePublic: boolean;
  dietaryPreferences?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Habit Types
export type HabitType = 'boolean' | 'count';
export type HabitSchedule = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Habit {
  _id: string;
  userId: string;
  title: string;
  type: HabitType;
  schedule: HabitSchedule;
  target?: number; // For count type or X times per week
  reminders?: {
    enabled: boolean;
    times: string[]; // HH:mm format
  };
  icon?: string;
  color?: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitCheckIn {
  _id: string;
  habitId: string;
  userId: string;
  date: Date;
  value: number | boolean;
  notes?: string;
  createdAt: Date;
}

// Sleep Types
export interface Sleep {
  _id: string;
  userId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Food Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealItem {
  name: string;
  calories?: number;
}

export interface Food {
  _id: string;
  userId: string;
  date: Date;
  mealType: MealType;
  items: MealItem[];
  totalCalories?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Study Types
export interface Study {
  _id: string;
  userId: string;
  date: Date;
  topic: string;
  timeSpent: number; // minutes
  tags: string[];
  projectReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Expense Types
export interface Expense {
  _id: string;
  userId: string;
  date: Date;
  amount: number;
  category: string;
  currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Journal Types
export interface Journal {
  _id: string;
  userId: string;
  date: Date;
  summary: string;
  highlights?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export type DateRange = 'daily' | 'weekly' | 'mtd' | 'ytd' | 'custom';

export interface AnalyticsSummary {
  dateRange: DateRange;
  startDate: Date;
  endDate: Date;
  habits: {
    completionRate: number;
    totalHabits: number;
    activeStreaks: number;
  };
  sleep: {
    averageDuration: number;
    totalDays: number;
  };
  study: {
    totalHours: number;
    totalSessions: number;
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
    currency: string;
  };
  food: {
    totalMeals: number;
    averageCalories: number;
  };
}

// Recommendation Types
export interface FoodRecommendation {
  mealType: MealType;
  suggestions: string[];
  reasoning: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

