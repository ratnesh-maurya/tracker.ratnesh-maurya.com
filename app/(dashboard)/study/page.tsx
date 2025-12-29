'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { ArrowLeft, Plus, GraduationCap, Tag } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { Chip } from '@/components/ui/chip';

const TOPIC_OPTIONS = ['DSA', 'Golang', 'System Design', 'Other'];
const TAG_OPTIONS = ['golang', 'dsa', 'LLD', 'HLD', 'leetcode', 'codechef'];

export default function StudyPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
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
            const res = await fetch(`/api/study?page=${page}&limit=${limit}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (study: any) => {
            const res = await fetch('/api/study', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(study),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['study'] });
            setPage(1); // Reset to first page after creating new entry
            setIsModalOpen(false);
            setSelectedTopic('');
            setCustomTopic('');
            setTimeSpent('');
            setSelectedTags([]);
            setCustomTags('');
            setProjectReference('');
            setNotes('');
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

        const today = new Date().toISOString().split('T')[0];
        const finalTopic = selectedTopic === 'Other' ? customTopic.trim() : selectedTopic;

        // Combine selected chip tags with custom tags
        const customTagArray = customTags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t !== '');
        const allTags = [...selectedTags, ...customTagArray];

        await createMutation.mutateAsync({
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

    const studyEntries = studyData?.entries || [];
    const pagination = studyData?.pagination;
    const totalHours = studyEntries.reduce((sum: number, entry: any) => sum + (entry.timeSpent || 0), 0) / 60;

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
                            <h1 className="text-2xl font-bold">Study</h1>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Log Study
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-20">
                {studyEntries.length > 0 && (
                    <Card className="mb-6">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Study Time</span>
                                <span className="text-2xl font-bold">{totalHours.toFixed(1)} hours</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isLoading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : studyEntries.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">No study entries yet. Log your first study session!</p>
                            <Button onClick={() => setIsModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Log Study
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {studyEntries.map((entry: any) => {
                            const hours = Math.floor(entry.timeSpent / 60);
                            const minutes = entry.timeSpent % 60;
                            return (
                                <Card key={entry._id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle>{entry.topic}</CardTitle>
                                                <p className="text-sm text-gray-500 mt-1">{formatDate(entry.date)}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold">
                                                    {hours}h {minutes}m
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {entry.tags && entry.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {entry.tags.map((tag: string, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
                                                        >
                                                            <Tag className="h-3 w-3 mr-1" />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {entry.projectReference && (
                                                <div>
                                                    <span className="text-sm text-gray-600">Project: </span>
                                                    <span className="text-sm font-medium">{entry.projectReference}</span>
                                                </div>
                                            )}
                                            {entry.notes && (
                                                <p className="text-sm text-gray-700 mt-2">{entry.notes}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            page={page}
                            totalPages={pagination.totalPages}
                            onPageChange={setPage}
                            isLoading={isLoading}
                        />
                    </div>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Study Session" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
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
                        <label htmlFor="timeSpent" className="block text-sm font-medium mb-1">
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
                        <label className="block text-sm font-medium mb-2">
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
                            <label htmlFor="customTags" className="block text-xs text-gray-600 mb-1">
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
                            <p className="text-xs text-gray-500 mt-2">
                                Selected: {selectedTags.join(', ')}
                                {selectedTags.length > 0 && customTags.trim() && ', '}
                                {customTags.split(',').map((t) => t.trim()).filter((t) => t !== '').join(', ')}
                            </p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="projectReference" className="block text-sm font-medium mb-1">
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
                        <label htmlFor="notes" className="block text-sm font-medium mb-1">
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
