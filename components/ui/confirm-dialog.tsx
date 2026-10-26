'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal } from './modal';
import { Button } from './button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false,
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
    };

    const confirmVariant = variant === 'danger' ? 'destructive' : 'default';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle
                        className={variant === 'danger' ? 'mt-0.5 h-5 w-5 shrink-0 text-kicker' : 'mt-0.5 h-5 w-5 shrink-0 text-muted-foreground'}
                        strokeWidth={1.8}
                        aria-hidden
                    />
                    <p className="text-[15px] text-body flex-1">{message}</p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        variant={confirmVariant}
                    >
                        {isLoading ? '…' : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

