import { DateRange } from '@/types';
import { getDateRange } from '@/lib/utils';
import Habit from '@/models/Habit';
import HabitCheckIn from '@/models/HabitCheckIn';
import Sleep from '@/models/Sleep';
import Study from '@/models/Study';
import Expense from '@/models/Expense';
import Food from '@/models/Food';
import mongoose from 'mongoose';

export async function getHabitAnalytics(
  userId: string,
  dateRange: DateRange,
  customStart?: Date,
  customEnd?: Date
) {
  const { start, end } = getDateRange(dateRange, customStart, customEnd);

  // Get all active habits
  const totalHabits = await Habit.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    archived: false,
  });

  // Get check-ins in date range
  const checkIns = await HabitCheckIn.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: 'habits',
        localField: 'habitId',
        foreignField: '_id',
        as: 'habit',
      },
    },
    {
      $unwind: '$habit',
    },
    {
      $match: {
        'habit.archived': false,
      },
    },
    {
      $group: {
        _id: '$habitId',
        checkIns: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [
              { $eq: ['$habit.type', 'boolean'] },
              { $cond: [{ $eq: ['$value', true] }, 1, 0] },
              { $cond: [{ $gt: ['$value', 0] }, 1, 0] },
            ],
          },
        },
      },
    },
  ]);

  const totalCheckIns = checkIns.reduce((sum, item) => sum + item.checkIns, 0);
  const totalCompleted = checkIns.reduce((sum, item) => sum + item.completed, 0);
  const completionRate = totalHabits > 0 ? (totalCompleted / (totalHabits * Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))) * 100 : 0;

  // Calculate streaks (simplified - consecutive days with check-ins)
  const activeStreaks = checkIns.length;

  return {
    completionRate: Math.round(completionRate * 100) / 100,
    totalHabits,
    activeStreaks,
  };
}

export async function getSleepAnalytics(
  userId: string,
  dateRange: DateRange,
  customStart?: Date,
  customEnd?: Date
) {
  const { start, end } = getDateRange(dateRange, customStart, customEnd);

  const sleepData = await Sleep.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        averageDuration: { $avg: '$duration' },
        totalDays: { $sum: 1 },
      },
    },
  ]);

  return {
    averageDuration: sleepData[0]?.averageDuration ? Math.round(sleepData[0].averageDuration) : 0,
    totalDays: sleepData[0]?.totalDays || 0,
  };
}

export async function getStudyAnalytics(
  userId: string,
  dateRange: DateRange,
  customStart?: Date,
  customEnd?: Date
) {
  const { start, end } = getDateRange(dateRange, customStart, customEnd);

  const studyData = await Study.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalMinutes: { $sum: '$timeSpent' },
        totalSessions: { $sum: 1 },
      },
    },
  ]);

  return {
    totalHours: studyData[0]?.totalMinutes ? Math.round((studyData[0].totalMinutes / 60) * 100) / 100 : 0,
    totalSessions: studyData[0]?.totalSessions || 0,
  };
}

export async function getExpenseAnalytics(
  userId: string,
  dateRange: DateRange,
  customStart?: Date,
  customEnd?: Date
) {
  const { start, end } = getDateRange(dateRange, customStart, customEnd);

  const expenseData = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$currency',
        total: { $sum: '$amount' },
        byCategory: {
          $push: {
            category: '$category',
            amount: '$amount',
          },
        },
      },
    },
  ]);

  if (expenseData.length === 0) {
    return {
      total: 0,
      byCategory: {},
      currency: 'INR',
    };
  }

  // Sum all currencies together and combine categories
  let total = 0;
  const byCategory: Record<string, number> = {};
  let primaryCurrency = 'INR';
  let maxAmount = 0;

  expenseData.forEach((currencyGroup) => {
    // Track which currency has the most expenses
    if (currencyGroup.total > maxAmount) {
      maxAmount = currencyGroup.total;
      primaryCurrency = currencyGroup._id;
    }
    
    // Sum all currencies (assuming same currency or convert later)
    total += currencyGroup.total;
    
    // Combine categories from all currencies
    currencyGroup.byCategory.forEach((item: { category: string; amount: number }) => {
      byCategory[item.category] = (byCategory[item.category] || 0) + item.amount;
    });
  });

  return {
    total: Math.round(total * 100) / 100,
    byCategory,
    currency: primaryCurrency,
  };
}

export async function getFoodAnalytics(
  userId: string,
  dateRange: DateRange,
  customStart?: Date,
  customEnd?: Date
) {
  const { start, end } = getDateRange(dateRange, customStart, customEnd);

  const foodData = await Food.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalMeals: { $sum: 1 },
        averageCalories: { $avg: '$totalCalories' },
      },
    },
  ]);

  return {
    totalMeals: foodData[0]?.totalMeals || 0,
    averageCalories: foodData[0]?.averageCalories ? Math.round(foodData[0].averageCalories) : 0,
  };
}

