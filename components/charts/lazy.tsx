'use client';

import dynamic from 'next/dynamic';

// MUI charts + emotion are the heaviest code in the app. Loading them here,
// on demand, keeps them out of the first paint of every page that has a chart.
const chartPlaceholder = () => <div className="h-[240px] w-full animate-pulse rounded-lg bg-muted" aria-hidden />;

export const ChartTheme = dynamic(() => import('./ChartTheme'), { ssr: false, loading: chartPlaceholder });

export const LineChart = dynamic(() => import('@mui/x-charts/LineChart').then((m) => m.LineChart), {
    ssr: false,
    loading: chartPlaceholder,
});

export const BarChart = dynamic(() => import('@mui/x-charts/BarChart').then((m) => m.BarChart), {
    ssr: false,
    loading: chartPlaceholder,
});

export const PieChart = dynamic(() => import('@mui/x-charts/PieChart').then((m) => m.PieChart), {
    ssr: false,
    loading: chartPlaceholder,
});
