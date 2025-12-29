'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { ArrowLeft, Plus, FileText, Star } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';

export default function JournalPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [summary, setSummary] = useState('');
    const [highlights, setHighlights] = useState(['']);
    const [page, setPage] = useState(1);

    const { data: journalData, isLoading } = useQuery({
        queryKey: ['journal', page],
        queryFn: async () => {
            const res = await fetch(`/api/journal?page=${page}&limit=20`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
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
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const filteredHighlights = highlights.filter((h) => h.trim() !== '');
        const today = new Date().toISOString().split('T')[0];

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

    const journalEntries = journalData?.entries || [];
    const pagination = journalData?.pagination;

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
                            <h1 className="text-2xl font-bold">Journal</h1>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Entry
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
                {isLoading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : journalEntries.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">No journal entries yet. Write your first entry!</p>
                            <Button onClick={() => setIsModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Entry
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {journalEntries.map((entry: any) => (
                            <Card key={entry._id}>
                                <CardHeader>
                                    <CardTitle>{formatDate(entry.date)}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-gray-700 whitespace-pre-wrap">{entry.summary}</p>
                                        </div>
                                        {entry.highlights && entry.highlights.length > 0 && (
                                            <div className="border-t pt-4">
                                                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                                    Highlights
                                                </h3>
                                                <ul className="space-y-1">
                                                    {entry.highlights.map((highlight: string, idx: number) => (
                                                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                                                            <span className="mr-2">•</span>
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
                        <label htmlFor="summary" className="block text-sm font-medium mb-1">
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
                            <label className="block text-sm font-medium">Highlights</label>
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
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </Modal>
            <NavBar />
        </div>
    );
}
