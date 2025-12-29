'use client';

import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export function Pagination({ page, totalPages, onPageChange, isLoading = false }: PaginationProps) {
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (page > 1 && !isLoading) {
            onPageChange(page - 1);
        }
    };

    const handleNext = () => {
        if (page < totalPages && !isLoading) {
            onPageChange(page + 1);
        }
    };

    return (
        <div className="flex items-center justify-between gap-4 mt-6">
            <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={page === 1 || isLoading}
                className="flex items-center gap-1"
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </Button>

            <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={page === totalPages || isLoading}
                className="flex items-center gap-1"
            >
                Next
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}

