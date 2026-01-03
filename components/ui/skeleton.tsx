'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
    const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    return (
        <div
            className={cn(baseClasses, variantClasses[variant], className)}
            role="status"
            aria-label="Loading..."
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}

// Pre-built skeleton components
export function SkeletonCard() {
    return (
        <div className="border-0 shadow-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-5 space-y-4">
            <Skeleton className="h-6 w-3/4" variant="text" />
            <Skeleton className="h-4 w-full" variant="text" />
            <Skeleton className="h-4 w-5/6" variant="text" />
            <Skeleton className="h-32 w-full" variant="rectangular" />
        </div>
    );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="border-0 shadow-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-5 w-1/4" variant="text" />
                        <Skeleton className="h-4 w-16" variant="text" />
                    </div>
                    <Skeleton className="h-4 w-full mb-1" variant="text" />
                    <Skeleton className="h-4 w-3/4" variant="text" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex gap-2 mb-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-6 flex-1" variant="text" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex gap-2">
                    {Array.from({ length: cols }).map((_, colIdx) => (
                        <Skeleton key={colIdx} className="h-10 flex-1" variant="rectangular" />
                    ))}
                </div>
            ))}
        </div>
    );
}
