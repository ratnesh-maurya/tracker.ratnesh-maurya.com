'use client';

import { useEffect } from 'react';
import { getTheme, setTheme } from '@/lib/theme';

// The pre-paint script already set data-theme; this only brings the browser's
// theme-color (status bar) in line when a saved light theme was applied.
export function ThemeSync() {
    useEffect(() => {
        setTheme(getTheme());
    }, []);
    return null;
}
