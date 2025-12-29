import Food from '@/models/Food';
import User from '@/models/User';
import { MealType, FoodRecommendation } from '@/types';
import mongoose from 'mongoose';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';

// Simple food suggestions database (can be expanded)
const FOOD_SUGGESTIONS: Record<MealType, string[]> = {
  breakfast: [
    'Oatmeal with fruits',
    'Scrambled eggs with toast',
    'Greek yogurt with granola',
    'Avocado toast',
    'Smoothie bowl',
    'Pancakes',
    'Cereal with milk',
    'Bagel with cream cheese',
  ],
  lunch: [
    'Grilled chicken salad',
    'Vegetable stir-fry',
    'Quinoa bowl',
    'Sandwich with soup',
    'Pasta with vegetables',
    'Rice and curry',
    'Burrito bowl',
    'Sushi rolls',
  ],
  dinner: [
    'Salmon with vegetables',
    'Pasta with marinara',
    'Grilled chicken with rice',
    'Vegetable curry',
    'Pizza',
    'Burger with fries',
    'Tacos',
    'Stir-fried noodles',
  ],
  snack: [
    'Apple with peanut butter',
    'Trail mix',
    'Greek yogurt',
    'Protein bar',
    'Nuts',
    'Fruit smoothie',
    'Crackers with cheese',
    'Dark chocolate',
  ],
};

export async function getFoodRecommendations(
  userId: string,
  mealType: MealType
): Promise<FoodRecommendation> {
  // Get user's past food logs (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const pastFoods = await Food.find({
    userId: new mongoose.Types.ObjectId(userId),
    date: { $gte: getStartOfDay(thirtyDaysAgo) },
    mealType,
  }).sort({ date: -1 }).limit(50);

  // Get user preferences
  const user = await User.findById(userId);
  const dietaryPreferences = user?.dietaryPreferences || [];

  // Analyze frequency of items
  const itemFrequency: Record<string, number> = {};
  pastFoods.forEach((food) => {
    food.items.forEach((item) => {
      const name = item.name.toLowerCase();
      itemFrequency[name] = (itemFrequency[name] || 0) + 1;
    });
  });

  // Get most frequent items
  const frequentItems = Object.entries(itemFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name]) => name);

  // Get today's food to avoid suggesting what's already eaten
  const today = getStartOfDay(new Date());
  const todayFoods = await Food.find({
    userId: new mongoose.Types.ObjectId(userId),
    date: {
      $gte: today,
      $lt: getEndOfDay(new Date()),
    },
  });

  const todayItems = new Set(
    todayFoods.flatMap((f) => f.items.map((item) => item.name.toLowerCase()))
  );

  // Generate suggestions
  const suggestions: string[] = [];
  const baseSuggestions = FOOD_SUGGESTIONS[mealType];

  // Add frequent items first (if not eaten today)
  frequentItems.forEach((item) => {
    if (!todayItems.has(item) && suggestions.length < 3) {
      // Capitalize first letter
      const capitalized = item.charAt(0).toUpperCase() + item.slice(1);
      if (!suggestions.includes(capitalized)) {
        suggestions.push(capitalized);
      }
    }
  });

  // Fill remaining with base suggestions (avoiding today's items)
  baseSuggestions.forEach((suggestion) => {
    if (suggestions.length >= 5) return;
    const lowerSuggestion = suggestion.toLowerCase();
    if (!todayItems.has(lowerSuggestion) && !suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  });

  // Reasoning
  let reasoning = '';
  if (frequentItems.length > 0) {
    reasoning = `Based on your recent ${mealType} choices, we've included some of your favorites. `;
  }
  reasoning += `Here are some balanced ${mealType} options to consider.`;

  return {
    mealType,
    suggestions: suggestions.slice(0, 5),
    reasoning,
  };
}

