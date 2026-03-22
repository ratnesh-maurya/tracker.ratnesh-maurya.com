'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Trophy, Activity, ExternalLink } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { SocialShare } from '@/components/ui/social-share';

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

    const username = (userData as any)?.username || 'user';
    const name = (userData as any)?.name;

    const stats = statsData || {};
    const habits = stats.habits || {};
    const study = stats.study || {};

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {(userData as any)?.username && (userData as any)?.profilePublic && (
                                <Link href={`/u/${(userData as any).username}`} target="_blank">
                                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Public</span>
                                    </Button>
                                </Link>
                            )}
                            <Link href="/settings">
                                <Button variant="ghost" size="icon">
                                    <User className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
                {/* Profile Header */}
                <Card className="mb-6 border border-border bg-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                                {(userData as any)?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-foreground">{(userData as any)?.username || 'User'}</h2>
                                <p className="text-muted-foreground text-sm truncate">{(userData as any)?.email}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm font-semibold text-foreground">{habits.totalHabits || 0} <span className="font-normal text-muted-foreground">Habits</span></span>
                                    <span className="text-sm font-semibold text-foreground">{Math.round(study.totalHours || 0)}h <span className="font-normal text-muted-foreground">Study</span></span>
                                    {habits.activeStreaks > 0 && (
                                        <span className="text-sm font-semibold text-orange-500">🔥 {habits.activeStreaks} <span className="font-normal text-muted-foreground">streak</span></span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 border-b border-border">
                    {(['activity', 'achievements'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-4 font-medium text-sm capitalize transition-colors ${activeTab === tab
                                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <Card className="border border-border bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground text-base">
                                <Activity className="h-4 w-4" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-100 dark:border-green-900/40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center text-white font-bold text-lg">🎯</div>
                                        <div>
                                            <p className="font-medium text-foreground text-sm">Daily goal completed!</p>
                                            <p className="text-xs text-muted-foreground">All habits checked in today</p>
                                        </div>
                                    </div>
                                    <SocialShare data={{ username, name, type: 'daily-goal', title: 'Daily Goal', subtitle: 'All habits done today!', emoji: '🎯', color: 'green' }} />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-lg">📚</div>
                                        <div>
                                            <p className="font-medium text-foreground text-sm">Study sessions this year</p>
                                            <p className="text-xs text-muted-foreground">{Math.round(study.totalHours || 0)} hours total</p>
                                        </div>
                                    </div>
                                    <SocialShare data={{ username, name, type: 'study', title: 'Study Hours', subtitle: `${Math.round(study.totalHours || 0)}h of deep work`, value: Math.round(study.totalHours || 0), emoji: '📚', color: 'blue' }} />
                                </div>

                                {habits.activeStreaks > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-100 dark:border-orange-900/40">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-lg">🔥</div>
                                            <div>
                                                <p className="font-medium text-foreground text-sm">Streak maintained!</p>
                                                <p className="text-xs text-muted-foreground">{habits.activeStreaks} days in a row</p>
                                            </div>
                                        </div>
                                        <SocialShare data={{ username, name, type: 'streak', title: 'On Fire!', subtitle: `${habits.activeStreaks} day streak`, value: habits.activeStreaks, emoji: '🔥', color: 'orange' }} />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                    <Card className="border border-border bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground text-base">
                                <Trophy className="h-4 w-4" />
                                Achievements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {habits.totalHabits > 0 && (
                                    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                                                <Trophy className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground text-sm">First Habit</p>
                                                <p className="text-xs text-muted-foreground">Created your first habit</p>
                                            </div>
                                        </div>
                                        <SocialShare data={{ username, name, type: 'achievement', title: 'First Habit', subtitle: 'Started my habit journey!', emoji: '🏆', color: 'indigo' }} />
                                    </div>
                                )}
                                {habits.completionRate > 80 && (
                                    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                                <Trophy className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground text-sm">Consistency Master</p>
                                                <p className="text-xs text-muted-foreground">{habits.completionRate?.toFixed(0)}% completion rate</p>
                                            </div>
                                        </div>
                                        <SocialShare data={{ username, name, type: 'achievement', title: 'Consistency Master', subtitle: `${habits.completionRate?.toFixed(0)}% completion rate!`, value: habits.completionRate?.toFixed(0) + '%', emoji: '⚡', color: 'green' }} />
                                    </div>
                                )}
                                {study.totalHours > 100 && (
                                    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                                <Trophy className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground text-sm">Study Champion</p>
                                                <p className="text-xs text-muted-foreground">{Math.round(study.totalHours)}h of deep study</p>
                                            </div>
                                        </div>
                                        <SocialShare data={{ username, name, type: 'achievement', title: 'Study Champion', subtitle: '100+ hours of deep study!', value: Math.round(study.totalHours), emoji: '📚', color: 'blue' }} />
                                    </div>
                                )}
                                {habits.totalHabits === 0 && habits.completionRate <= 80 && study.totalHours <= 100 && (
                                    <div className="md:col-span-2 text-center py-10 text-muted-foreground">
                                        <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">Keep tracking to unlock achievements!</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
            <NavBar />
        </div>
    );
}

