'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ToastProvider } from '@/components/ui/toast-provider';
import { DarkModeInit } from '@/components/dark-mode-init';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                        retry: (failureCount, error: any) => {
                            // Don't retry on 401 errors
                            if (error?.status === 401 || error?.response?.status === 401) {
                                return false;
                            }
                            return failureCount < 3;
                        },
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <DarkModeInit />
                {children}
            </ToastProvider>
        </QueryClientProvider>
    );
}

