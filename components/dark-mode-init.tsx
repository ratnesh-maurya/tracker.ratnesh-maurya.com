'use client';

import { useEffect } from 'react';

export function DarkModeInit() {
    useEffect(() => {
        // Initialize dark mode from localStorage or system preference
        const savedDarkMode = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedDarkMode !== null ? savedDarkMode === 'true' : prefersDark;

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return null;
}

