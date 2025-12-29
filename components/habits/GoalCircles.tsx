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
        <div className="flex flex-wrap gap-2 mt-2">
            {circles.map((circleNum) => {
                const isCompleted = circleNum <= current;
                return (
                    <button
                        key={circleNum}
                        type="button"
                        onClick={() => onCircleClick(circleNum)}
                        className={cn(
                            'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110',
                            isCompleted
                                ? 'bg-green-500 border-green-600 text-white shadow-md'
                                : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400 hover:bg-gray-50'
                        )}
                    >
                        {isCompleted && <Check className="h-5 w-5" />}
                    </button>
                );
            })}
        </div>
    );
}

