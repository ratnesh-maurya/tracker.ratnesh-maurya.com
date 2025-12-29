// Load environment variables FIRST using require (synchronous, runs before imports)
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Now import everything else
import connectDB from '../lib/db/connect';
import User from '../models/User';
import Habit from '../models/Habit';
import HabitCheckIn from '../models/HabitCheckIn';
import Sleep from '../models/Sleep';
import Food from '../models/Food';
import Study from '../models/Study';
import Expense from '../models/Expense';
import Journal from '../models/Journal';

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Habit.deleteMany({});
    await HabitCheckIn.deleteMany({});
    await Sleep.deleteMany({});
    await Food.deleteMany({});
    await Study.deleteMany({});
    await Expense.deleteMany({});
    await Journal.deleteMany({});
    console.log('Cleared existing data');

    // Create test user
    const user = new User({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      profilePublic: false,
      dietaryPreferences: ['vegetarian'],
    });
    await user.save();
    console.log('Created test user:', user.email);

    // Create sample habits
    const habits = [
      {
        userId: user._id,
        title: 'Morning Exercise',
        type: 'boolean',
        schedule: 'daily',
        icon: '🏃',
        color: '#3B82F6',
      },
      {
        userId: user._id,
        title: 'Read 30 minutes',
        type: 'boolean',
        schedule: 'daily',
        icon: '📚',
        color: '#10B981',
      },
      {
        userId: user._id,
        title: 'Drink 8 glasses of water',
        type: 'count',
        schedule: 'daily',
        target: 8,
        icon: '💧',
        color: '#06B6D4',
      },
    ];

    const createdHabits = await Habit.insertMany(habits);
    console.log('Created', createdHabits.length, 'habits');

    // Create sample check-ins for the last 7 days
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      for (const habit of createdHabits) {
        if (Math.random() > 0.3) { // 70% completion rate
          const checkIn = new HabitCheckIn({
            habitId: habit._id,
            userId: user._id,
            date,
            value: habit.type === 'boolean' ? true : Math.floor(Math.random() * 8) + 1,
          });
          await checkIn.save();
        }
      }
    }
    console.log('Created sample check-ins');

    // Create sample sleep entries
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const startTime = new Date(date);
      startTime.setHours(22, 30, 0, 0);

      const endTime = new Date(date);
      endTime.setDate(endTime.getDate() + 1);
      endTime.setHours(7, 0, 0, 0);

      const sleep = new Sleep({
        userId: user._id,
        date,
        startTime,
        endTime,
        duration: 510, // 8.5 hours
      });
      await sleep.save();
    }
    console.log('Created sample sleep entries');

    // Create sample food entries
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      for (const mealType of mealTypes) {
        const food = new Food({
          userId: user._id,
          date,
          mealType,
          items: [
            { name: 'Sample food item 1', calories: 200 },
            { name: 'Sample food item 2', calories: 150 },
          ],
          notes: `Sample ${mealType} entry`,
        });
        await food.save();
      }
    }
    console.log('Created sample food entries');

    // Create sample study entries
    const topics = ['DSA', 'Backend Development', 'System Design', 'Golang', 'React'];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const study = new Study({
        userId: user._id,
        date,
        topic: topics[i % topics.length],
        timeSpent: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
        tags: [topics[i % topics.length].toLowerCase()],
        notes: `Studied ${topics[i % topics.length]}`,
      });
      await study.save();
    }
    console.log('Created sample study entries');

    // Create sample expenses
    const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills'];
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const expense = new Expense({
        userId: user._id,
        date,
        amount: Math.floor(Math.random() * 100) + 10,
        category: categories[i % categories.length],
        currency: 'USD',
        notes: `Sample expense ${i + 1}`,
      });
      await expense.save();
    }
    console.log('Created sample expenses');

    // Create sample journal entries
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const journal = new Journal({
        userId: user._id,
        date,
        summary: `This is a sample journal entry for day ${i + 1}. Today was a productive day with lots of learning and progress.`,
        highlights: [
          `Highlight ${i + 1}.1`,
          `Highlight ${i + 1}.2`,
        ],
      });
      await journal.save();
    }
    console.log('Created sample journal entries');

    console.log('\n✅ Seed completed successfully!');
    console.log('\nTest credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();

