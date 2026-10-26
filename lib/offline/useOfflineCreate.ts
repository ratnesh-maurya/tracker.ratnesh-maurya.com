'use client';

import { onlineManager, useMutation, useQueryClient } from '@tanstack/react-query';
import { OfflineEntity, addPendingEntry, createKey, newClientId } from './queue';

// Entities whose create endpoint de-duplicates on clientId (see lib/api/idempotent.ts).
const IDEMPOTENT = new Set<OfflineEntity>(['expenses', 'food', 'study']);

export const SAVED_OFFLINE_MESSAGE = 'Saved on this device · will sync when you are back online';

interface Options {
    // Show the new entry at the top of the first list page before the server answers.
    optimistic?: boolean;
    // Runs as soon as the save is accepted. `queued` is true when offline.
    onSaved?: (queued: boolean) => void;
}

// Creates go through the offline queue: the UI moves on at once, the request is
// sent now or when the connection returns. Failures surface as a global toast.
export function useOfflineCreate<V extends object>(entity: OfflineEntity, { optimistic, onSaved }: Options = {}) {
    const queryClient = useQueryClient();
    const mutation = useMutation<unknown, Error, V & { clientId?: string }>({
        mutationKey: createKey(entity),
        onMutate: async (vars) => {
            if (!optimistic) return;
            await queryClient.cancelQueries({ queryKey: [entity, 1] });
            queryClient.setQueryData([entity, 1], (old: unknown) =>
                addPendingEntry(old, { ...vars, _id: `local-${vars.clientId}`, pending: true })
            );
        },
    });

    const create = (vars: V) => {
        const queued = !onlineManager.isOnline();
        mutation.mutate({ ...vars, ...(IDEMPOTENT.has(entity) ? { clientId: newClientId() } : {}) });
        onSaved?.(queued);
        return { queued };
    };

    return { create, isPending: mutation.isPending && !mutation.isPaused };
}
