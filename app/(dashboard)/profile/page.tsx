'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Trophy, Activity, Share2, Calendar } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { formatDate } from '@/lib/utils';
import { shareAchievement } from '@/lib/social/share';

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'activity' | 'achievements'>('activity');

    const { data: userData } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const res = await fetch('/api/users/me');
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
    });

    const { data: statsData } = useQuery({
        queryKey: ['user-stats'],
        queryFn: async () => {
            const res = await fetch('/api/analytics/summary?range=ytd');
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
    });

    const handleShare = async (type: 'daily-goal' | 'habit-streak' | 'study-session' | 'achievement', title: string, description: string, value?: string | number) => {
        await shareAchievement({
            type,
            title,
            description,
            value,
        });
    };

    const stats = statsData || {};
    const habits = stats.habits || {};
    const study = stats.study || {};

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-bold dark:text-white">Your Profile</h1>
                        </div>
                        <Link href="/settings">
                            <Button variant="ghost" size="icon">
                                <User className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
                {/* Profile Header */}
                <Card className="mb-6 dark:bg-gray-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                {userData?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold dark:text-white">{userData?.username || 'User'}</h2>
                                <p className="text-gray-600 dark:text-gray-400">{userData?.email}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm font-medium dark:text-white">
                                        {habits.totalHabits || 0} Habits
                                    </span>
                                    <span className="text-sm font-medium dark:text-white">
                                        {Math.round(study.totalHours || 0)}h Study
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6 border-b dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'activity'
                            ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        Activity
                    </button>
                    <button
                        onClick={() => setActiveTab('achievements')}
                        className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'achievements'
                            ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        Achievements
                    </button>
                </div>

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <div className="space-y-4">
                        <Card className="dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <Activity className="h-5 w-5" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                                <span className="text-white font-bold">+</span>
                                            </div>
                                            <div>
                                                <p className="font-medium dark:text-white">Daily goal completed!</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">All habits checked in today</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleShare('daily-goal', 'Daily Goal Completed', 'All habits checked in today')}
                                        >
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                                <span className="text-white font-bold">+</span>
                                            </div>
                                            <div>
                                                <p className="font-medium dark:text-white">Study session completed</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{Math.round(study.totalHours || 0)} hours this week</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleShare('study-session', 'Study Session', 'Great progress this week', Math.round(study.totalHours || 0))}
                                        >
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {habits.activeStreaks > 0 && (
                                        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                                                    <span className="text-white font-bold">🔥</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium dark:text-white">Streak maintained!</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{habits.activeStreaks} day streak active</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleShare('habit-streak', 'Habit Streak', 'Maintaining consistency', habits.activeStreaks)}
                                            >
                                                <Share2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                    <div className="space-y-4">
                        <Card className="dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <Trophy className="h-5 w-5" />
                                    Achievements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {habits.totalHabits > 0 && (
                                        <div className="p-4 border-2 border-yellow-400 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Trophy className="h-8 w-8 text-yellow-600 mb-2" />
                                                    <p className="font-bold dark:text-white">First Habit</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Created your first habit</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleShare('achievement', 'First Habit', 'Created your first habit!')}
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {habits.completionRate > 80 && (
                                        <div className="p-4 border-2 border-green-400 rounded-lg bg-green-50 dark:bg-green-900/20">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Trophy className="h-8 w-8 text-green-600 mb-2" />
                                                    <p className="font-bold dark:text-white">Consistency Master</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">80%+ completion rate</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleShare('achievement', 'Consistency Master', '80%+ completion rate achieved!')}
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {study.totalHours > 100 && (
                                        <div className="p-4 border-2 border-blue-400 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Trophy className="h-8 w-8 text-blue-600 mb-2" />
                                                    <p className="font-bold dark:text-white">Study Champion</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">100+ hours studied</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleShare('achievement', 'Study Champion', '100+ hours of study completed!')}
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
            <NavBar />
        </div>
    );
}

