import { Skeleton } from '@/components/ui/skeleton';

// Shown instantly while a page's code loads, so a tap never feels ignored.
export default function Loading() {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6" aria-busy="true" aria-label="Loading">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        </div>
    );
}
