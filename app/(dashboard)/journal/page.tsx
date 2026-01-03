'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast-provider';
import { ArrowLeft, Plus, FileText, Star, Edit2, Trash2, X } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { formatDate, getLocalDateString } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { handleApiResponse } from '@/lib/api/client';

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
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const createMutation = useMutation({
        mutationFn: async (journal: any) => {
            const res = await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(journal),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journal'] });
            setPage(1); // Reset to first page after creating new entry
            setIsModalOpen(false);
            setSummary('');
            setHighlights(['']);
            toast.success('Journal entry added successfully!');
        },
        onError: () => {
            toast.error('Failed to add journal entry. Please try again.');
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

        await createMutation.mutateAsync({
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
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30">
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                    Journal
                                </h1>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Entry
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-20">
                {isLoading ? (
                    <div className="text-center py-12 animate-pulse text-gray-400 dark:text-gray-500">Loading...</div>
                ) : journalEntries.length === 0 ? (
                    <Card className="border border-white/30 dark:border-white/10 shadow-xl bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl animate-fade-in">
                        <CardContent className="py-16 text-center">
                            <div className="bg-pink-100 dark:bg-pink-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 font-medium">No journal entries yet</p>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-xl"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Entry
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3 animate-fade-in">
                        {journalEntries.map((entry: any, index: number) => (
                            <Card
                                key={entry._id}
                                className="border border-white/30 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-200 bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <CardContent className="py-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-sm">
                                                <FileText className="h-6 w-6 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{formatDate(entry.date)}</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(entry)}
                                                className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(entry._id)}
                                                className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{entry.summary}</p>
                                        </div>
                                        {entry.highlights && entry.highlights.length > 0 && (
                                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                                                    <Star className="h-4 w-4 mr-1.5 text-yellow-500 dark:text-yellow-400" />
                                                    Highlights
                                                </h3>
                                                <ul className="space-y-2">
                                                    {entry.highlights.map((highlight: string, idx: number) => (
                                                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 dark:bg-pink-400 mr-2 mt-1.5 flex-shrink-0"></span>
                                                            <span>{highlight}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                {pagination && (
                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={setPage}
                        isLoading={isLoading}
                    />
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Journal Entry" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="summary" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Summary
                        </label>
                        <Textarea
                            id="summary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            rows={6}
                            placeholder="How was your day? What happened?"
                            className="rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Highlights</label>
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
                                        className="rounded-lg"
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
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-lg">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg"
                        >
                            {createMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingJournal(null); }} title="Edit Journal Entry" size="lg">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="editSummary" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Summary
                        </label>
                        <Textarea
                            id="editSummary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            rows={6}
                            placeholder="How was your day? What happened?"
                            className="rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Highlights</label>
                            <Button type="button" variant="outline" size="sm" onClick={addHighlight} className="rounded-lg">
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
                                        className="rounded-lg"
                                    />
                                    {highlights.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeHighlight(index)}
                                            className="rounded-lg"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingJournal(null); }} className="rounded-lg">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg"
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

            <NavBar />
        </div>
    );
}
