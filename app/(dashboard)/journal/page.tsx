'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast-provider';
import { SAVED_OFFLINE_MESSAGE, useOfflineCreate } from '@/lib/offline/useOfflineCreate';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { formatDate, getLocalDateString } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { handleApiResponse } from '@/lib/api/client';
import { EmptyState, PageHeader, PageShell } from '@/components/layout/page';

export default function JournalPage() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingJournal, setEditingJournal] = useState<any>(null);
    const [deletingJournalId, setDeletingJournalId] = useState<string | null>(null);
    const [summary, setSummary] = useState('');
    const [highlights, setHighlights] = useState(['']);
    const [page, setPage] = useState(1);

    const { data: journalData, isLoading } = useQuery({
        queryKey: ['journal', page],
        queryFn: async () => {
            const res = await fetch(`/api/journal?page=${page}&limit=20`, { cache: 'no-store' });
            return handleApiResponse(res);
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Goes through the offline queue: works without a connection, syncs later
    const createMutation = useOfflineCreate('journal', {
        onSaved: (queued) => {
            setPage(1); // Reset to first page after creating new entry
            setIsModalOpen(false);
            setSummary('');
            setHighlights(['']);
            toast.success(queued ? SAVED_OFFLINE_MESSAGE : 'Journal entry added successfully!');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, journal }: { id: string; journal: any }) => {
            const res = await fetch(`/api/journal/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(journal),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: async () => {
            // Remove and refetch all journal queries
            queryClient.removeQueries({ queryKey: ['journal'] });
            await queryClient.refetchQueries({ queryKey: ['journal'], type: 'active' });
            setIsEditModalOpen(false);
            setEditingJournal(null);
            setSummary('');
            setHighlights(['']);
            toast.success('Journal entry updated successfully!');
        },
        onError: () => {
            toast.error('Failed to update journal entry. Please try again.');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/journal/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: async () => {
            // Remove all journal queries from cache and refetch
            queryClient.removeQueries({ queryKey: ['journal'] });
            await queryClient.refetchQueries({ queryKey: ['journal'], type: 'active' });
            setIsDeleteDialogOpen(false);
            setDeletingJournalId(null);
            toast.success('Journal entry deleted successfully!');
        },
        onError: () => {
            toast.error('Failed to delete journal entry. Please try again.');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const filteredHighlights = highlights.filter((h) => h.trim() !== '');
        const today = getLocalDateString();

        createMutation.create({
            date: today,
            summary,
            highlights: filteredHighlights,
        });
    };

    const addHighlight = () => {
        setHighlights([...highlights, '']);
    };

    const removeHighlight = (index: number) => {
        setHighlights(highlights.filter((_, i) => i !== index));
    };

    const updateHighlight = (index: number, value: string) => {
        const newHighlights = [...highlights];
        newHighlights[index] = value;
        setHighlights(newHighlights);
    };

    const handleEdit = (entry: any) => {
        setEditingJournal(entry);
        setSummary(entry.summary || '');
        setHighlights(entry.highlights && entry.highlights.length > 0 ? entry.highlights : ['']);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingJournal) return;
        const filteredHighlights = highlights.filter((h) => h.trim() !== '');
        await updateMutation.mutateAsync({
            id: editingJournal._id,
            journal: {
                summary,
                highlights: filteredHighlights,
            },
        });
    };

    const handleDeleteClick = (id: string) => {
        setDeletingJournalId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingJournalId) {
            await deleteMutation.mutateAsync(deletingJournalId);
        }
    };

    const journalEntries = (journalData as any)?.entries || [];
    const pagination = (journalData as any)?.pagination;

    return (
        <>
            <PageShell>
                <PageHeader
                    kicker="§ 07 · Journal"
                    title={<>One page a <em>day</em></>}
                    action={
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                            New entry
                        </Button>
                    }
                />

                {isLoading ? (
                    <p className="py-12 text-center font-mono text-sm text-muted-foreground animate-pulse">loading…</p>
                ) : journalEntries.length === 0 ? (
                    <EmptyState
                        action={
                            <Button onClick={() => setIsModalOpen(true)}>
                                <Plus className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                New entry
                            </Button>
                        }
                    >
                        Nothing written yet.
                    </EmptyState>
                ) : (
                    <ol className="border-b border-border">
                        {journalEntries.map((entry: any) => (
                            <li
                                key={entry._id}
                                className="grid gap-x-8 gap-y-3 border-t border-border px-2 py-7 transition-colors duration-150 hover:bg-hover sm:grid-cols-[160px_1fr]"
                            >
                                <div className="flex items-start justify-between gap-2 sm:flex-col sm:justify-start">
                                    <p className="kicker">{formatDate(entry.date)}</p>
                                    <div className="-mt-2 flex gap-1 sm:-ml-3 sm:mt-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(entry)}
                                            aria-label={`Edit entry for ${formatDate(entry.date)}`}
                                        >
                                            <Edit2 className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteClick(entry._id)}
                                            aria-label={`Delete entry for ${formatDate(entry.date)}`}
                                            className="hover:text-kicker"
                                        >
                                            <Trash2 className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                        </Button>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className="max-w-[68ch] whitespace-pre-wrap text-[17px] leading-relaxed text-body">{entry.summary}</p>
                                    {entry.highlights && entry.highlights.filter(Boolean).length > 0 && (
                                        <div className="mt-5">
                                            <p className="eyebrow">Highlights</p>
                                            <ul className="mt-2 space-y-1.5">
                                                {entry.highlights.map((highlight: string, idx: number) => (
                                                    <li key={idx} className="flex gap-2.5 text-[15px] text-body">
                                                        <span className="text-muted-foreground" aria-hidden>—</span>
                                                        <span>{highlight}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                )}

                {pagination && (
                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={setPage}
                        isLoading={isLoading}
                    />
                )}
            </PageShell>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Journal Entry" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="summary" className="block text-sm font-medium mb-1 text-foreground">
                            Summary
                        </label>
                        <Textarea
                            id="summary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            rows={6}
                            placeholder="How was your day? What happened?"
                           
                            required
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-foreground">Highlights</label>
                            <Button type="button" variant="outline" size="sm" onClick={addHighlight}>
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {highlights.map((highlight, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <Input
                                        value={highlight}
                                        onChange={(e) => updateHighlight(index, e.target.value)}
                                        placeholder="Enter a highlight..."
                                       
                                    />
                                    {highlights.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeHighlight(index)}
                                        >
                                            ×
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? '…' : 'Save'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingJournal(null); }} title="Edit Journal Entry" size="lg">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="editSummary" className="block text-sm font-medium mb-1 text-foreground">
                            Summary
                        </label>
                        <Textarea
                            id="editSummary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            rows={6}
                            placeholder="How was your day? What happened?"
                           
                            required
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-foreground">Highlights</label>
                            <Button type="button" variant="outline" size="sm" onClick={addHighlight}>
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {highlights.map((highlight, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <Input
                                        value={highlight}
                                        onChange={(e) => updateHighlight(index, e.target.value)}
                                        placeholder="Enter a highlight..."
                                       
                                    />
                                    {highlights.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeHighlight(index)}
                                           
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingJournal(null); }}>
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
                onClose={() => { setIsDeleteDialogOpen(false); setDeletingJournalId(null); }}
                onConfirm={handleDeleteConfirm}
                title="Delete Journal Entry"
                message="Are you sure you want to delete this journal entry? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />

        </>
    );
}
