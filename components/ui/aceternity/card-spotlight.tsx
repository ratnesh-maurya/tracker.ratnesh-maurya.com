'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

export const CardSpotlight = ({
    children,
    className,
    spotlightColor = 'rgba(59, 130, 246, 0.3)',
    ...props
}: {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const position = useMotionValue({ x: 0, y: 0 });
    const opacity = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current || isFocused) return;

        const rect = divRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        position.set({ x, y });
    };

    const handleMouseLeave = () => {
        opacity.set(0);
    };

    const handleMouseEnter = () => {
        opacity.set(1);
    };

    const handleFocus = () => {
        setIsFocused(true);
        opacity.set(1);
    };

    const handleBlur = () => {
        setIsFocused(false);
        opacity.set(0);
    };

    const background = useMotionTemplate`radial-gradient(600px circle at ${position.get().x}px ${position.get().y}px, ${spotlightColor}, transparent 80%)`;

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
                'relative rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all duration-300',
                className
            )}
            {...props}
        >
            {/* Spotlight overlay - only visible on hover */}
            <motion.div
                style={{
                    background,
                    opacity,
                }}
                className="absolute inset-0 rounded-3xl pointer-events-none"
            />
            {/* Content - always visible */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

