'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chip } from '@/components/ui/chip';
import { EmptyState, PageHeader, PageShell, Section, Stat } from '@/components/layout/page';
import { format } from 'date-fns';
import { BarChart, ChartTheme, PieChart } from '@/components/charts/lazy';
import { handleApiResponse } from '@/lib/api/client';
import { CHART_COLORS, useTheme } from '@/lib/useTheme';

const COLORS = CHART_COLORS;


export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'mtd' | 'ytd'>('weekly');
    const isDark = useTheme() === 'dark';

    const { data: analyticsData, isLoading, isFetching } = useQuery({
        queryKey: ['analytics', dateRange],
        queryFn: async () => {
            const res = await fetch(`/api/analytics/summary?range=${dateRange}`);
            return handleApiResponse(res);
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const RANGES = [
        { value: 'daily', label: 'Today' },
        { value: 'weekly', label: 'This week' },
        { value: 'mtd', label: 'This month' },
        { value: 'ytd', label: 'This year' },
    ] as const;

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

    const sleepLabel = sleep.averageDuration ? `${Math.floor(sleep.averageDuration / 60)}h ${sleep.averageDuration % 60}m` : '—';
    const axisSx = {
        width: '100%',
        '& .MuiChartsAxis-root text': { fontFamily: 'var(--font-jetbrains)', fontSize: '11px !important' },
        '& .MuiChartsLegend-root': { fontFamily: 'var(--font-jetbrains)', fontSize: '11px' },
    };
    const tickStyle = { fontSize: 11, fill: isDark ? '#A39E92' : '#6B675E' };

    // Small ruled table of label / value rows
    const rows = (items: [string, React.ReactNode][]) => (
        <dl className="border-b border-border">
            {items.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 border-t border-border py-3">
                    <dt className="font-mono text-xs text-muted-foreground">{label}</dt>
                    <dd className="font-display text-[26px] leading-none">{value}</dd>
                </div>
            ))}
        </dl>
    );

    return (
        <PageShell>
            <PageHeader
                kicker="§ 08 · Analytics"
                title={<>How the <em>weeks</em> add up</>}
                lede={<span className="font-mono text-sm">{getDateRangeLabel()}</span>}
            />

            <fieldset disabled={isFetching} className="flex flex-wrap gap-2 disabled:opacity-60">
                <legend className="sr-only">Date range</legend>
                {RANGES.map((r) => (
                    <Chip key={r.value} label={r.label} selected={dateRange === r.value} onClick={() => setDateRange(r.value)} />
                ))}
            </fieldset>

            {isLoading ? (
                <p className="py-16 text-center font-mono text-sm text-muted-foreground animate-pulse">loading analytics…</p>
            ) : (
                <>
                    <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
                        <Stat label={`habit completion · ${habits.totalHabits || 0} habits`} value={`${habits.completionRate?.toFixed(1) || 0}%`} className="border-t border-border pt-4" />
                        <Stat label={`avg sleep · ${sleep.totalDays || 0} days`} value={sleepLabel} className="border-t border-border pt-4" />
                        <Stat label={`study · ${study.totalSessions || 0} sessions`} value={`${study.totalHours?.toFixed(1) || 0}h`} className="border-t border-border pt-4" />
                        <Stat label={`spent · ${Object.keys(expenses.byCategory || {}).length} categories`} value={`₹${Math.round(expenses.total || 0).toLocaleString('en-IN')}`} className="border-t border-border pt-4" />
                    </dl>

                    <Section kicker="§ 01 · Spending" title={<>Where the <em>money</em> went</>} className="mt-14">
                        {expenseChartData.length > 0 ? (
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                <div className="rounded-card bg-card p-5 shadow-card">
                                    <p className="eyebrow">By category</p>
                                    <div className="mt-3 w-full">
                                        <ChartTheme mode={isDark ? 'dark' : 'light'} fontSize={11}>
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
                                                height={340}
                                                slotProps={{ legend: { direction: 'horizontal', position: { vertical: 'bottom', horizontal: 'center' } } }}
                                                sx={axisSx}
                                            />
                                        </ChartTheme>
                                    </div>
                                </div>

                                <div className="rounded-card bg-card p-5 shadow-card">
                                    <p className="eyebrow">Breakdown</p>
                                    <div className="mt-3">
                                        <ChartTheme mode={isDark ? 'dark' : 'light'} fontSize={11}>
                                            <div className="w-full overflow-x-auto">
                                                <BarChart
                                                    xAxis={[{
                                                        scaleType: 'band',
                                                        data: expenseChartData.map((e) => e.name),
                                                        tickLabelStyle: tickStyle,
                                                    }]}
                                                    yAxis={[{
                                                        tickLabelStyle: tickStyle,
                                                    }]}
                                                    series={[{
                                                        data: expenseChartData.map((e) => e.value),
                                                        label: 'Amount (₹)',
                                                        color: COLORS[0],
                                                    }]}
                                                    borderRadius={6}
                                                    height={280}
                                                    sx={axisSx}
                                                />
                                            </div>
                                        </ChartTheme>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <EmptyState>No spending recorded for this period.</EmptyState>
                        )}
                    </Section>

                    <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-3">
                        <Section kicker="§ 02 · Habits" className="mt-0">
                            {rows([
                                ['completion rate', `${habits.completionRate?.toFixed(1) || 0}%`],
                                ['active habits', habits.totalHabits || 0],
                                ['active streaks', habits.activeStreaks || 0],
                            ])}
                        </Section>
                        <Section kicker="§ 03 · Sleep" className="mt-0">
                            {rows([
                                ['avg duration', sleepLabel],
                                ['days tracked', sleep.totalDays || 0],
                                ['total duration', sleep.totalDuration ? `${Math.floor(sleep.totalDuration / 60)}h` : '—'],
                            ])}
                        </Section>
                        <Section kicker="§ 04 · Study" className="mt-0">
                            {rows([
                                ['total hours', `${study.totalHours?.toFixed(1) || 0}h`],
                                ['sessions', study.totalSessions || 0],
                                ['avg per session', study.totalSessions > 0 ? `${(study.totalHours / study.totalSessions).toFixed(1)}h` : '—'],
                            ])}
                        </Section>
                    </div>
                </>
            )}
        </PageShell>
    );
}
