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
    Sparkles,
    Trophy,
    Award,
    Zap,
    Crown,
    Star,
    Rocket,
    Sprout,
    ArrowUpRight,
    Download,
    Copy,
    Check,
    UserPlus,
} from 'lucide-react';
import { format } from 'date-fns';
import { ActivityCalendar } from '@/components/ui/activity-calendar';
import { useShareCard } from '@/components/ui/share-card';
import { useState } from 'react';

export function PublicProfilePageClient({ params }: { params: { username: string } }) {
    const { username } = params;
    const { generateAndShare } = useShareCard();
    const [copied, setCopied] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);

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

    const stats = profileData?.stats || {};
    const habits = stats.habits || {};
    const sleep = stats.sleep || {};
    const study = stats.study || {};
    const food = stats.food || {};

    const inviteUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/register?ref=${username}`
        : `/register?ref=${username}`;

    const handleShareProfile = async () => {
        setShareLoading(true);
        await generateAndShare({
            username,
            name: profileData?.name,
            type: 'profile',
            title: `${habits.activeStreaks || 0} day streak`,
            subtitle: `${habits.totalHabits || 0} habits · ${study.totalHours || 0}h study · ${habits.completionRate || 0}% completion`,
            value: habits.activeStreaks || 0,
            emoji: '🔥',
            color: 'purple',
        }, true);
        setShareLoading(false);
    };

    const handleCopyInvite = async () => {
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    <p className="text-sm text-gray-400">Loading profile…</p>
                </div>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
                <Card className="border border-border shadow-sm bg-card max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">Profile not found or is private</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Milestone tier — determines the dynamic invite banner
    type MilestoneTier = {
        id: string;
        bg: string;
        border: string;
        iconBg: string;
        Icon: React.ElementType;
        badge: string;
        badgeColor: string;
        headline: string;
        sub: string;
        cta: string;
        particles: string[];
    };

    const getMilestoneTier = (): MilestoneTier => {
        const streak = habits.activeStreaks || 0;
        const completion = habits.completionRate || 0;
        const studyHours = study.totalHours || 0;
        const totalHabits = habits.totalHabits || 0;

        // Legend — streak 100+ days OR 500+ study hours
        if (streak >= 100 || studyHours >= 500) {
            return {
                id: 'legend',
                bg: 'bg-gradient-to-br from-yellow-950/60 via-orange-950/40 to-red-950/60 dark:from-yellow-950/80 dark:via-orange-950/60 dark:to-red-950/80',
                border: 'border-yellow-500/40',
                iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
                Icon: Crown,
                badge: '🏆 LEGEND',
                badgeColor: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
                headline: `@${username} is a true legend`,
                sub: streak >= 100
                    ? `${streak}-day streak. This level of consistency is rare. Join them.`
                    : `${Math.round(studyHours)}h of deep work. Real dedication. Be part of it.`,
                cta: 'Join the legend',
                particles: ['🏆', '👑', '🔥', '⚡', '✨'],
            };
        }

        // Champion — streak 30+ OR completion rate 90%+
        if (streak >= 30 || completion >= 90) {
            return {
                id: 'champion',
                bg: 'bg-gradient-to-br from-violet-950/60 via-purple-950/40 to-indigo-950/60 dark:from-violet-950/80 dark:via-purple-950/60 dark:to-indigo-950/80',
                border: 'border-violet-500/40',
                iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
                Icon: Star,
                badge: '⚡ CHAMPION',
                badgeColor: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
                headline: `@${username} is on a champion run`,
                sub: streak >= 30
                    ? `${streak} days straight — no breaks, no excuses. Want in?`
                    : `${completion}% completion rate. Almost perfect consistency.`,
                cta: 'Train like a champion',
                particles: ['⚡', '💜', '🌟', '🚀', '✨'],
            };
        }

        // Dedicated — streak 7+ OR study 50h+ OR completion 70%+
        if (streak >= 7 || studyHours >= 50 || completion >= 70) {
            return {
                id: 'dedicated',
                bg: 'bg-gradient-to-br from-sky-950/60 via-blue-950/40 to-cyan-950/60 dark:from-sky-950/80 dark:via-blue-950/60 dark:to-cyan-950/80',
                border: 'border-sky-500/40',
                iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
                Icon: Rocket,
                badge: '🚀 DEDICATED',
                badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
                headline: `@${username} is building real momentum`,
                sub: streak >= 7
                    ? `${streak}-day streak and counting. Habits are becoming a lifestyle.`
                    : `${Math.round(studyHours)}h logged. Steady progress adds up.`,
                cta: 'Build habits with them',
                particles: ['🚀', '💙', '⭐', '🎯', '🌊'],
            };
        }

        // Rising — any habits tracked
        if (totalHabits > 0) {
            return {
                id: 'rising',
                bg: 'bg-gradient-to-br from-emerald-950/60 via-green-950/40 to-teal-950/60 dark:from-emerald-950/80 dark:via-green-950/60 dark:to-teal-950/80',
                border: 'border-emerald-500/40',
                iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
                Icon: Sprout,
                badge: '🌱 RISING',
                badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                headline: `@${username} is on the rise`,
                sub: `Tracking ${totalHabits} habits and growing every day. This is how legends start.`,
                cta: 'Start your journey',
                particles: ['🌱', '💚', '🌿', '✨', '🎯'],
            };
        }

        // New — just joined
        return {
            id: 'new',
            bg: 'bg-gradient-to-br from-indigo-950/60 via-slate-950/40 to-purple-950/60 dark:from-indigo-950/80 dark:via-slate-950/60 dark:to-purple-950/80',
            border: 'border-indigo-500/40',
            iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
            Icon: Zap,
            badge: '✨ NEW MEMBER',
            badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
            headline: `@${username} just started tracking`,
            sub: 'Every legend started somewhere. Be part of this journey from day one.',
            cta: 'Join for free',
            particles: ['✨', '💫', '🎯', '🌟', '⚡'],
        };
    };

    const tier = getMilestoneTier();
    const TierIcon = tier.Icon;

    // Achievements
    const achievements = [];
    if (habits.totalHabits > 0) achievements.push({ icon: Trophy, title: 'First Steps', desc: 'Started tracking habits', grad: 'from-yellow-400 to-yellow-600' });
    if (habits.completionRate >= 80) achievements.push({ icon: Award, title: 'Consistency Master', desc: '80%+ completion rate', grad: 'from-green-400 to-green-600' });
    if (study.totalHours >= 100) achievements.push({ icon: GraduationCap, title: 'Study Champion', desc: '100+ hours studied', grad: 'from-blue-400 to-blue-600' });
    if (habits.activeStreaks >= 30) achievements.push({ icon: Flame, title: 'Streak Legend', desc: '30+ day streak', grad: 'from-orange-400 to-orange-600' });
    if (sleep.totalDays >= 100) achievements.push({ icon: Bed, title: 'Sleep Master', desc: '100+ days tracked', grad: 'from-indigo-400 to-indigo-600' });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0a0a0f] dark:via-[#0f0f1a] dark:to-[#0a0a0f]">
            {/* Header */}
            <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                                {(profileData.name || username).charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                                    {profileData.name || username}
                                </h1>
                                <p className="text-muted-foreground text-xs sm:text-sm">@{username}</p>
                                {profileData.createdAt && (
                                    <p className="text-muted-foreground/60 text-xs mt-0.5 hidden sm:block">
                                        Member since {format(new Date(profileData.createdAt), 'MMMM yyyy')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                                onClick={handleShareProfile}
                                disabled={shareLoading}
                                size="sm"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">{shareLoading ? 'Generating…' : 'Share Card'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
                {/* Activity Calendar */}
                <div className="mb-6">
                    <ActivityCalendar
                        activities={profileData.dailyActivities || []}
                        currentStreak={habits.activeStreaks || 0}
                    />
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                    {/* Streak — large */}
                    <Card className="col-span-2 md:col-span-2 border-0 shadow-lg bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="p-5 md:p-6 relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Flame className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-semibold text-purple-100">Current Streak</span>
                            </div>
                            <p className="text-5xl md:text-6xl font-black mb-1">{habits.activeStreaks || 0}</p>
                            <p className="text-sm text-purple-200">days of consistency</p>
                        </CardContent>
                    </Card>

                    {/* Completion Rate */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 translate-x-1/2" />
                        <CardContent className="p-5 relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Target className="h-4 w-4" />
                            </div>
                            <p className="text-3xl md:text-4xl font-black mb-1">{habits.completionRate || 0}%</p>
                            <p className="text-xs text-blue-200">Completion Rate</p>
                        </CardContent>
                    </Card>

                    {/* Habits */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-5 relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <p className="text-3xl md:text-4xl font-black mb-1">{habits.totalHabits || 0}</p>
                            <p className="text-xs text-green-200">Active Habits</p>
                        </CardContent>
                    </Card>

                    {/* Study — large */}
                    <Card className="col-span-2 md:col-span-2 border-0 shadow-lg bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 text-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 -translate-x-1/2" />
                        <CardContent className="p-5 md:p-6 relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-semibold text-pink-100">Study Progress</span>
                            </div>
                            <div className="flex gap-6 md:gap-10 items-end">
                                <div>
                                    <p className="text-5xl md:text-6xl font-black mb-1">{study.totalHours || 0}</p>
                                    <p className="text-sm text-pink-200">hours</p>
                                </div>
                                <div>
                                    <p className="text-3xl md:text-4xl font-black mb-1">{study.totalSessions || 0}</p>
                                    <p className="text-sm text-pink-200">sessions</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sleep */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-5 relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Bed className="h-4 w-4" />
                            </div>
                            <p className="text-3xl md:text-4xl font-black mb-1">{sleep.totalDays || 0}</p>
                            <p className="text-xs text-indigo-200">Sleep Days</p>
                            {sleep.averageHours > 0 && (
                                <p className="text-xs text-indigo-300 mt-1">Avg {sleep.averageHours}h</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Meals */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-5 relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Coffee className="h-4 w-4" />
                            </div>
                            <p className="text-3xl md:text-4xl font-black mb-1">{food.totalMeals || 0}</p>
                            <p className="text-xs text-amber-200">Meals Logged</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Achievements */}
                {achievements.length > 0 && (
                    <Card className="border border-border bg-card shadow-sm mb-6">
                        <CardContent className="p-5 md:p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-sm">
                                    <Trophy className="h-4 w-4 text-white" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">Achievements</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {achievements.map((a, i) => {
                                    const Icon = a.icon;
                                    return (
                                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.grad} flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-foreground">{a.title}</p>
                                                <p className="text-xs text-muted-foreground">{a.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Dynamic Milestone Invite Banner */}
                <div className={`relative rounded-2xl border ${tier.border} ${tier.bg} overflow-hidden mb-6 shadow-lg`}>
                    {/* Floating particles */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {tier.particles.map((p, i) => (
                            <span
                                key={i}
                                className="absolute text-2xl opacity-10 select-none"
                                style={{
                                    top: `${10 + i * 18}%`,
                                    right: `${4 + i * 6}%`,
                                    fontSize: `${1.2 + (i % 3) * 0.4}rem`,
                                    transform: `rotate(${i * 15 - 30}deg)`,
                                }}
                            >
                                {p}
                            </span>
                        ))}
                    </div>

                    <div className="relative z-10 p-5 md:p-6">
                        {/* Top row — badge + copy link */}
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${tier.badgeColor}`}>
                                {tier.badge}
                            </span>
                            <button
                                onClick={handleCopyInvite}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border border-white/15"
                            >
                                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                {copied ? 'Copied!' : 'Copy invite'}
                            </button>
                        </div>

                        {/* Main content */}
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl ${tier.iconBg} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                <TierIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-white mb-1">{tier.headline}</h3>
                                <p className="text-sm text-white/60 leading-relaxed">{tier.sub}</p>
                            </div>
                        </div>

                        {/* CTA row */}
                        <div className="flex items-center gap-3 mt-5">
                            <a
                                href={inviteUrl}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 hover:border-white/30 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                            >
                                <UserPlus className="h-4 w-4" />
                                {tier.cta}
                            </a>
                            <a
                                href={inviteUrl}
                                className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                            >
                                Free forever
                                <ArrowUpRight className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <CardContent className="p-8 text-center relative z-10">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <TierIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white/80 text-xs font-semibold mb-3">
                            {tier.badge}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            {tier.id === 'legend' ? 'Train with a legend' :
                             tier.id === 'champion' ? 'Rise to champion level' :
                             tier.id === 'dedicated' ? 'Build momentum together' :
                             tier.id === 'rising' ? 'Grow with them' : 'Start your journey'}
                        </h2>
                        <p className="text-purple-100 mb-6 text-sm md:text-base max-w-sm mx-auto">{tier.sub}</p>
                        <a
                            href={`/register?ref=${username}`}
                            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-indigo-600 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg text-sm md:text-base"
                        >
                            {tier.cta}
                            <ArrowUpRight className="h-4 w-4" />
                        </a>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
