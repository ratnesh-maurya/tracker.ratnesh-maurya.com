'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { ArrowLeft, Plus, Bed } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { formatDate, formatTime } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';

export default function SleepPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [notes, setNotes] = useState('');
    const [page, setPage] = useState(1);

    const { data: sleepData, isLoading } = useQuery({
        queryKey: ['sleep', page],
        queryFn: async () => {
            const res = await fetch(`/api/sleep?page=${page}&limit=20`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
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
            setPage(1); // Reset to first page after creating new entry
            setIsModalOpen(false);
            setStartTime('');
            setEndTime('');
            setNotes('');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const today = new Date().toISOString().split('T')[0];
        await createMutation.mutateAsync({
            date: today,
            startTime: `${today}T${startTime}`,
            endTime: `${today}T${endTime}`,
            notes: notes || undefined,
        });
    };

    const sleepEntries = sleepData?.entries || [];
    const pagination = sleepData?.pagination;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-bold">Sleep</h1>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Log Sleep
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-20">
                {isLoading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : sleepEntries.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Bed className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">No sleep entries yet. Log your first sleep!</p>
                            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Log Sleep
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {sleepEntries.map((entry: any) => {
                            const duration = entry.duration || 0;
                            const hours = Math.floor(duration / 60);
                            const minutes = duration % 60;
                            return (
                                <Card key={entry._id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-xl">{formatDate(entry.date)}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Start:</span>
                                                <span className="font-semibold text-lg">{formatTime(entry.startTime)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">End:</span>
                                                <span className="font-semibold text-lg">{formatTime(entry.endTime)}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t">
                                                <span className="text-sm text-gray-600">Duration:</span>
                                                <span className="font-bold text-xl text-blue-600">{hours}h {minutes}m</span>
                                            </div>
                                            {entry.notes && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <p className="text-sm text-gray-600">{entry.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Sleep">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium mb-2">
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
                        <label htmlFor="endTime" className="block text-sm font-medium mb-2">
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
                        <label htmlFor="notes" className="block text-sm font-medium mb-2">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                            {createMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </Modal>
            <NavBar />
        </div>
    );
}
