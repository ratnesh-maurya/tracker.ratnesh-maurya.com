'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast-provider';
import { PendingTag } from '@/components/ui/pending-tag';
import { SAVED_OFFLINE_MESSAGE, useOfflineCreate } from '@/lib/offline/useOfflineCreate';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { formatDate, getLocalDateString } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { Chip } from '@/components/ui/chip';
import { handleApiResponse } from '@/lib/api/client';
import { EmptyState, PageHeader, PageShell, Section, Stat } from '@/components/layout/page';

const TOPIC_OPTIONS = ['DSA', 'Golang', 'System Design', 'Other'];
const TAG_OPTIONS = ['golang', 'dsa', 'LLD', 'HLD', 'leetcode', 'codechef'];

export default function StudyPage() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingStudy, setEditingStudy] = useState<any>(null);
    const [deletingStudyId, setDeletingStudyId] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [timeSpent, setTimeSpent] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customTags, setCustomTags] = useState('');
    const [projectReference, setProjectReference] = useState('');
    const [notes, setNotes] = useState('');

    const [page, setPage] = useState(1);
    const limit = 20;

    const { data: studyData, isLoading } = useQuery({
        queryKey: ['study', page],
        queryFn: async () => {
            const res = await fetch(`/api/study?page=${page}&limit=${limit}`, { cache: 'no-store' });
            return handleApiResponse(res);
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Goes through the offline queue: works without a connection, syncs later
    const createMutation = useOfflineCreate('study', {
        optimistic: true,
        onSaved: (queued) => {
            setPage(1); // Reset to first page after creating new entry
            setIsModalOpen(false);
            setSelectedTopic('');
            setCustomTopic('');
            setTimeSpent('');
            setSelectedTags([]);
            setCustomTags('');
            setProjectReference('');
            setNotes('');
            toast.success(queued ? SAVED_OFFLINE_MESSAGE : 'Study entry added successfully!');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, study }: { id: string; study: any }) => {
            const res = await fetch(`/api/study/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(study),
            });
            return handleApiResponse(res);
        },
        onSuccess: async () => {
            // Remove and refetch all study queries
            queryClient.removeQueries({ queryKey: ['study'] });
            await queryClient.refetchQueries({ queryKey: ['study'], type: 'active' });
            setIsEditModalOpen(false);
            setEditingStudy(null);
            setSelectedTopic('');
            setCustomTopic('');
            setTimeSpent('');
            setSelectedTags([]);
            setCustomTags('');
            setProjectReference('');
            setNotes('');
            toast.success('Study entry updated successfully!');
        },
        onError: () => {
            toast.error('Failed to update study entry. Please try again.');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/study/${id}`, {
                method: 'DELETE',
            });
            return handleApiResponse(res);
        },
        onSuccess: async () => {
            // Remove all study queries from cache and refetch
            queryClient.removeQueries({ queryKey: ['study'] });
            await queryClient.refetchQueries({ queryKey: ['study'], type: 'active' });
            setIsDeleteDialogOpen(false);
            setDeletingStudyId(null);
            toast.success('Study entry deleted successfully!');
        },
        onError: () => {
            toast.error('Failed to delete study entry. Please try again.');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate topic
        if (!selectedTopic) {
            alert('Please select a topic');
            return;
        }
        if (selectedTopic === 'Other' && !customTopic.trim()) {
            alert('Please enter a custom topic');
            return;
        }

        const today = getLocalDateString();
        const finalTopic = selectedTopic === 'Other' ? customTopic.trim() : selectedTopic;

        // Combine selected chip tags with custom tags
        const customTagArray = customTags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t !== '');
        const allTags = [...selectedTags, ...customTagArray];

        createMutation.create({
            date: today,
            topic: finalTopic,
            timeSpent: parseInt(timeSpent),
            tags: allTags,
            projectReference: projectReference || undefined,
            notes: notes || undefined,
        });
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const selectTopic = (topic: string) => {
        setSelectedTopic(topic);
        if (topic !== 'Other') {
            setCustomTopic('');
        }
    };

    const handleEdit = (entry: any) => {
        setEditingStudy(entry);
        const topic = entry.topic;
        const isOther = !TOPIC_OPTIONS.slice(0, -1).includes(topic);
        setSelectedTopic(isOther ? 'Other' : topic);
        setCustomTopic(isOther ? topic : '');
        setTimeSpent(entry.timeSpent?.toString() || '');
        const entryTags = entry.tags || [];
        const chipTags = entryTags.filter((t: string) => TAG_OPTIONS.includes(t));
        const customTagList = entryTags.filter((t: string) => !TAG_OPTIONS.includes(t));
        setSelectedTags(chipTags);
        setCustomTags(customTagList.join(', '));
        setProjectReference(entry.projectReference || '');
        setNotes(entry.notes || '');
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudy) return;

        if (!selectedTopic) {
            toast.warning('Please select a topic');
            return;
        }
        if (selectedTopic === 'Other' && !customTopic.trim()) {
            toast.warning('Please enter a custom topic');
            return;
        }

        const finalTopic = selectedTopic === 'Other' ? customTopic.trim() : selectedTopic;
        const customTagArray = customTags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t !== '');
        const allTags = [...selectedTags, ...customTagArray];

        await updateMutation.mutateAsync({
            id: editingStudy._id,
            study: {
                topic: finalTopic,
                timeSpent: parseInt(timeSpent),
                tags: allTags,
                projectReference: projectReference || undefined,
                notes: notes || undefined,
            },
        });
    };

    const handleDeleteClick = (id: string) => {
        setDeletingStudyId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingStudyId) {
            await deleteMutation.mutateAsync(deletingStudyId);
        }
    };

    const studyEntries = (studyData as any)?.entries || [];
    const pagination = (studyData as any)?.pagination;
    const totalHours = studyEntries.reduce((sum: number, entry: any) => sum + (entry.timeSpent || 0), 0) / 60;

    return (
        <>
            <PageShell>
                <PageHeader
                    kicker="§ 05 · Study"
                    title={<>What I <em>learned</em></>}
                    action={
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                            Log study
                        </Button>
                    }
                />

                {studyEntries.length > 0 && (
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
                        <Stat label="hours on this page" value={totalHours.toFixed(1)} className="border-t border-border pt-4" />
                        <Stat label="sessions" value={studyEntries.length} className="border-t border-border pt-4" />
                    </dl>
                )}

                <Section kicker="§ 01 · Sessions" className="mt-12">
                    {isLoading ? (
                        <p className="py-12 text-center font-mono text-sm text-muted-foreground animate-pulse">loading…</p>
                    ) : studyEntries.length === 0 ? (
                        <EmptyState
                            action={
                                <Button onClick={() => setIsModalOpen(true)}>
                                    <Plus className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                    Log study
                                </Button>
                            }
                        >
                            No study sessions yet.
                        </EmptyState>
                    ) : (
                        <ul className="border-b border-border">
                            {studyEntries.map((entry: any) => {
                                const hours = Math.floor(entry.timeSpent / 60);
                                const minutes = entry.timeSpent % 60;
                                return (
                                    <li
                                        key={entry._id}
                                        className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-t border-border px-2 py-5 transition-colors duration-150 hover:bg-hover sm:grid-cols-[140px_1fr_auto]"
                                    >
                                        <p className="col-start-1 row-start-1 pt-2 font-mono text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                                        <div className="col-span-2 row-start-2 min-w-0 sm:col-span-1 sm:row-start-1 sm:col-start-2">
                                            <h3 className="font-display text-[26px] leading-[1.1] sm:text-[30px]">{entry.topic}</h3>
                                            {entry.tags && entry.tags.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                    {entry.tags.map((tag: string, idx: number) => (
                                                        <span key={idx} className="rounded-full bg-muted px-2.5 py-1 font-mono text-[12.5px] text-muted-foreground">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {entry.projectReference && (
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    project — <span className="text-body">{entry.projectReference}</span>
                                                </p>
                                            )}
                                            {entry.notes && <p className="mt-2 max-w-lede text-[15px] text-body">{entry.notes}</p>}
                                        </div>
                                        <div className="col-start-2 row-start-1 flex items-start justify-end gap-1 sm:col-start-3">
                                            <span className="mr-2 font-display text-[26px] leading-none sm:text-[30px]">
                                                {hours}h {minutes}m
                                            </span>
                                            {entry.pending ? (
                                                <PendingTag />
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(entry)}
                                                        aria-label={`Edit ${entry.topic}`}
                                                        className="-mt-2"
                                                    >
                                                        <Edit2 className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteClick(entry._id)}
                                                        aria-label={`Delete ${entry.topic}`}
                                                        className="-mt-2 hover:text-kicker"
                                                    >
                                                        <Trash2 className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {pagination && pagination.totalPages > 1 && (
                        <Pagination
                            page={page}
                            totalPages={pagination.totalPages}
                            onPageChange={setPage}
                            isLoading={isLoading}
                        />
                    )}
                </Section>
            </PageShell>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Study Session" size="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">
                            Topic / What did you study?
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {TOPIC_OPTIONS.map((option) => (
                                <Chip
                                    key={option}
                                    label={option}
                                    selected={selectedTopic === option}
                                    onClick={() => selectTopic(option)}
                                />
                            ))}
                        </div>
                        {selectedTopic === 'Other' && (
                            <Input
                                id="customTopic"
                                value={customTopic}
                                onChange={(e) => setCustomTopic(e.target.value)}
                                placeholder="Enter your custom topic"
                                className="mt-2"
                                required
                            />
                        )}
                    </div>
                    <div>
                        <label htmlFor="timeSpent" className="block text-sm font-medium mb-1 text-foreground">
                            Time Spent (minutes)
                        </label>
                        <Input
                            id="timeSpent"
                            type="number"
                            min="1"
                            value={timeSpent}
                            onChange={(e) => setTimeSpent(e.target.value)}
                           
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {TAG_OPTIONS.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    selected={selectedTags.includes(tag)}
                                    onClick={() => toggleTag(tag)}
                                />
                            ))}
                        </div>
                        <div>
                            <label htmlFor="customTags" className="block text-xs text-muted-foreground mb-1">
                                Add custom tags (comma-separated)
                            </label>
                            <Input
                                id="customTags"
                                value={customTags}
                                onChange={(e) => setCustomTags(e.target.value)}
                                placeholder="e.g., react, nodejs, mongodb"
                                className="text-sm"
                            />
                        </div>
                        {(selectedTags.length > 0 || customTags.trim()) && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Selected: {selectedTags.join(', ')}
                                {selectedTags.length > 0 && customTags.trim() && ', '}
                                {customTags.split(',').map((t) => t.trim()).filter((t) => t !== '').join(', ')}
                            </p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="projectReference" className="block text-sm font-medium mb-1 text-foreground">
                            Project Reference (optional)
                        </label>
                        <Input
                            id="projectReference"
                            value={projectReference}
                            onChange={(e) => setProjectReference(e.target.value)}
                            placeholder="e.g., Personal Tracker App"
                           
                        />
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium mb-1 text-foreground">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            placeholder="What did you learn? Any insights?"
                           
                        />
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

            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingStudy(null); }} title="Edit Study Entry" size="lg">
                <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">
                            Topic / What did you study?
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {TOPIC_OPTIONS.map((option) => (
                                <Chip
                                    key={option}
                                    label={option}
                                    selected={selectedTopic === option}
                                    onClick={() => selectTopic(option)}
                                />
                            ))}
                        </div>
                        {selectedTopic === 'Other' && (
                            <Input
                                id="editCustomTopic"
                                value={customTopic}
                                onChange={(e) => setCustomTopic(e.target.value)}
                                placeholder="Enter your custom topic"
                                className="mt-2"
                                required
                            />
                        )}
                    </div>
                    <div>
                        <label htmlFor="editTimeSpent" className="block text-sm font-medium mb-1 text-foreground">
                            Time Spent (minutes)
                        </label>
                        <Input
                            id="editTimeSpent"
                            type="number"
                            min="1"
                            value={timeSpent}
                            onChange={(e) => setTimeSpent(e.target.value)}
                           
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {TAG_OPTIONS.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    selected={selectedTags.includes(tag)}
                                    onClick={() => toggleTag(tag)}
                                />
                            ))}
                        </div>
                        <div>
                            <label htmlFor="editCustomTags" className="block text-xs text-muted-foreground mb-1">
                                Add custom tags (comma-separated)
                            </label>
                            <Input
                                id="editCustomTags"
                                value={customTags}
                                onChange={(e) => setCustomTags(e.target.value)}
                                placeholder="e.g., react, nodejs, mongodb"
                                className="text-sm"
                            />
                        </div>
                        {(selectedTags.length > 0 || customTags.trim()) && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Selected: {selectedTags.join(', ')}
                                {selectedTags.length > 0 && customTags.trim() && ', '}
                                {customTags.split(',').map((t) => t.trim()).filter((t) => t !== '').join(', ')}
                            </p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="editProjectReference" className="block text-sm font-medium mb-1 text-foreground">
                            Project Reference (optional)
                        </label>
                        <Input
                            id="editProjectReference"
                            value={projectReference}
                            onChange={(e) => setProjectReference(e.target.value)}
                            placeholder="e.g., Personal Tracker App"
                           
                        />
                    </div>
                    <div>
                        <label htmlFor="editNotes" className="block text-sm font-medium mb-1 text-foreground">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="editNotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            placeholder="What did you learn? Any insights?"
                           
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingStudy(null); }}>
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
                onClose={() => { setIsDeleteDialogOpen(false); setDeletingStudyId(null); }}
                onConfirm={handleDeleteConfirm}
                title="Delete Study Entry"
                message="Are you sure you want to delete this study entry? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />

        </>
    );
}
