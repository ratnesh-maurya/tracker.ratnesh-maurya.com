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
    Moon,
    UtensilsCrossed,
    IndianRupee,
    Settings,
    Calendar,
    GraduationCap,
    FileText,
    TrendingUp,
    X,
    Zap,
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
        // Check auth status
        fetch('/api/auth/refresh', { method: 'POST' })
            .then((res) => {
                if (!res.ok) {
                    router.push('/login');
                }
            })
            .catch(() => router.push('/login'))
            .finally(() => setLoading(false));
    }, [router]);

    // Get last 7 days date range
    const endDate = new Date();
    const startDate = subDays(endDate, 6);
    const startDateStr = getStartOfDay(startDate).toISOString();
    const endDateStr = getEndOfDay(endDate).toISOString();

    // Fetch user data
    const { data: userData } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const res = await fetch('/api/users/me');
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
    });

    // Fetch sleep data for last 7 days
    const { data: sleepData } = useQuery({
        queryKey: ['sleep', 'last7days', startDateStr, endDateStr],
        queryFn: async () => {
            const res = await fetch(`/api/sleep?startDate=${startDateStr}&endDate=${endDateStr}&limit=100`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            // Handle both old format (array) and new format (object with entries)
            return Array.isArray(data.data) ? data.data : (data.data?.entries || []);
        },
    });

    // Fetch study data for last 7 days
    const { data: studyData } = useQuery({
        queryKey: ['study', 'last7days', startDateStr, endDateStr],
        queryFn: async () => {
            const res = await fetch(`/api/study?startDate=${startDateStr}&endDate=${endDateStr}&limit=100`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            // Handle both old format (array) and new format (object with entries)
            return Array.isArray(data.data) ? data.data : (data.data?.entries || []);
        },
    });

    // Fetch expense data for last 7 days
    const { data: expenseData } = useQuery({
        queryKey: ['expenses', 'last7days', startDateStr, endDateStr],
        queryFn: async () => {
            const res = await fetch(`/api/expenses?startDate=${startDateStr}&endDate=${endDateStr}&limit=100`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            // Handle both old format (array) and new format (object with entries)
            return Array.isArray(data.data) ? data.data : (data.data?.entries || []);
        },
    });

    // Process data for charts
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(endDate, 6 - i);
        return {
            date,
            dateStr: format(date, 'MMM d'),
            dateKey: format(date, 'yyyy-MM-dd'),
        };
    });

    // Process sleep data
    const sleepChartData = last7Days.map((day) => {
        const entry = sleepData?.find((s: any) => format(new Date(s.date), 'yyyy-MM-dd') === day.dateKey);
        return entry?.duration ? Math.round(entry.duration / 60 * 10) / 10 : 0; // Convert minutes to hours
    });

    // Process study data
    const studyChartData = last7Days.map((day) => {
        const entries = studyData?.filter((s: any) => format(new Date(s.date), 'yyyy-MM-dd') === day.dateKey) || [];
        const totalMinutes = entries.reduce((sum: number, e: any) => sum + (e.timeSpent || 0), 0);
        return Math.round(totalMinutes / 60 * 10) / 10; // Convert minutes to hours
    });

    // Process expense data - keep original values (will use right axis)
    const expenseChartData = last7Days.map((day) => {
        const entries = expenseData?.filter((e: any) => format(new Date(e.date), 'yyyy-MM-dd') === day.dateKey) || [];
        return entries.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    });

    const dateLabels = last7Days.map((day) => day.dateStr);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-600" />
                            <div>
                                <h1 className="text-xl font-bold">Hi, {userData?.name || userData?.username || 'User'}! 👋</h1>
                                <p className="text-sm text-gray-600">Let&apos;s make habits together!</p>
                            </div>
                        </div>
                        <Link href="/settings">
                            <Button variant="ghost" size="icon">
                                <Settings className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-0 py-6 pb-24 md:px-4 lg:px-8">
                {/* Combined Chart - First */}
                <ThemeProvider theme={chartTheme}>
                    <Card className="mb-6 mx-0 rounded-none md:mx-4 md:rounded-lg">
                        <CardHeader className="px-4 md:px-6">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                Last 7 Days Overview
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
                                        {
                                            id: 'leftAxis',
                                        },
                                        {
                                            id: 'rightAxis',
                                            position: 'right',
                                        },
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

                {/* Quick Add Section - Second */}
                <div className="mb-4 px-4 md:px-0">
                    <h2 className="text-lg font-semibold mb-3">Quick Add</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <Button
                            onClick={() => setIsFoodModalOpen(true)}
                            className="bg-green-500 hover:bg-green-600 text-white h-20 flex-col"
                        >
                            <Coffee className="h-6 w-6 mb-1" />
                            <span className="text-sm">Food</span>
                        </Button>
                        <Button
                            onClick={() => setIsExpenseModalOpen(true)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white h-20 flex-col"
                        >
                            <IndianRupee className="h-6 w-6 mb-1" />
                            <span className="text-sm">Expense</span>
                        </Button>
                        <Button
                            onClick={() => setIsSleepModalOpen(true)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white h-20 flex-col"
                        >
                            <Bed className="h-6 w-6 mb-1" />
                            <span className="text-sm">Sleep</span>
                        </Button>
                    </div>
                </div>

                {/* Quick Access */}
                <div className="mt-6 px-4 md:px-0">
                    <h2 className="text-lg font-semibold mb-3">Quick Access</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/habits">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="bg-blue-500 p-3 rounded-lg">
                                        <Sparkles className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="font-medium">Habits</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/expenses">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="bg-yellow-500 p-3 rounded-lg">
                                        <IndianRupee className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="font-medium">Expenses</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sleep">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="bg-indigo-500 p-3 rounded-lg">
                                        <Bed className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="font-medium">Sleep</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/food">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="bg-green-500 p-3 rounded-lg">
                                        <Coffee className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="font-medium">Food</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/study">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="bg-purple-500 p-3 rounded-lg">
                                        <GraduationCap className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="font-medium">Study</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/journal">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="bg-pink-500 p-3 rounded-lg">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="font-medium">Journal</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/analytics">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="bg-orange-500 p-3 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="font-medium">Analytics</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/settings">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="bg-gray-500 p-3 rounded-lg">
                                        <Settings className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="font-medium">Settings</span>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Quick Add Modals */}
            <QuickAddFoodModal isOpen={isFoodModalOpen} onClose={() => setIsFoodModalOpen(false)} />
            <QuickAddSleepModal isOpen={isSleepModalOpen} onClose={() => setIsSleepModalOpen(false)} />
            <QuickAddExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
            <NavBar />
        </div>
    );
}

// Quick Add Food Modal - Full form matching food page
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

        // Always use today's date, not selected date
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
                    <label className="block text-sm font-medium mb-3">Meal Type</label>
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
                        <label className="block text-sm font-medium">Food Items</label>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                            <X className="h-3 w-3 mr-1 rotate-45" />
                            Add Item
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <Input
                                    placeholder="Food name"
                                    value={item.name}
                                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                                    className="flex-1"
                                />
                                {items.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="notes" className="block text-sm font-medium mb-2">
                        Notes (optional)
                    </label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">Save</Button>
                </div>
            </form>
        </Modal>
    );
}

// Quick Add Sleep Modal - Full form matching sleep page
function QuickAddSleepModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [notes, setNotes] = useState('');
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Always use today's date, not selected date
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
                    <label htmlFor="startTime" className="block text-sm font-medium mb-2">
                        Start Time
                    </label>
                    <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="text-lg"
                    />
                </div>
                <div>
                    <label htmlFor="endTime" className="block text-sm font-medium mb-2">
                        End Time
                    </label>
                    <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="text-lg"
                    />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium mb-2">
                        Notes (optional)
                    </label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                    />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
                </div>
            </form>
        </Modal>
    );
}

// Quick Add Expense Modal - Full form matching expenses page
function QuickAddExpenseModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [notes, setNotes] = useState('');
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Always use today's date, not selected date
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
                    <label htmlFor="amount" className="block text-sm font-medium mb-2">
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
                        className="text-lg"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3">Category</label>
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
                    <label htmlFor="notes" className="block text-sm font-medium mb-2">
                        Notes (optional)
                    </label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Add any notes about this expense..."
                    />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">Save</Button>
                </div>
            </form>
        </Modal>
    );
}
