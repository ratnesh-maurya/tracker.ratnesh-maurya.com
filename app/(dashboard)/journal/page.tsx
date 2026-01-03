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
                    <div className="text-center py-12 animate-pulse text-gray-400">Loading...</div>
                ) : journalEntries.length === 0 ? (
                    <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm animate-fade-in">
                        <CardContent className="py-16 text-center">
                            <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-pink-600" />
                            </div>
                            <p className="text-gray-600 mb-4 font-medium">No journal entries yet</p>
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
                                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/90 backdrop-blur-sm rounded-xl animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <CardContent className="py-5">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-sm">
                                            <FileText className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-lg text-gray-800">{formatDate(entry.date)}</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{entry.summary}</p>
                                        </div>
                                        {entry.highlights && entry.highlights.length > 0 && (
                                            <div className="border-t border-gray-100 pt-4">
                                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                    <Star className="h-4 w-4 mr-1.5 text-yellow-500" />
                                                    Highlights
                                                </h3>
                                                <ul className="space-y-2">
                                                    {entry.highlights.map((highlight: string, idx: number) => (
                                                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mr-2 mt-1.5 flex-shrink-0"></span>
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
                        <label htmlFor="summary" className="block text-sm font-medium mb-1 text-gray-700">
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
            <NavBar />
        </div>
    );
}
