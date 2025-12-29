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
            className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                selected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                className
            )}
        >
            {label}
        </button>
    );
}

