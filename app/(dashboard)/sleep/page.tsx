'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast-provider';
import { ArrowLeft, Plus, Bed, Edit2, Trash2 } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
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
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const createMutation = useMutation({
        mutationFn: async (sleep: { date: string; startTime: string; endTime: string; notes?: string }) => {
            const res = await fetch('/api/sleep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sleep),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sleep'] });
            setPage(1);
            setIsModalOpen(false);
            setStartTime('');
            setEndTime('');
            setNotes('');
            toast.success('Sleep entry added successfully!');
        },
        onError: () => {
            toast.error('Failed to add sleep entry. Please try again.');
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
        await createMutation.mutateAsync({
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
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
                                    Sleep
                                </h1>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Log Sleep
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-20">
                {isLoading ? (
                    <div className="space-y-3">
                        <SkeletonList count={5} />
                    </div>
                ) : sleepEntries.length === 0 ? (
                    <Card className="border border-white/30 dark:border-white/10 shadow-xl bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl animate-fade-in">
                        <CardContent className="py-16 text-center">
                            <div className="bg-indigo-100 dark:bg-indigo-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bed className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 font-medium">No sleep entries yet</p>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Log Sleep
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3 animate-fade-in">
                        {sleepEntries.map((entry: any, index: number) => {
                            const duration = entry.duration || 0;
                            const hours = Math.floor(duration / 60);
                            const minutes = duration % 60;
                            return (
                                <Card
                                    key={entry._id}
                                    className="border border-white/30 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-200 bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl animate-slide-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <CardContent className="py-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shadow-sm">
                                                    <Bed className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{formatDate(entry.date)}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                        {hours}h {minutes}m
                                                    </div>
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
                                        </div>
                                        {entry.notes && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{entry.notes}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
                {pagination && (
                    <div className="mt-6">
                        <Pagination
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={setPage}
                            isLoading={isLoading}
                        />
                    </div>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Sleep">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Start Time
                        </label>
                        <Input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                            className="text-lg rounded-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            End Time
                        </label>
                        <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                            className="text-lg rounded-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="rounded-lg"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-lg">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg"
                        >
                            {createMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingSleep(null); }} title="Edit Sleep Entry">
                <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="editStartTime" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Start Time
                        </label>
                        <Input
                            id="editStartTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                            className="text-lg rounded-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="editEndTime" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            End Time
                        </label>
                        <Input
                            id="editEndTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                            className="text-lg rounded-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="editNotes" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="editNotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="rounded-lg"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingSleep(null); }} className="rounded-lg">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg"
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

            <NavBar />
        </div>
    );
}
