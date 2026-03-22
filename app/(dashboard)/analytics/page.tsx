'use client';

import { useState, useEffect } from 'react';
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

const COLORS = ['#6366f1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function useIsDark() {
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('dark'));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    return isDark;
}

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'mtd' | 'ytd'>('weekly');
    const isDark = useIsDark();
    const chartTheme = createTheme({
        palette: { mode: isDark ? 'dark' : 'light' },
        typography: { fontSize: 11 },
    });

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
            <div className="min-h-screen bg-background">
                <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-10">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">
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
                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-8">
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
        <div className="min-h-screen bg-background">
            <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
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

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-8">
                <div className="mb-6 text-sm text-muted-foreground animate-fade-in">
                    Showing data for: <span className="font-semibold text-foreground">{getDateRangeLabel()}</span>
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
                {expenseChartData.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-slide-up">
                        <Card className="border border-border shadow-sm bg-card">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                                    Expenses by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <ThemeProvider theme={chartTheme}>
                                    <PieChart
                                        series={[{
                                            data: expenseChartData.map((entry, index) => ({
                                                id: index,
                                                value: entry.value,
                                                label: entry.name,
                                                color: entry.color,
                                            })),
                                            innerRadius: 40,
                                            outerRadius: 110,
                                            paddingAngle: 2,
                                            cornerRadius: 4,
                                            highlightScope: { fade: 'global', highlight: 'item' },
                                        }]}
                                        width={380}
                                        height={280}
                                        slotProps={{ legend: { position: { vertical: 'middle', horizontal: 'end' } } }}
                                    />
                                </ThemeProvider>
                            </CardContent>
                        </Card>

                        <Card className="border border-border shadow-sm bg-card">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                                    <IndianRupee className="h-4 w-4 text-indigo-500" />
                                    Expense Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ThemeProvider theme={chartTheme}>
                                    <div className="w-full overflow-x-auto">
                                        <BarChart
                                            xAxis={[{
                                                scaleType: 'band',
                                                data: expenseChartData.map((e) => e.name),
                                                tickLabelStyle: { fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' },
                                            }]}
                                            yAxis={[{
                                                tickLabelStyle: { fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' },
                                            }]}
                                            series={[{
                                                data: expenseChartData.map((e) => e.value),
                                                label: 'Amount (₹)',
                                                color: '#6366f1',
                                            }]}
                                            borderRadius={6}
                                            width={380}
                                            height={280}
                                            sx={{ width: '100%' }}
                                        />
                                    </div>
                                </ThemeProvider>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card className="border border-border shadow-sm bg-card mb-6 animate-fade-in">
                        <CardContent className="py-12 text-center">
                            <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                            <p className="text-muted-foreground text-sm">No expense data for this period</p>
                        </CardContent>
                    </Card>
                )}

                {/* Additional Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
                    <Card className="border border-border shadow-sm bg-card">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Habits Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                                    <span className="text-lg font-semibold text-foreground">{habits.completionRate?.toFixed(1) || 0}%</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <span className="text-sm text-muted-foreground">Active Habits</span>
                                    <span className="text-lg font-semibold text-foreground">{habits.totalHabits || 0}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-muted-foreground">Active Streaks</span>
                                    <span className="text-lg font-semibold text-foreground">{habits.activeStreaks || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border shadow-sm bg-card">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                                <Bed className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                Sleep Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <span className="text-sm text-muted-foreground">Avg Duration</span>
                                    <span className="text-lg font-semibold text-foreground">
                                        {sleep.averageDuration ? `${Math.floor(sleep.averageDuration / 60)}h ${sleep.averageDuration % 60}m` : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <span className="text-sm text-muted-foreground">Days Tracked</span>
                                    <span className="text-lg font-semibold text-foreground">{sleep.totalDays || 0}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-muted-foreground">Total Duration</span>
                                    <span className="text-lg font-semibold text-foreground">
                                        {sleep.totalDuration ? `${Math.floor(sleep.totalDuration / 60)}h` : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border shadow-sm bg-card">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                                <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                Study Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <span className="text-sm text-muted-foreground">Total Hours</span>
                                    <span className="text-lg font-semibold text-foreground">{study.totalHours?.toFixed(1) || 0}h</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <span className="text-sm text-muted-foreground">Sessions</span>
                                    <span className="text-lg font-semibold text-foreground">{study.totalSessions || 0}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-muted-foreground">Avg per Session</span>
                                    <span className="text-lg font-semibold text-foreground">
                                        {study.totalSessions > 0 ? `${(study.totalHours / study.totalSessions).toFixed(1)}h` : 'N/A'}
                                    </span>
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
