'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Flame,
    Target,
    Bed,
    GraduationCap,
    Coffee,
    Share2,
    Sparkles,
    Trophy,
    Award,
    Zap,
    ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ActivityCalendar } from '@/components/ui/activity-calendar';

export function PublicProfilePageClient({ params }: { params: { username: string } }) {
    const { username } = params;

    const { data: profileData, isLoading, error } = useQuery({
        queryKey: ['public-profile', username],
        queryFn: async () => {
            const res = await fetch(`/api/users/${username}/public`, { cache: 'no-store' });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${profileData?.name || username}'s Progress Tracker`,
                text: `Check out ${profileData?.name || username}'s amazing progress!`,
                url: window.location.href,
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Profile link copied to clipboard!');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading profile...</div>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400">Profile not found or is private</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const stats = profileData.stats || {};
    const habits = stats.habits || {};
    const sleep = stats.sleep || {};
    const study = stats.study || {};
    const food = stats.food || {};

    // Calculate achievements
    const achievements = [];
    if (habits.totalHabits > 0) achievements.push({ icon: Trophy, title: 'First Steps', desc: 'Started tracking habits', color: 'text-yellow-600 dark:text-yellow-400' });
    if (habits.completionRate >= 80) achievements.push({ icon: Award, title: 'Consistency Master', desc: '80%+ completion rate', color: 'text-green-600 dark:text-green-400' });
    if (study.totalHours >= 100) achievements.push({ icon: GraduationCap, title: 'Study Champion', desc: '100+ hours studied', color: 'text-blue-600 dark:text-blue-400' });
    if (habits.activeStreaks >= 30) achievements.push({ icon: Flame, title: 'Streak Legend', desc: '30+ day streak', color: 'text-orange-600 dark:text-orange-400' });
    if (sleep.totalDays >= 100) achievements.push({ icon: Bed, title: 'Sleep Master', desc: '100+ days tracked', color: 'text-indigo-600 dark:text-indigo-400' });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header - Mobile Optimized */}
            <div className="border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
                    <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white text-xl md:text-2xl font-semibold shadow-lg flex-shrink-0">
                                {(profileData.name || username).charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-0.5 md:mb-1 truncate">
                                    {profileData.name || username}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">@{username}</p>
                                {profileData.createdAt && (
                                    <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 mt-0.5 md:mt-1">
                                        Member since {format(new Date(profileData.createdAt), 'MMMM yyyy')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={handleShare}
                            variant="outline"
                            size="sm"
                            className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 flex-shrink-0"
                        >
                            <Share2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Share</span>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 pb-20 md:pb-8">
                {/* Activity Calendar - Full Width */}
                <div className="mb-6 md:mb-8">
                    <ActivityCalendar
                        activities={profileData.dailyActivities || []}
                        currentStreak={habits.activeStreaks || 0}
                    />
                </div>

                {/* Bento Grid Layout - Mobile Optimized */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 auto-rows-fr">
                    {/* Streak Card - Large */}
                    <Card className="md:col-span-2 border-0 shadow-lg bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 hover:shadow-xl transition-all duration-300 group">
                        <CardContent className="p-4 md:p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <Flame className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                    </div>
                                    <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Current Streak</span>
                                </div>
                            </div>
                            <div className="flex-1 flex items-end">
                                <div>
                                    <p className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 mb-1 md:mb-2">
                                        {habits.activeStreaks || 0}
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">days of consistency</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completion Rate Card */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 hover:shadow-xl transition-all duration-300 group">
                        <CardContent className="p-4 md:p-6 h-full flex flex-col">
                            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <Target className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                </div>
                                <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Completion Rate</span>
                            </div>
                            <div className="flex-1 flex items-end">
                                <p className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">
                                    {habits.completionRate || 0}%
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Habits Card */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 hover:shadow-xl transition-all duration-300 group">
                        <CardContent className="p-4 md:p-6 h-full flex flex-col">
                            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                </div>
                                <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Total Habits</span>
                            </div>
                            <div className="flex-1 flex items-end">
                                <p className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-400">
                                    {habits.totalHabits || 0}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Study Progress Card - Large */}
                    <Card className="md:col-span-2 border-0 shadow-lg bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 dark:from-pink-950/20 dark:via-rose-950/20 dark:to-purple-950/20 hover:shadow-xl transition-all duration-300 group">
                        <CardContent className="p-4 md:p-6 h-full flex flex-col">
                            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                </div>
                                <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Study Progress</span>
                            </div>
                            <div className="flex-1 flex items-end gap-4 md:gap-8">
                                <div>
                                    <p className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent dark:from-pink-400 dark:via-rose-400 dark:to-purple-400 mb-1 md:mb-2">
                                        {study.totalHours || 0}
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">hours</p>
                                </div>
                                <div>
                                    <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent dark:from-pink-400 dark:via-rose-400 dark:to-purple-400 mb-1 md:mb-2">
                                        {study.totalSessions || 0}
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">sessions</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sleep Card */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 hover:shadow-xl transition-all duration-300 group">
                        <CardContent className="p-4 md:p-6 h-full flex flex-col">
                            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <Bed className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                </div>
                                <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Sleep Tracked</span>
                            </div>
                            <div className="flex-1 flex items-end">
                                <div>
                                    <p className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400 mb-1 md:mb-2">
                                        {sleep.totalDays || 0}
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">days</p>
                                    {sleep.averageHours > 0 && (
                                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-500 mt-0.5 md:mt-1">Avg: {sleep.averageHours}h</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Food Card */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 hover:shadow-xl transition-all duration-300 group">
                        <CardContent className="p-4 md:p-6 h-full flex flex-col">
                            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <Coffee className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                </div>
                                <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Meals Logged</span>
                            </div>
                            <div className="flex-1 flex items-end">
                                <p className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
                                    {food.totalMeals || 0}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Achievements Card - Full Width */}
                    {achievements.length > 0 && (
                        <Card className="md:col-span-2 lg:col-span-3 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-4 md:p-6">
                                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-md">
                                        <Trophy className="h-4 w-4 md:h-5 md:w-5 text-white" />
                                    </div>
                                    <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Achievements</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                    {achievements.map((achievement, index) => {
                                        const Icon = achievement.icon;
                                        return (
                                            <div
                                                key={index}
                                                className="border-0 rounded-xl p-4 md:p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                                            >
                                                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br ${achievement.color.includes('yellow') ? 'from-yellow-400 to-yellow-600' : achievement.color.includes('green') ? 'from-green-400 to-green-600' : achievement.color.includes('blue') ? 'from-blue-400 to-blue-600' : achievement.color.includes('orange') ? 'from-orange-400 to-orange-600' : 'from-indigo-400 to-indigo-600'} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                                        <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                                                    </div>
                                                    <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white">{achievement.title}</h3>
                                                </div>
                                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 ml-10 md:ml-13">{achievement.desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Call to Action Card - Full Width */}
                    <Card className="md:col-span-2 lg:col-span-3 border-0 shadow-lg bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20"></div>
                        <CardContent className="p-6 md:p-8 text-center relative z-10">
                            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Zap className="h-6 w-6 md:h-8 md:w-8 text-white" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Start Your Journey</h2>
                            <p className="text-purple-100 mb-4 md:mb-6 text-sm md:text-lg">Join thousands tracking their habits and achieving their goals</p>
                            <a
                                href="/register"
                                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-purple-600 hover:bg-gray-50 rounded-lg md:rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg text-sm md:text-base"
                            >
                                Get Started Free
                                <ArrowUpRight className="h-4 w-4" />
                            </a>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

