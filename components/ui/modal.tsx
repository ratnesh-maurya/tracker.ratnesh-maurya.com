'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className={cn(
                    'bg-white/50 dark:bg-gray-800/80 backdrop-blur-3xl rounded-2xl border border-white/40 dark:border-white/10 shadow-2xl shadow-black/20 dark:shadow-black/40 w-full flex flex-col max-h-[90vh]',
                    sizeClasses[size]
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-white/10 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/20 dark:hover:bg-white/10">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    );
}

