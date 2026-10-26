'use client';

import { cn } from '@/lib/utils';

interface ProgressCircleProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export function ProgressCircle({ percentage, size = 80, strokeWidth = 8, className }: ProgressCircleProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={cn('relative', className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="hsl(var(--coral))"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-300"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-xl text-foreground">{Math.round(percentage)}%</span>
            </div>
        </div>
    );
}

