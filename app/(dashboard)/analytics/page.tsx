'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, Sparkles, Bed, GraduationCap, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { NavBar } from '@/components/layout/NavBar';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { handleApiResponse } from '@/lib/api/client';

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
            return handleApiResponse(res);
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRange = e.target.value as 'daily' | 'weekly' | 'mtd' | 'ytd';
        setDateRange(newRange);
    };

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                        Analytics
                                    </h1>
                                </div>
                            </div>
                            <Select
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                className="w-40 rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
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
                    <div className="text-center py-12 animate-pulse text-gray-400 dark:text-gray-500">Loading analytics...</div>
                </main>
            </div>
        );
    }

    const data = analyticsData || {} as any;
    const habits = data.habits || {};
    const sleep = data.sleep || {};
    const study = data.study || {};
    const expenses = data.expenses || {};

    const expenseChartData = Object.entries(expenses.byCategory || {}).map(([name, value]: [string, any], index) => ({
        name,
        value: parseFloat(value.toFixed(2)),
        color: COLORS[index % COLORS.length],
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                    Analytics
                                </h1>
                            </div>
                        </div>
                        <Select
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            className="w-40 rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
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
                <div className="mb-6 text-sm text-gray-600 dark:text-gray-400 animate-fade-in">
                    Showing data for: <span className="font-semibold text-gray-800 dark:text-gray-200">{getDateRangeLabel()}</span>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
                    <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardContent className="py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm mb-1 font-medium">Habit Completion</p>
                                    <p className="text-3xl font-bold">{habits.completionRate?.toFixed(1) || 0}%</p>
                                    <p className="text-xs text-blue-100 mt-1">{habits.totalHabits || 0} active habits</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                        <CardContent className="py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm mb-1 font-medium">Avg Sleep</p>
                                    <p className="text-3xl font-bold">
                                        {sleep.averageDuration ? `${Math.floor(sleep.averageDuration / 60)}h ${sleep.averageDuration % 60}m` : 'N/A'}
                                    </p>
                                    <p className="text-xs text-indigo-100 mt-1">{sleep.totalDays || 0} days tracked</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                    <Bed className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <CardContent className="py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm mb-1 font-medium">Study Time</p>
                                    <p className="text-3xl font-bold">{study.totalHours?.toFixed(1) || 0}h</p>
                                    <p className="text-xs text-purple-100 mt-1">{study.totalSessions || 0} sessions</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                        <CardContent className="py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-100 text-sm mb-1 font-medium">Total Expenses</p>
                                    <p className="text-3xl font-bold">
                                        ₹{expenses.total?.toFixed(2) || 0}
                                    </p>
                                    <p className="text-xs text-yellow-100 mt-1">{Object.keys(expenses.byCategory || {}).length} categories</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                    <IndianRupee className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-slide-up">
                    {expenseChartData.length > 0 && (
                        <Card className="border border-white/30 dark:border-white/10 shadow-xl bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                    <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    Expenses by Category
                                </CardTitle>
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
                                                        color: entry.color,
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
                        <Card className="border border-white/30 dark:border-white/10 shadow-xl bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                    <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    Expense Breakdown
                                </CardTitle>
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
                                                    label: 'Expenses',
                                                },
                                            ]}
                                            colors={expenseChartData.map((entry) => entry.color)}
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

                {/* Additional Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 animate-slide-up">
                    <Card className="border border-white/30 dark:border-white/10 shadow-xl bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Habits Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">{habits.completionRate?.toFixed(1) || 0}%</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Habits</span>
                                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">{habits.totalHabits || 0}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Streaks</span>
                                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">{habits.activeStreaks || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </main>
            <NavBar />
        </div>
    );
}
