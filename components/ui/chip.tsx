'use client';

import { cn } from '@/lib/utils';
import { Button } from './button';

interface ChipProps {
    label: string;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
}

export function Chip({ label, selected = false, onClick, className }: ChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={cn(
                'inline-flex min-h-[40px] items-center rounded-full border px-4 text-sm font-medium transition-colors duration-150',
                selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-rule hover:text-foreground',
                className
            )}
        >
            {label}
        </button>
    );
}

