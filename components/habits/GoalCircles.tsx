'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalCirclesProps {
    target: number;
    current: number;
    onCircleClick: (index: number) => void;
}

export function GoalCircles({ target, current, onCircleClick }: GoalCirclesProps) {
    const circles = Array.from({ length: target }, (_, i) => i + 1);

    return (
        <div className="mt-4 flex flex-wrap gap-2">
            {circles.map((circleNum) => {
                const isCompleted = circleNum <= current;
                return (
                    <button
                        key={circleNum}
                        type="button"
                        onClick={() => onCircleClick(circleNum)}
                        aria-pressed={isCompleted}
                        aria-label={`${circleNum} of ${target}`}
                        className={cn(
                            'flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-150',
                            isCompleted
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-input bg-card text-muted-foreground hover:border-rule'
                        )}
                    >
                        {isCompleted ? <Check className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden /> : <span className="font-mono text-xs">{circleNum}</span>}
                    </button>
                );
            })}
        </div>
    );
}

