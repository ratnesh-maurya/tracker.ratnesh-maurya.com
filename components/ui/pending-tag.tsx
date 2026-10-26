// Marks an entry saved on this device but not yet on the server. Editing and
// deleting wait until it syncs, since it has no server id yet.
export function PendingTag() {
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-mono text-[11.5px] text-muted-foreground"
            title="Saved on this device. Will sync when you are back online."
        >
            <span className="h-[7px] w-[7px] rounded-full bg-marigold" aria-hidden />
            Not synced
        </span>
    );
}
