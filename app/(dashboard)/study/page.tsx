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
                                    Study
                                </h1>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Log Study
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-20">
                {studyEntries.length > 0 && (
                    <div className="animate-fade-in mb-6">
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <CardContent className="py-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm mb-1 font-medium">Total Study Time</p>
                                        <p className="text-3xl font-bold">{totalHours.toFixed(1)} hours</p>
                                    </div>
                                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                                        <GraduationCap className="h-8 w-8" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-12 animate-pulse text-gray-400">Loading...</div>
                ) : studyEntries.length === 0 ? (
                    <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm animate-fade-in">
                        <CardContent className="py-16 text-center">
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GraduationCap className="h-8 w-8 text-purple-600" />
                            </div>
                            <p className="text-gray-600 mb-4 font-medium">No study entries yet</p>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Log Study
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3 animate-fade-in">
                        {studyEntries.map((entry: any, index: number) => {
                            const hours = Math.floor(entry.timeSpent / 60);
                            const minutes = entry.timeSpent % 60;
                            return (
                                <Card
                                    key={entry._id}
                                    className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/90 backdrop-blur-sm rounded-xl animate-slide-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <CardContent className="py-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3 flex-1">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-sm">
                                                    <GraduationCap className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg text-gray-800">{entry.topic}</h3>
                                                    <p className="text-sm text-gray-500 mt-0.5">{formatDate(entry.date)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {hours}h {minutes}m
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {entry.tags && entry.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {entry.tags.map((tag: string, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-purple-100 text-purple-800 font-medium"
                                                        >
                                                            <Tag className="h-3 w-3 mr-1" />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {entry.projectReference && (
                                                <div className="text-sm">
                                                    <span className="text-gray-600">Project: </span>
                                                    <span className="font-medium text-gray-800">{entry.projectReference}</span>
                                                </div>
                                            )}
                                            {entry.notes && (
                                                <p className="text-sm text-gray-700 mt-2 border-t border-gray-100 pt-2">{entry.notes}</p>
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
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
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
                                className="mt-2 rounded-lg"
                                required
                            />
                        )}
                    </div>
                    <div>
                        <label htmlFor="timeSpent" className="block text-sm font-medium mb-1 text-gray-700">
                            Time Spent (minutes)
                        </label>
                        <Input
                            id="timeSpent"
                            type="number"
                            min="1"
                            value={timeSpent}
                            onChange={(e) => setTimeSpent(e.target.value)}
                            className="rounded-lg"
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
                                className="text-sm rounded-lg"
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
                        <label htmlFor="projectReference" className="block text-sm font-medium mb-1 text-gray-700">
                            Project Reference (optional)
                        </label>
                        <Input
                            id="projectReference"
                            value={projectReference}
                            onChange={(e) => setProjectReference(e.target.value)}
                            placeholder="e.g., Personal Tracker App"
                            className="rounded-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium mb-1 text-gray-700">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            placeholder="What did you learn? Any insights?"
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
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg"
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
