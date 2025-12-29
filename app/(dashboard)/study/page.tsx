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

export default function StudyPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topic, setTopic] = useState('');
    const [timeSpent, setTimeSpent] = useState('');
    const [tags, setTags] = useState('');
    const [projectReference, setProjectReference] = useState('');
    const [notes, setNotes] = useState('');

    const { data: studyData, isLoading } = useQuery({
        queryKey: ['study'],
        queryFn: async () => {
            const res = await fetch('/api/study');
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
            setIsModalOpen(false);
            setTopic('');
            setTimeSpent('');
            setTags('');
            setProjectReference('');
            setNotes('');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const today = new Date().toISOString().split('T')[0];
        const tagArray = tags.split(',').map((t) => t.trim()).filter((t) => t !== '');

        await createMutation.mutateAsync({
            date: today,
            topic,
            timeSpent: parseInt(timeSpent),
            tags: tagArray,
            projectReference: projectReference || undefined,
            notes: notes || undefined,
        });
    };

    const studyEntries = studyData || [];
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
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
            </main>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Study Session" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium mb-1">
                            Topic / What did you study?
                        </label>
                        <Input
                            id="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., DSA, Backend Development, System Design"
                            required
                        />
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
                        <label htmlFor="tags" className="block text-sm font-medium mb-1">
                            Tags (comma-separated)
                        </label>
                        <Input
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g., DSA, Backend, Golang"
                        />
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
