'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Chip } from '@/components/ui/chip';
import { FoodInput } from '@/components/ui/food-input';
import { useToast } from '@/components/ui/toast-provider';
import { SAVED_OFFLINE_MESSAGE, useOfflineCreate } from '@/lib/offline/useOfflineCreate';
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
import { ChartTheme, LineChart } from '@/components/charts/lazy';
import { HabitReminderManager } from '@/components/habits/HabitReminderManager';
import { handleApiResponse } from '@/lib/api/client';
import { CHART_COLORS, useTheme } from '@/lib/useTheme';
import { PageHeader, PageShell, Section, Stat } from '@/components/layout/page';

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
    const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
    const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(true);
    const [today, setToday] = useState('');
    const isDark = useTheme() === 'dark';

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        setToday(format(new Date(), 'EEEE, d MMM').toLowerCase());
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Session check runs in the background so cached data shows at once. Only a
    // real "not signed in" answer redirects; a network error (offline) does not.
    useEffect(() => {
        fetch('/api/auth/refresh', { method: 'POST' })
            .then((res) => {
                if (res.status === 401) router.push('/login');
            })
            .catch(() => {});
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


    const firstName = String((userData as any)?.name || (userData as any)?.username || '').split(' ')[0];

    return (
        <>
            <HabitReminderManager />

            <PageShell>
                <PageHeader
                    kicker={today ? `§ 01 · ${today}` : '§ 01 · today'}
                    title={firstName ? <>Hello, <em>{firstName}</em></> : <>Your <em>day</em></>}
                    action={
                        <Link href="/settings" aria-label="Settings" className="lg:hidden">
                            <Button variant="outline" size="icon" tabIndex={-1}>
                                <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
                            </Button>
                        </Link>
                    }
                />

                {/* Numbers on hairline rules, label under each */}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
                    {[
                        { label: 'day streak', value: currentStreak },
                        { label: 'completion', value: `${completionRate}%` },
                        { label: 'habits', value: habitsCompleted },
                        { label: 'perfect days', value: perfectDays },
                    ].map((s) => (
                        <Stat key={s.label} label={s.label} value={s.value} className="border-t border-border pt-4" />
                    ))}
                </dl>

                <Section kicker="§ 02 · Log something" className="mt-14">
                    <div className="flex flex-wrap gap-2.5">
                        <Link href="/habits">
                            <Button tabIndex={-1}>Check in habits →</Button>
                        </Link>
                        {[
                            { label: 'Meal', icon: Coffee, onClick: () => setIsFoodModalOpen(true) },
                            { label: 'Expense', icon: IndianRupee, onClick: () => setIsExpenseModalOpen(true) },
                            { label: 'Sleep', icon: Bed, onClick: () => setIsSleepModalOpen(true) },
                        ].map((item) => (
                            <Button key={item.label} variant="outline" onClick={item.onClick}>
                                <item.icon className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </Section>

                <div className="mt-14 grid grid-cols-1 gap-x-10 lg:grid-cols-3">
                    <Section kicker="§ 03 · Last seven days" className="lg:col-span-2" title={<>Sleep, study and <em>spend</em></>}>
                        <ChartTheme mode={isDark ? 'dark' : 'light'}>
                            <div className="rounded-card bg-card p-3 shadow-card sm:p-5">
                                <LineChart
                                    xAxis={[{ scaleType: 'point', data: dateLabels }]}
                                    yAxis={[{ id: 'leftAxis' }, { id: 'rightAxis', position: 'right' }]}
                                    series={[
                                        { data: sleepChartData, label: 'Sleep (h)', color: CHART_COLORS[0], yAxisId: 'leftAxis' },
                                        { data: studyChartData, label: 'Study (h)', color: CHART_COLORS[1], yAxisId: 'leftAxis' },
                                        { data: expenseChartData, label: 'Spend (₹)', color: CHART_COLORS[4], yAxisId: 'rightAxis' },
                                    ]}
                                    height={260}
                                    margin={isMobile ? { left: 5, right: 5, top: 10, bottom: 40 } : { left: 30, right: 40, top: 10, bottom: 40 }}
                                    sx={{
                                        width: '100%',
                                        '& .MuiChartsAxis-root text': { fontFamily: 'var(--font-jetbrains)', fontSize: '11px !important' },
                                        '& .MuiChartsLegend-root': { fontFamily: 'var(--font-jetbrains)', fontSize: '11px' },
                                    }}
                                />
                            </div>
                        </ChartTheme>
                    </Section>

                    <Section kicker="§ 04 · Today" className="mt-12 lg:mt-0">
                        <div className="rounded-card bg-card p-6 shadow-card">
                            <dl className="grid grid-cols-2 gap-6">
                                <Stat label="day streak" value={currentStreak} />
                                <Stat label="habits done" value={`${completionRate}%`} />
                            </dl>
                            <Link href="/habits" className="mt-6 inline-block text-[15px] text-coral transition-colors duration-150 hover:text-muted-foreground">
                                See today’s habits →
                            </Link>
                        </div>
                    </Section>
                </div>

                <Section kicker="§ 05 · Everything else">
                    <ul className="border-b border-border">
                        {[
                            { href: '/habits', label: 'Habits', note: 'streaks and check-ins' },
                            { href: '/food', label: 'Food', note: 'meals, Indian dishes' },
                            { href: '/sleep', label: 'Sleep', note: 'hours and bedtimes' },
                            { href: '/study', label: 'Study', note: 'sessions and topics' },
                            { href: '/expenses', label: 'Expenses', note: 'where the money went' },
                            { href: '/journal', label: 'Journal', note: 'one entry a day' },
                            { href: '/analytics', label: 'Analytics', note: 'week, month, year' },
                            { href: '/calendar', label: 'Calendar', note: 'the whole year at once' },
                        ].map((item, i) => (
                            <li key={item.href} className="border-t border-border">
                                <Link
                                    href={item.href}
                                    className="flex min-h-[64px] items-center gap-4 px-2 transition-colors duration-150 hover:bg-hover"
                                >
                                    <span className="w-8 font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                                    <span className="font-display text-[24px] leading-none sm:text-[28px]">{item.label}</span>
                                    <span className="ml-auto hidden font-mono text-xs text-muted-foreground sm:inline">{item.note}</span>
                                    <span className="font-mono text-muted-foreground" aria-hidden>→</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Section>
            </PageShell>

            <QuickAddFoodModal isOpen={isFoodModalOpen} onClose={() => setIsFoodModalOpen(false)} />
            <QuickAddSleepModal isOpen={isSleepModalOpen} onClose={() => setIsSleepModalOpen(false)} />
            <QuickAddExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
        </>
    );
}

function QuickAddFoodModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
    const [items, setItems] = useState<MealItem[]>([{ name: '', calories: undefined }]);
    const [notes, setNotes] = useState('');
    const { create } = useOfflineCreate('food');
    const toast = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const filteredItems = items.filter((item) => item.name.trim() !== '');
        if (filteredItems.length === 0) {
            toast.warning('Please add at least one food item');
            return;
        }

        const { queued } = create({
            date: format(new Date(), 'yyyy-MM-dd'),
            mealType,
            items: filteredItems,
            notes: notes.trim() || undefined,
        });
        toast.success(queued ? SAVED_OFFLINE_MESSAGE : 'Food added successfully!');
        onClose();
        setItems([{ name: '', calories: undefined }]);
        setNotes('');
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
                    <label className="mb-2 block text-sm font-medium text-foreground">Meal Type</label>
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
                        <label className="block text-sm font-medium text-foreground">Food Items</label>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                            <Plus className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                            Add Item
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <FoodInput
                                    value={item.name}
                                    onChange={(value) => updateItem(index, 'name', value)}
                                    placeholder="Type food name or select from options below..."
                                    className="flex-1"
                                />
                                {items.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(index)}
                                        aria-label="Remove item"
                                    >
                                        <X className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="notes" className="mb-2 block text-sm font-medium text-foreground">
                        Notes (optional)
                    </label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">
                        Save
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
    const { create } = useOfflineCreate('sleep');
    const toast = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startTime || !endTime) {
            toast.warning('Please enter both start and end times');
            return;
        }

        const { queued } = create({
            date: format(new Date(), 'yyyy-MM-dd'),
            startTime,
            endTime,
            notes: notes.trim() || undefined,
        });
        toast.success(queued ? SAVED_OFFLINE_MESSAGE : 'Sleep logged successfully!');
        onClose();
        setStartTime('');
        setEndTime('');
        setNotes('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Sleep" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startTime" className="mb-2 block text-sm font-medium text-foreground">
                            Start Time
                        </label>
                        <Input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="endTime" className="mb-2 block text-sm font-medium text-foreground">
                            End Time
                        </label>
                        <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="sleepNotes" className="mb-2 block text-sm font-medium text-foreground">
                        Notes (optional)
                    </label>
                    <Textarea
                        id="sleepNotes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">
                        Save
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
    const { create } = useOfflineCreate('expenses');
    const toast = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category) {
            toast.warning('Please enter amount and category');
            return;
        }

        const { queued } = create({
            date: format(new Date(), 'yyyy-MM-dd'),
            amount: parseFloat(amount),
            category,
            currency,
            notes: notes.trim() || undefined,
        });
        toast.success(queued ? SAVED_OFFLINE_MESSAGE : 'Expense added successfully!');
        onClose();
        setAmount('');
        setCategory('');
        setNotes('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Expense" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="mb-2 block text-sm font-medium text-foreground">
                            Amount
                        </label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="currency" className="mb-2 block text-sm font-medium text-foreground">
                            Currency
                        </label>
                        <Input
                            id="currency"
                            type="text"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Category</label>
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
                    <label htmlFor="expenseNotes" className="mb-2 block text-sm font-medium text-foreground">
                        Notes (optional)
                    </label>
                    <Textarea
                        id="expenseNotes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">
                        Save
                    </Button>
                </div>
            </form>
        </Modal>
    );
}