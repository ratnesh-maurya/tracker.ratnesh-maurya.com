'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastProps {
    toast: Toast;
    onClose: (id: string) => void;
}

const ToastComponent = ({ toast, onClose }: ToastProps) => {
    useEffect(() => {
        if (toast.duration !== 0) {
            const timer = setTimeout(() => {
                onClose(toast.id);
            }, toast.duration || 3000);

            return () => clearTimeout(timer);
        }
    }, [toast.id, toast.duration, onClose]);

    // Status is a 7px dot, not a coloured block (DESIGN.md: dots, not flat brand fills)
    const dots = {
        success: 'bg-ok',
        error: 'bg-kicker',
        info: 'bg-muted-foreground',
        warning: 'bg-marigold',
    };

    return (
        <div
            role={toast.type === 'error' ? 'alert' : 'status'}
            className="glass saffron-hairline animate-fade-in mb-2 flex w-full items-center gap-3 rounded-full py-2 pl-5 pr-2 shadow-pop sm:w-auto sm:min-w-[300px] sm:max-w-md"
        >
            <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${dots[toast.type]}`} aria-hidden />
            <p className="flex-1 text-sm font-medium text-foreground">{toast.message}</p>
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => onClose(toast.id)}
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" strokeWidth={1.8} aria-hidden />
            </Button>
        </div>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-[110] flex flex-col items-stretch sm:items-end lg:bottom-4 lg:left-auto">
            {toasts.map((toast) => (
                <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
};

