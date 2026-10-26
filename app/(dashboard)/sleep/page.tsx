'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { EmptyState, PageHeader, PageShell, Section, Stat } from '@/components/layout/page';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast-provider';
import { SAVED_OFFLINE_MESSAGE, useOfflineCreate } from '@/lib/offline/useOfflineCreate';
import { Edit2, Trash2 } from 'lucide-react';
import { formatDate, formatTime, getLocalDateString } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { SkeletonList } from '@/components/ui/skeleton';
import { handleApiResponse } from '@/lib/api/client';

export default function SleepPage() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingSleep, setEditingSleep] = useState<any>(null);
    const [deletingSleepId, setDeletingSleepId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [notes, setNotes] = useState('');
    const [page, setPage] = useState(1);

    const { data: sleepData, isLoading } = useQuery({
        queryKey: ['sleep', page],
        queryFn: async () => {
            const res = await fetch(`/api/sleep?page=${page}&limit=20`, { cache: 'no-store' });
            return handleApiResponse(res);
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Goes through the offline queue: works without a connection, syncs later
    const createMutation = useOfflineCreate('sleep', {
        onSaved: (queued) => {
            setPage(1);
            setIsModalOpen(false);
            setStartTime('');
            setEndTime('');
            setNotes('');
            toast.success(queued ? SAVED_OFFLINE_MESSAGE : 'Sleep entry added successfully!');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, sleep }: { id: string; sleep: any }) => {
            const res = await fetch(`/api/sleep/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sleep),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: async () => {
            // Remove and refetch all sleep queries
            queryClient.removeQueries({ queryKey: ['sleep'] });
            await queryClient.refetchQueries({ queryKey: ['sleep'], type: 'active' });
            setIsEditModalOpen(false);
            setEditingSleep(null);
            setStartTime('');
            setEndTime('');
            setNotes('');
            toast.success('Sleep entry updated successfully!');
        },
        onError: () => {
            toast.error('Failed to update sleep entry. Please try again.');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/sleep/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: async () => {
            // Remove all sleep queries from cache and refetch
            queryClient.removeQueries({ queryKey: ['sleep'] });
            await queryClient.refetchQueries({ queryKey: ['sleep'], type: 'active' });
            setIsDeleteDialogOpen(false);
            setDeletingSleepId(null);
            toast.success('Sleep entry deleted successfully!');
        },
        onError: () => {
            toast.error('Failed to delete sleep entry. Please try again.');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const today = getLocalDateString();
        createMutation.create({
            date: today,
            startTime: `${today}T${startTime}`,
            endTime: `${today}T${endTime}`,
            notes: notes || undefined,
        });
    };

    const handleEdit = (entry: any) => {
        setEditingSleep(entry);
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime);
        setStartTime(`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`);
        setEndTime(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
        setNotes(entry.notes || '');
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSleep) return;
        const date = getLocalDateString(new Date(editingSleep.date));
        await updateMutation.mutateAsync({
            id: editingSleep._id,
            sleep: {
                startTime: `${date}T${startTime}`,
                endTime: `${date}T${endTime}`,
                notes: notes || undefined,
            },
        });
    };

    const handleDeleteClick = (id: string) => {
        setDeletingSleepId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingSleepId) {
            await deleteMutation.mutateAsync(deletingSleepId);
        }
    };

    const sleepEntries = (sleepData as any)?.entries || [];
    const pagination = (sleepData as any)?.pagination;

    const avgMinutes = sleepEntries.length
        ? Math.round(sleepEntries.reduce((sum: number, e: any) => sum + (e.duration || 0), 0) / sleepEntries.length)
        : 0;

    return (
        <>
            <PageShell>
                <PageHeader
                    kicker="§ 04 · Sleep"
                    title={<>How you <em>slept</em></>}
                    action={<Button onClick={() => setIsModalOpen(true)}>Log sleep →</Button>}
                />

                {sleepEntries.length > 0 && (
                    <dl className="mb-12 grid grid-cols-2 gap-x-6 sm:grid-cols-4">
                        <Stat label="average a night" value={`${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m`} className="border-t border-border pt-4" />
                        <Stat label="nights logged" value={sleepEntries.length} className="border-t border-border pt-4" />
                    </dl>
                )}

                <Section kicker="§ 01 · Nights">
                    {isLoading ? (
                        <SkeletonList count={5} />
                    ) : sleepEntries.length === 0 ? (
                        <EmptyState action={<Button onClick={() => setIsModalOpen(true)}>Log sleep →</Button>}>
                            No nights logged yet.
                        </EmptyState>
                    ) : (
                        <ul className="border-b border-border animate-fade-in">
                            {sleepEntries.map((entry: any) => {
                                const duration = entry.duration || 0;
                                const hours = Math.floor(duration / 60);
                                const minutes = duration % 60;
                                return (
                                    <li
                                        key={entry._id}
                                        className="flex items-center gap-3 border-t border-border px-1 py-4 transition-colors duration-150 hover:bg-hover sm:gap-5 sm:px-2"
                                    >
                                        <span className="hidden w-28 shrink-0 font-mono text-xs text-muted-foreground sm:block">{formatDate(entry.date)}</span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-foreground">
                                                <span className="sm:hidden">{formatDate(entry.date)} · </span>
                                                {formatTime(entry.startTime)} → {formatTime(entry.endTime)}
                                            </p>
                                            {entry.notes && <p className="truncate text-sm text-muted-foreground">{entry.notes}</p>}
                                        </div>
                                        <span className="shrink-0 whitespace-nowrap font-display text-[26px] leading-none sm:text-[30px]">
                                            {hours}h {minutes}m
                                        </span>
                                        <div className="flex shrink-0 items-center gap-0.5">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} aria-label="Edit sleep entry">
                                                <Edit2 className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(entry._id)} aria-label="Delete sleep entry" className="text-kicker hover:text-kicker">
                                                <Trash2 className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                            </Button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {pagination && (
                        <Pagination
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={setPage}
                            isLoading={isLoading}
                        />
                    )}
                </Section>
            </PageShell>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Sleep">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="startTime" className="mb-2 block text-sm font-medium text-foreground">
                            Start Time
                        </label>
                        <Input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                            className="text-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="endTime" className="mb-2 block text-sm font-medium text-foreground">
                            End Time
                        </label>
                        <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                            className="text-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="notes" className="mb-2 block text-sm font-medium text-foreground">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingSleep(null); }} title="Edit Sleep Entry">
                <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="editStartTime" className="mb-2 block text-sm font-medium text-foreground">
                            Start Time
                        </label>
                        <Input
                            id="editStartTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                            className="text-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="editEndTime" className="mb-2 block text-sm font-medium text-foreground">
                            End Time
                        </label>
                        <Input
                            id="editEndTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                            className="text-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="editNotes" className="mb-2 block text-sm font-medium text-foreground">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="editNotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingSleep(null); }}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? 'Updating...' : 'Update'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => { setIsDeleteDialogOpen(false); setDeletingSleepId(null); }}
                onConfirm={handleDeleteConfirm}
                title="Delete Sleep Entry"
                message="Are you sure you want to delete this sleep entry? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </>
    );
}
