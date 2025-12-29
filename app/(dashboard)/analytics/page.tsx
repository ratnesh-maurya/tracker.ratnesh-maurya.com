'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ArrowLeft, BarChart3, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { NavBar } from '@/components/layout/NavBar';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const chartTheme = createTheme({
    typography: {
        fontSize: 10,
    },
});

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'mtd' | 'ytd'>('weekly');

    const { data: analyticsData, isLoading, isFetching } = useQuery({
        queryKey: ['analytics', dateRange],
        queryFn: async () => {
            const res = await fetch(`/api/analytics/summary?range=${dateRange}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        staleTime: 0, // Always refetch when dateRange changes
        gcTime: 0, // Don't cache old data
    });

    const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRange = e.target.value as 'daily' | 'weekly' | 'mtd' | 'ytd';
        setDateRange(newRange);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="icon">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <h1 className="text-2xl font-bold">Analytics</h1>
                            </div>
                            <Select
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                className="w-40"
                                disabled={true}
                            >
                                <option value="daily">Today</option>
                                <option value="weekly">This Week</option>
                                <option value="mtd">This Month</option>
                                <option value="ytd">This Year</option>
                            </Select>
                        </div>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-20">
                    <div className="text-center py-12">Loading analytics...</div>
                </main>
            </div>
        );
    }

    const data = analyticsData || {} as any;
    const habits = data.habits || {};
    const sleep = data.sleep || {};
    const study = data.study || {};
    const expenses = data.expenses || {};
    const food = data.food || {};

    // Prepare expense chart data
    const expenseChartData = Object.entries(expenses.byCategory || {}).map(([name, value]: [string, any]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
    }));

    // Get date range info for display
    const getDateRangeLabel = () => {
        const now = new Date();
        switch (dateRange) {
            case 'daily':
                return `Today (${format(now, 'MMM d, yyyy')})`;
            case 'weekly':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - 6);
                return `${format(weekStart, 'MMM d')} - ${format(now, 'MMM d, yyyy')}`;
            case 'mtd':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                return `${format(monthStart, 'MMM d')} - ${format(now, 'MMM d, yyyy')}`;
            case 'ytd':
                const yearStart = new Date(now.getFullYear(), 0, 1);
                return `${format(yearStart, 'MMM d, yyyy')} - ${format(now, 'MMM d, yyyy')}`;
            default:
                return '';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-bold">Analytics</h1>
                        </div>
                        <Select
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            className="w-40"
                            disabled={isFetching}
                        >
                            <option value="daily">Today</option>
                            <option value="weekly">This Week</option>
                            <option value="mtd">This Month</option>
                            <option value="ytd">This Year</option>
                        </Select>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-20">
                <div className="mb-4 text-sm text-gray-600">
                    Showing data for: <span className="font-semibold">{getDateRangeLabel()}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Habit Completion</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{habits.completionRate?.toFixed(1) || 0}%</div>
                            <p className="text-xs text-gray-500 mt-1">{habits.totalHabits || 0} active habits</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Avg Sleep</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {sleep.averageDuration ? `${Math.floor(sleep.averageDuration / 60)}h ${sleep.averageDuration % 60}m` : 'N/A'}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{sleep.totalDays || 0} days tracked</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Study Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{study.totalHours?.toFixed(1) || 0}h</div>
                            <p className="text-xs text-gray-500 mt-1">{study.totalSessions || 0} sessions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {expenses.currency || 'USD'} {expenses.total?.toFixed(2) || 0}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{Object.keys(expenses.byCategory || {}).length} categories</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {expenseChartData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Expenses by Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ThemeProvider theme={chartTheme}>
                                    <div className="w-full overflow-x-auto">
                                        <PieChart
                                            series={[
                                                {
                                                    data: expenseChartData.map((entry, index) => ({
                                                        id: index,
                                                        value: entry.value,
                                                        label: entry.name,
                                                        color: COLORS[index % COLORS.length],
                                                    })),
                                                    innerRadius: 30,
                                                    outerRadius: 100,
                                                },
                                            ]}
                                            width={400}
                                            height={300}
                                            sx={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
                                        />
                                    </div>
                                </ThemeProvider>
                            </CardContent>
                        </Card>
                    )}

                    {expenseChartData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Expense Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ThemeProvider theme={chartTheme}>
                                    <div className="w-full overflow-x-auto">
                                        <BarChart
                                            xAxis={[
                                                {
                                                    scaleType: 'band',
                                                    data: expenseChartData.map((entry) => entry.name),
                                                },
                                            ]}
                                            series={[
                                                {
                                                    data: expenseChartData.map((entry) => entry.value),
                                                    color: '#3B82F6',
                                                },
                                            ]}
                                            width={Math.max(400, expenseChartData.length * 80)}
                                            height={300}
                                            sx={{ width: '100%', maxWidth: '100%' }}
                                        />
                                    </div>
                                </ThemeProvider>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Habits Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Completion Rate</span>
                                    <span className="text-lg font-semibold">{habits.completionRate?.toFixed(1) || 0}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Active Habits</span>
                                    <span className="text-lg font-semibold">{habits.totalHabits || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Active Streaks</span>
                                    <span className="text-lg font-semibold">{habits.activeStreaks || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Food & Nutrition</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total Meals</span>
                                    <span className="text-lg font-semibold">{food.totalMeals || 0}</span>
                                </div>
                                {food.averageCalories && food.averageCalories > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Avg Calories</span>
                                        <span className="text-lg font-semibold">{food.averageCalories} cal</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <NavBar />
        </div>
    );
}
