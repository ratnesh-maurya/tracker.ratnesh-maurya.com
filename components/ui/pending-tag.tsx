import { CloudOff } from 'lucide-react';

// Marks an entry saved on this device but not yet on the server. Editing and
// deleting wait until it syncs, since it has no server id yet.
export function PendingTag() {
    return (
        <span
            className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-300"
            title="Saved on this device. Will sync when you are back online."
        >
            <CloudOff className="h-3 w-3" aria-hidden />
            Not synced
        </span>
    );
}
