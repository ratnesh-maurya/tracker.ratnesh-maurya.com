'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ToastContainer, Toast, ToastType } from './toast';
import { playSuccessSound, playErrorSound, playNotificationSound } from '@/lib/sounds';

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [soundsEnabled, setSoundsEnabled] = useState(true);

    // Load sound preference from localStorage or user data
    useEffect(() => {
        const loadSoundPreference = async () => {
            try {
                // Try to get from localStorage first (for immediate feedback)
                const savedSounds = localStorage.getItem('sounds');
                if (savedSounds !== null) {
                    setSoundsEnabled(savedSounds === 'true');
                } else {
                    // Fetch from API if not in localStorage
                    const res = await fetch('/api/users/me');
                    const data = await res.json();
                    if (data.success && data.data) {
                        const enabled = data.data.sounds !== undefined ? data.data.sounds : true;
                        setSoundsEnabled(enabled);
                        localStorage.setItem('sounds', enabled.toString());
                    }
                }
            } catch (error) {
                // Default to enabled if fetch fails
                setSoundsEnabled(true);
            }
        };
        loadSoundPreference();

        // Listen for storage changes (when user updates settings)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'sounds') {
                setSoundsEnabled(e.newValue === 'true');
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);

        // Play sound based on toast type
        if (type === 'success') {
            playSuccessSound(soundsEnabled);
        } else if (type === 'error') {
            playErrorSound(soundsEnabled);
        } else {
            playNotificationSound(soundsEnabled);
        }
    }, [soundsEnabled]);

    const success = useCallback((message: string, duration?: number) => {
        showToast(message, 'success', duration);
    }, [showToast]);

    const error = useCallback((message: string, duration?: number) => {
        showToast(message, 'error', duration);
    }, [showToast]);

    const info = useCallback((message: string, duration?: number) => {
        showToast(message, 'info', duration);
    }, [showToast]);

    const warning = useCallback((message: string, duration?: number) => {
        showToast(message, 'warning', duration);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    );
};

