'use client';

import { useEffect } from 'react';

export function DarkModeInit() {
    useEffect(() => {
        const saved = localStorage.getItem('darkMode');
        // Default to DARK if nothing saved yet
        const isDark = saved !== null ? saved === 'true' : true;

        if (isDark) {
            document.documentElement.classList.add('dark');
            if (saved === null) localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return null;
}
