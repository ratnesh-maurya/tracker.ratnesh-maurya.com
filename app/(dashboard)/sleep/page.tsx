'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
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
            setPage(1);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 transition-smooth">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
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
                    <div className="text-center py-12 animate-pulse text-gray-400">Loading...</div>
                ) : sleepEntries.length === 0 ? (
                    <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm animate-fade-in">
                        <CardContent className="py-16 text-center">
                            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bed className="h-8 w-8 text-indigo-600" />
                            </div>
                            <p className="text-gray-600 mb-4 font-medium">No sleep entries yet</p>
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
                                    className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/90 backdrop-blur-sm rounded-xl animate-slide-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <CardContent className="py-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shadow-sm">
                                                    <Bed className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg text-gray-800">{formatDate(entry.date)}</h3>
                                                    <p className="text-sm text-gray-500">{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-indigo-600">
                                                    {hours}h {minutes}m
                                                </div>
                                            </div>
                                        </div>
                                        {entry.notes && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <p className="text-sm text-gray-600">{entry.notes}</p>
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
                        <label htmlFor="startTime" className="block text-sm font-medium mb-2 text-gray-700">
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
                        <label htmlFor="endTime" className="block text-sm font-medium mb-2 text-gray-700">
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
                        <label htmlFor="notes" className="block text-sm font-medium mb-2 text-gray-700">
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
            <NavBar />
        </div>
    );
}
