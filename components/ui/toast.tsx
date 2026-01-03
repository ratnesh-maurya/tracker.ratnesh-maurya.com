'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
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

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertTriangle,
    };

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
    };

    const Icon = icons[toast.type];
    const colorClass = colors[toast.type];

    return (
        <div className="animate-slide-up mb-2 flex items-center gap-3 rounded-lg bg-white shadow-lg border border-gray-200 p-4 min-w-[300px] max-w-md">
            <div className={`flex-shrink-0 ${colorClass} p-2 rounded-full`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <p className="flex-1 text-sm font-medium text-gray-800">{toast.message}</p>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-gray-100"
                onClick={() => onClose(toast.id)}
            >
                <X className="h-4 w-4" />
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
        <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
            {toasts.map((toast) => (
                <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
};

