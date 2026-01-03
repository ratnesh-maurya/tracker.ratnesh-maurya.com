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
import {
    Sparkles,
    IndianRupee,
    Settings,
    GraduationCap,
    FileText,
    TrendingUp,
    X,
    Coffee,
    Bed
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';
import { LineChart } from '@mui/x-charts/LineChart';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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
            const res = await fetch('/api/users/me');
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
    });

    const { data: sleepData } = useQuery({
        queryKey: ['sleep', 'last7days', startDateStr, endDateStr],
        queryFn: async () => {
            const res = await fetch(`/api/sleep?startDate=${startDateStr}&endDate=${endDateStr}&limit=100`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return Array.isArray(data.data) ? data.data : (data.data?.entries || []);
        },
    });

    const { data: studyData } = useQuery({
        queryKey: ['study', 'last7days', startDateStr, endDateStr],
        queryFn: async () => {
            const res = await fetch(`/api/study?startDate=${startDateStr}&endDate=${endDateStr}&limit=100`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return Array.isArray(data.data) ? data.data : (data.data?.entries || []);
        },
    });

    const { data: expenseData } = useQuery({
        queryKey: ['expenses', 'last7days', startDateStr, endDateStr],
        queryFn: async () => {
            const res = await fetch(`/api/expenses?startDate=${startDateStr}&endDate=${endDateStr}&limit=100`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return Array.isArray(data.data) ? data.data : (data.data?.entries || []);
        },
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                {userData?.name || userData?.username || 'Welcome'} 👋
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">Track your progress</p>
                        </div>
                        <Link href="/settings">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 transition-smooth">
                                <Settings className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
                {/* Chart Section */}
                <div className="animate-fade-in mb-8">
                    <ThemeProvider theme={chartTheme}>
                        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                                    7-Day Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-0 md:px-6">
                                <div className="w-full">
                                    <LineChart
                                        xAxis={[{
                                            scaleType: 'point',
                                            data: dateLabels,
                                        }]}
                                        yAxis={[
                                            { id: 'leftAxis' },
                                            { id: 'rightAxis', position: 'right' },
                                        ]}
                                        series={[
                                            {
                                                data: sleepChartData,
                                                label: 'Sleep',
                                                color: '#6366f1',
                                                yAxisId: 'leftAxis',
                                            },
                                            {
                                                data: studyChartData,
                                                label: 'Study',
                                                color: '#9333ea',
                                                yAxisId: 'leftAxis',
                                            },
                                            {
                                                data: expenseChartData,
                                                label: 'Expenses',
                                                color: '#eab308',
                                                yAxisId: 'rightAxis',
                                            },
                                        ]}
                                        height={280}
                                        margin={isMobile ? { left: 5, right: 5, top: 10, bottom: 40 } : { left: 30, right: 35, top: 10, bottom: 40 }}
                                        sx={{
                                            width: '100%',
                                            '& .MuiChartsAxis-root': {
                                                fontSize: '0.6rem',
                                            },
                                            '& .MuiChartsLegend-root': {
                                                fontSize: '0.6rem',
                                            },
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </ThemeProvider>
                </div>

                {/* Quick Add */}
                <div className="animate-slide-up mb-8">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Quick Add</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <Button
                            onClick={() => setIsFoodModalOpen(true)}
                            className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-20 flex-col shadow-md hover:shadow-lg transition-all duration-200 rounded-xl"
                        >
                            <Coffee className="h-6 w-6 mb-1" />
                            <span className="text-xs font-medium">Food</span>
                        </Button>
                        <Button
                            onClick={() => setIsExpenseModalOpen(true)}
                            className="bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white h-20 flex-col shadow-md hover:shadow-lg transition-all duration-200 rounded-xl"
                        >
                            <IndianRupee className="h-6 w-6 mb-1" />
                            <span className="text-xs font-medium">Expense</span>
                        </Button>
                        <Button
                            onClick={() => setIsSleepModalOpen(true)}
                            className="bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white h-20 flex-col shadow-md hover:shadow-lg transition-all duration-200 rounded-xl"
                        >
                            <Bed className="h-6 w-6 mb-1" />
                            <span className="text-xs font-medium">Sleep</span>
                        </Button>
                    </div>
                </div>

                {/* Quick Access */}
                <div className="animate-slide-up">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Quick Access</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { href: '/habits', icon: Sparkles, label: 'Habits', color: 'from-blue-500 to-blue-600' },
                            { href: '/expenses', icon: IndianRupee, label: 'Expenses', color: 'from-yellow-500 to-yellow-600' },
                            { href: '/sleep', icon: Bed, label: 'Sleep', color: 'from-indigo-500 to-indigo-600' },
                            { href: '/food', icon: Coffee, label: 'Food', color: 'from-green-500 to-green-600' },
                            { href: '/study', icon: GraduationCap, label: 'Study', color: 'from-purple-500 to-purple-600' },
                            { href: '/journal', icon: FileText, label: 'Journal', color: 'from-pink-500 to-pink-600' },
                            { href: '/analytics', icon: TrendingUp, label: 'Analytics', color: 'from-orange-500 to-orange-600' },
                            { href: '/settings', icon: Settings, label: 'Settings', color: 'from-gray-500 to-gray-600' },
                        ].map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group bg-white/90 backdrop-blur-sm rounded-xl">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className={`bg-gradient-to-br ${item.color} p-2.5 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                                            <item.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="font-medium text-gray-700">{item.label}</span>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
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
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const filteredItems = items.filter((item) => item.name.trim() !== '');
        if (filteredItems.length === 0) {
            alert('Please add at least one food item');
            return;
        }

        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');
        const res = await fetch('/api/food', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: todayStr, mealType, items: filteredItems, notes: notes || undefined }),
        });
        if (res.ok) {
            queryClient.invalidateQueries({ queryKey: ['food'] });
            queryClient.invalidateQueries({ queryKey: ['sleep', 'last7days'] });
            queryClient.invalidateQueries({ queryKey: ['study', 'last7days'] });
            queryClient.invalidateQueries({ queryKey: ['expenses', 'last7days'] });
            onClose();
            setItems([{ name: '', calories: undefined }]);
            setNotes('');
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
                    <label className="block text-sm font-medium mb-3 text-gray-700">Meal Type</label>
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
                        <label className="block text-sm font-medium text-gray-700">Food Items</label>
                        <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-lg">
                            <X className="h-3 w-3 mr-1 rotate-45" />
                            Add Item
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 animate-scale-in">
                                <Input
                                    placeholder="Food name"
                                    value={item.name}
                                    onChange={(e) => updateItem(index, 'name', e.target.value)}
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
                    <label htmlFor="notes" className="block text-sm font-medium mb-2 text-gray-700">
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
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 rounded-lg">Save</Button>
                </div>
            </form>
        </Modal>
    );
}

function QuickAddSleepModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [notes, setNotes] = useState('');
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');
        const res = await fetch('/api/sleep', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: todayStr,
                startTime: `${todayStr}T${startTime}`,
                endTime: `${todayStr}T${endTime}`,
                notes: notes || undefined,
            }),
        });
        if (res.ok) {
            queryClient.invalidateQueries({ queryKey: ['sleep'] });
            queryClient.invalidateQueries({ queryKey: ['sleep', 'last7days'] });
            onClose();
            setStartTime('');
            setEndTime('');
            setNotes('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Sleep">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="startTime" className="block text-sm font-medium mb-2 text-gray-700">
                        Start Time
                    </label>
                    <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="text-lg rounded-lg"
                    />
                </div>
                <div>
                    <label htmlFor="endTime" className="block text-sm font-medium mb-2 text-gray-700">
                        End Time
                    </label>
                    <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="text-lg rounded-lg"
                    />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium mb-2 text-gray-700">
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
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save</Button>
                </div>
            </form>
        </Modal>
    );
}

function QuickAddExpenseModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [notes, setNotes] = useState('');
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');
        const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: todayStr,
                amount: parseFloat(amount),
                category,
                currency: 'INR',
                notes: notes || undefined,
            }),
        });
        if (res.ok) {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['expenses', 'last7days'] });
            onClose();
            setAmount('');
            setCategory('Food');
            setNotes('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium mb-2 text-gray-700">
                        Amount (₹)
                    </label>
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="text-lg rounded-lg"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">Category</label>
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
                    <label htmlFor="notes" className="block text-sm font-medium mb-2 text-gray-700">
                        Notes (optional)
                    </label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Add any notes about this expense..."
                        className="rounded-lg"
                    />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">Cancel</Button>
                    <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 rounded-lg">Save</Button>
                </div>
            </form>
        </Modal>
    );
}
