'use client';

import { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export default function ChartTheme({
    mode,
    fontSize,
    children,
}: {
    mode: 'light' | 'dark';
    fontSize?: number;
    children: React.ReactNode;
}) {
    const theme = useMemo(
        () => createTheme({ palette: { mode }, ...(fontSize ? { typography: { fontSize } } : {}) }),
        [mode, fontSize]
    );
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
