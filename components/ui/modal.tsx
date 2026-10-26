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
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[rgba(10,10,16,.6)] p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                className={cn(
                    'saffron-hairline bg-popover text-popover-foreground border border-border shadow-pop w-full flex flex-col max-h-[92vh] rounded-t-card sm:rounded-card',
                    sizeClasses[size]
                )}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
                    <h2 id="modal-title" className="font-display text-[30px] leading-[1.1] tracking-[-0.02em]">{title}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="border border-border">
                        <X className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
                    </Button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 safe-bottom">{children}</div>
            </div>
        </div>
    );
}

