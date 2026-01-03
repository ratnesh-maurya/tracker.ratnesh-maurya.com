'use client';

import { useEffect, useState } from 'react';

export function DarkModeInit() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Initialize dark mode from localStorage or default to light mode
        const savedDarkMode = localStorage.getItem('darkMode');
        // Default to light mode (white) if no preference is saved
        const isDark = savedDarkMode !== null ? savedDarkMode === 'true' : false;

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return null;
    }

    return null;
}

