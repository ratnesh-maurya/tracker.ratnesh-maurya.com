'use client';

import { useSyncExternalStore } from 'react';
import { Theme, getTheme } from './theme';

function subscribe(onChange: () => void) {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
}

// Current theme, updated live when the user switches it in Settings.
export function useTheme(): Theme {
    return useSyncExternalStore(subscribe, getTheme, () => 'dark');
}

// Ledger series colours for charts (hex: chart libraries need resolved values).
export const CHART_COLORS = ['#FF7A18', '#E8336D', '#FFB347', '#C2185B', '#77736A', '#1FA463'];
