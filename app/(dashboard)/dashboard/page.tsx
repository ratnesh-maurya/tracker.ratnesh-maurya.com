'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/layout/NavBar';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Chip } from '@/components/ui/chip';
import { FoodInput } from '@/components/ui/food-input';
import { useToast } from '@/components/ui/toast-provider';
import {
    Sparkles,
    IndianRupee,
    Settings,
    GraduationCap,
    FileText,
    TrendingUp,
    X,
    Coffee,
    Bed,
    Plus,
    Flame,
    Target,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';
import { LineChart } from '@mui/x-charts/LineChart';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { HabitReminderManager } from '@/components/habits/HabitReminderManager';
import { handleApiResponse } from '@/lib/api/client';

const chartTheme = createTheme({
    palette: {
        mode: 'light',
    },
});

const MEAL_TYPES = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
];

const CATEGORIES = [
    'Food',
    'Transport',
    'Entertainment',
    'Shopping',
    'Bills',
    'Healthcare',
    'Education',
    'Travel',
    'Other',
];

interface MealItem {
    name: string;
    calories?: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
    const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetch('/api/auth/refresh', { method: 'POST' })
            .then((res) => {
                if (!res.ok) {
                    router.push('/login');
                }
            })
            .catch(() => router.push('/login'))
            .finally(() => setLoading(false));
    }, [router]);

    const endDate = new Date();
    const startDate = subDays(endDate, 6);
    const startDateStr = getStartOfDay(startDate).toISOString();
    const endDateStr = getEndOfDay(endDate).toISOString();

    const { data: userData } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const res = await fetch('/api/users/me', { cache: 'no-store' });
            return handleApiResponse(res);
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Fetch analytics for stats
    const { data: analyticsData } = useQuery({
        queryKey: ['analytics', 'overall'],
        queryFn: async () => {
            const res = await fetch('/api/analytics/summary?range=ytd', { cache: 'no-store' });
            if (res.status === 401) {
                if (typeof window !== 'undefined') {
                    const currentPath = window.location.pathname;
                    if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/u/')) {
                        window.location.href = '/login';
                    }
                }
                return {};
            }
            const data = await res.json();
            return data.success ? data.data : {};
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const { data: sleepData } = useQuery({
        queryKey: ['sleep', 'last7days', startDateStr, endDateStr],
        queryFn: async () => {
            const res = await fetch(`/api/sleep?startDate=${startDateStr}&endDate=${endDateStr}&limit=100`, { cache: 'no-store' });
            const data = await handleApiResponse<{ entries?: any[] }>(res);
            return Array.isArray(data) ? data : (data?.entries || []);
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const { data: studyData } = useQuery({
        queryKey: ['study', 'last7days', startDateStr, endDateStr],
        queryFn: async () => {
            const res = await fetch(`/api/study?startDate=${startDateStr}&endDate=${endDateStr}&limit=100`, { cache: 'no-store' });
            const data = await handleApiResponse<{ entries?: any[] }>(res);
            return Array.isArray(data) ? data : (data?.entries || []);
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const { data: expenseData } = useQuery({
        queryKey: ['expenses', 'last7days', startDateStr, endDateStr],
        queryFn: async () => {
            const res = await fetch(`/api/expenses?startDate=${startDateStr}&endDate=${endDateStr}&limit=100`, { cache: 'no-store' });
            const data = await handleApiResponse<{ entries?: any[] }>(res);
            return Array.isArray(data) ? data : (data?.entries || []);
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(endDate, 6 - i);
        return {
            date,
            dateStr: format(date, 'MMM d'),
            dateKey: format(date, 'yyyy-MM-dd'),
        };
    });

    const sleepChartData = last7Days.map((day) => {
        const entry = sleepData?.find((s: any) => format(new Date(s.date), 'yyyy-MM-dd') === day.dateKey);
        return entry?.duration ? Math.round(entry.duration / 60 * 10) / 10 : 0;
    });

    const studyChartData = last7Days.map((day) => {
        const entries = studyData?.filter((s: any) => format(new Date(s.date), 'yyyy-MM-dd') === day.dateKey) || [];
        const totalMinutes = entries.reduce((sum: number, e: any) => sum + (e.timeSpent || 0), 0);
        return Math.round(totalMinutes / 60 * 10) / 10;
    });

    const expenseChartData = last7Days.map((day) => {
        const entries = expenseData?.filter((e: any) => format(new Date(e.date), 'yyyy-MM-dd') === day.dateKey) || [];
        return entries.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    });

    const dateLabels = last7Days.map((day) => day.dateStr);

    // Calculate stats
    const habits = analyticsData?.habits || {};
    const currentStreak = habits.activeStreaks || 0;
    const completionRate = Math.round(habits.completionRate || 0);
    const habitsCompleted = habits.totalHabits || 0;
    const totalHabits = habits.totalHabits || 0;
    const perfectDays = Math.round((completionRate / 100) * 30); // Approximate

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <HabitReminderManager />

            {/* Header */}
            <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                            {(userData as any)?.name || (userData as any)?.username || 'Welcome'} 👋
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Track your progress</p>
                    </div>
                    <Link href="/settings">
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent transition-smooth">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-fade-in">
                    {[
                        { label: 'Streak', value: currentStreak, unit: 'days', icon: Flame, gradient: 'from-purple-500 to-purple-600' },
                        { label: 'Completion', value: `${completionRate}%`, unit: '', icon: Target, gradient: 'from-blue-500 to-blue-600' },
                        { label: 'Habits', value: habitsCompleted, unit: 'total', icon: CheckCircle2, gradient: 'from-emerald-500 to-emerald-600' },
                        { label: 'Perfect Days', value: perfectDays, unit: '', icon: Calendar, gradient: 'from-pink-500 to-pink-600' },
                    ].map((s) => (
                        <Card key={s.label} className={`border-0 shadow-lg bg-gradient-to-br ${s.gradient} text-white`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/70 text-xs mb-0.5 font-medium">{s.label}</p>
                                        <p className="text-2xl font-bold leading-none">{s.value}</p>
                                        {s.unit && <p className="text-white/60 text-xs mt-1">{s.unit}</p>}
                                    </div>
                                    <s.icon className="h-7 w-7 text-white/70" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Two-column layout on desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column — chart + quick access */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Chart */}
                        <ThemeProvider theme={chartTheme}>
                            <Card className="border border-border shadow-sm bg-card">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                                        7-Day Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-1 sm:px-4 pb-4">
                                    <LineChart
                                        xAxis={[{ scaleType: 'point', data: dateLabels }]}
                                        yAxis={[{ id: 'leftAxis' }, { id: 'rightAxis', position: 'right' }]}
                                        series={[
                                            { data: sleepChartData, label: 'Sleep (h)', color: '#6366f1', yAxisId: 'leftAxis' },
                                            { data: studyChartData, label: 'Study (h)', color: '#a855f7', yAxisId: 'leftAxis' },
                                            { data: expenseChartData, label: 'Expenses (₹)', color: '#f59e0b', yAxisId: 'rightAxis' },
                                        ]}
                                        height={260}
                                        margin={isMobile ? { left: 5, right: 5, top: 10, bottom: 40 } : { left: 30, right: 40, top: 10, bottom: 40 }}
                                        sx={{
                                            width: '100%',
                                            '& .MuiChartsAxis-root': { fontSize: '0.65rem' },
                                            '& .MuiChartsLegend-root': { fontSize: '0.65rem' },
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </ThemeProvider>

                        {/* Quick Access grid */}
                        <div>
                            <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Quick Access</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    { href: '/habits', icon: Sparkles, label: 'Habits', color: 'from-indigo-500 to-indigo-600' },
                                    { href: '/food', icon: Coffee, label: 'Food', color: 'from-emerald-500 to-emerald-600' },
                                    { href: '/sleep', icon: Bed, label: 'Sleep', color: 'from-blue-500 to-blue-600' },
                                    { href: '/study', icon: GraduationCap, label: 'Study', color: 'from-purple-500 to-purple-600' },
                                    { href: '/expenses', icon: IndianRupee, label: 'Expenses', color: 'from-amber-500 to-amber-600' },
                                    { href: '/journal', icon: FileText, label: 'Journal', color: 'from-pink-500 to-pink-600' },
                                    { href: '/analytics', icon: TrendingUp, label: 'Analytics', color: 'from-orange-500 to-orange-600' },
                                    { href: '/calendar', icon: Calendar, label: 'Calendar', color: 'from-teal-500 to-teal-600' },
                                ].map((item) => (
                                    <Link key={item.href} href={item.href}>
                                        <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group bg-card hover:bg-accent/30">
                                            <CardContent className="p-3.5 flex items-center gap-3">
                                                <div className={`bg-gradient-to-br ${item.color} p-2 rounded-lg group-hover:scale-105 transition-transform duration-200 flex-shrink-0`}>
                                                    <item.icon className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="font-medium text-sm text-foreground">{item.label}</span>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right column — quick add */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Quick Add</h2>
                            <div className="space-y-3">
                                {[
                                    { label: 'Log Food', icon: Coffee, gradient: 'from-emerald-500 to-emerald-600', onClick: () => setIsFoodModalOpen(true) },
                                    { label: 'Log Expense', icon: IndianRupee, gradient: 'from-amber-500 to-amber-600', onClick: () => setIsExpenseModalOpen(true) },
                                    { label: 'Log Sleep', icon: Bed, gradient: 'from-indigo-500 to-indigo-600', onClick: () => setIsSleepModalOpen(true) },
                                ].map((item) => (
                                    <Button
                                        key={item.label}
                                        onClick={item.onClick}
                                        className={`w-full bg-gradient-to-r ${item.gradient} hover:brightness-110 text-white h-12 justify-start gap-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Today at a glance */}
                        <Card className="border border-border bg-card shadow-sm">
                            <CardHeader className="pb-2 pt-4 px-4">
                                <CardTitle className="text-sm font-semibold text-foreground">Today</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Streak</span>
                                    <span className="font-semibold text-orange-500 flex items-center gap-1"><Flame className="h-3.5 w-3.5 fill-orange-500" />{currentStreak} days</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Habits</span>
                                    <span className="font-semibold text-foreground">{completionRate}% done</span>
                                </div>
                                <Link href="/habits" className="block">
                                    <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-8 border-dashed">
                                        View habits →
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <QuickAddFoodModal isOpen={isFoodModalOpen} onClose={() => setIsFoodModalOpen(false)} />
            <QuickAddSleepModal isOpen={isSleepModalOpen} onClose={() => setIsSleepModalOpen(false)} />
            <QuickAddExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
            <NavBar />
        </div>
    );
}

function QuickAddFoodModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
    const [items, setItems] = useState<MealItem[]>([{ name: '', calories: undefined }]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const filteredItems = items.filter((item) => item.name.trim() !== '');
        if (filteredItems.length === 0) {
            toast.warning('Please add at least one food item');
            return;
        }

        setIsSubmitting(true);
        try {
            const today = new Date();
            const res = await fetch('/api/food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: format(today, 'yyyy-MM-dd'),
                    mealType,
                    items: filteredItems,
                    notes: notes.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                await queryClient.invalidateQueries({ queryKey: ['food'] });
                await queryClient.refetchQueries({ queryKey: ['food'] });
                toast.success('Food added successfully!');
                onClose();
                setItems([{ name: '', calories: undefined }]);
                setNotes('');
            } else {
                toast.error(data.error || 'Failed to add food entry');
            }
        } catch (error) {
            toast.error('Failed to add food entry');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addItem = () => {
        setItems([...items, { name: '', calories: undefined }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof MealItem, value: string | number | undefined) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Meal" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Meal Type</label>
                    <div className="flex flex-wrap gap-2">
                        {MEAL_TYPES.map((mt) => (
                            <Chip
                                key={mt.value}
                                label={mt.label}
                                selected={mealType === mt.value}
                                onClick={() => setMealType(mt.value as any)}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Food Items</label>
                        <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-lg">
                            <X className="h-3 w-3 mr-1 rotate-45" />
                            Add Item
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 animate-scale-in">
                                <FoodInput
                                    value={item.name}
                                    onChange={(value) => updateItem(index, 'name', value)}
                                    placeholder="Type food name or select from options below..."
                                    className="flex-1 rounded-lg"
                                />
                                {items.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(index)}
                                        className="rounded-lg"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="notes" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Notes (optional)
                    </label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="rounded-lg"
                    />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">Cancel</Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 rounded-lg">
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

function QuickAddSleepModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startTime || !endTime) {
            toast.warning('Please enter both start and end times');
            return;
        }

        setIsSubmitting(true);
        try {
            const today = new Date();
            const res = await fetch('/api/sleep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: format(today, 'yyyy-MM-dd'),
                    startTime,
                    endTime,
                    notes: notes.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                await queryClient.invalidateQueries({ queryKey: ['sleep'] });
                await queryClient.refetchQueries({ queryKey: ['sleep'] });
                toast.success('Sleep logged successfully!');
                onClose();
                setStartTime('');
                setEndTime('');
                setNotes('');
            } else {
                toast.error(data.error || 'Failed to log sleep');
            }
        } catch (error) {
            toast.error('Failed to log sleep');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Sleep" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Start Time
                        </label>
                        <Input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            End Time
                        </label>
                        <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="rounded-lg"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="sleepNotes" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Notes (optional)
                    </label>
                    <Textarea
                        id="sleepNotes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="rounded-lg"
                    />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">Cancel</Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

function QuickAddExpenseModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category) {
            toast.warning('Please enter amount and category');
            return;
        }

        setIsSubmitting(true);
        try {
            const today = new Date();
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: format(today, 'yyyy-MM-dd'),
                    amount: parseFloat(amount),
                    category,
                    currency,
                    notes: notes.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                await queryClient.invalidateQueries({ queryKey: ['expenses'] });
                await queryClient.refetchQueries({ queryKey: ['expenses'] });
                toast.success('Expense added successfully!');
                onClose();
                setAmount('');
                setCategory('');
                setNotes('');
            } else {
                toast.error(data.error || 'Failed to add expense');
            }
        } catch (error) {
            toast.error('Failed to add expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Expense" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Amount
                        </label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Currency
                        </label>
                        <Input
                            id="currency"
                            type="text"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                            className="rounded-lg"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Category</label>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <Chip
                                key={cat}
                                label={cat}
                                selected={category === cat}
                                onClick={() => setCategory(cat)}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="expenseNotes" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Notes (optional)
                    </label>
                    <Textarea
                        id="expenseNotes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="rounded-lg"
                    />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">Cancel</Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-yellow-600 hover:bg-yellow-700 rounded-lg">
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}