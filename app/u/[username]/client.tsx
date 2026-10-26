'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
            <p className="py-32 text-center font-mono text-sm text-muted-foreground" role="status" aria-live="polite">
                loading @{username}…
            </p>
        );
    }

    if (error || !profileData) {
        return (
            <main className="mx-auto w-[min(1200px,100%-2*clamp(16px,4vw,48px))] py-32">
                <p className="eyebrow">@{username}</p>
                <h1 className="display mt-4 text-[clamp(46px,7.4vw,88px)]">
                    Nothing to <em>see</em> here
                </h1>
                <p className="mt-5 max-w-lede text-muted-foreground">This profile doesn’t exist, or its owner keeps it private.</p>
                <Link href="/" className="mt-8 inline-block text-coral transition-colors duration-150 hover:text-muted-foreground">
                    What is this tracker →
                </Link>
            </main>
        );
    }

    // Milestone tier: drives the invite copy
    type MilestoneTier = { label: string; headline: string; sub: string; cta: string };

    const getMilestoneTier = (): MilestoneTier => {
        const streak = habits.activeStreaks || 0;
        const completion = habits.completionRate || 0;
        const studyHours = study.totalHours || 0;
        const totalHabits = habits.totalHabits || 0;

        // Legend — streak 100+ days OR 500+ study hours
        if (streak >= 100 || studyHours >= 500) {
            return {
                label: 'legend',
                headline: 'Train with a legend',
                sub: streak >= 100
                    ? `${streak}-day streak. This level of consistency is rare.`
                    : `${Math.round(studyHours)}h of deep work, logged.`,
                cta: 'Join the legend',
            };
        }
        // Champion — streak 30+ OR completion rate 90%+
        if (streak >= 30 || completion >= 90) {
            return {
                label: 'champion',
                headline: 'Keep pace with a champion',
                sub: streak >= 30 ? `${streak} days straight, no breaks.` : `${completion}% completion. Close to perfect.`,
                cta: 'Train alongside',
            };
        }
        // Dedicated — streak 7+ OR study 50h+ OR completion 70%+
        if (streak >= 7 || studyHours >= 50 || completion >= 70) {
            return {
                label: 'dedicated',
                headline: 'Build the momentum together',
                sub: streak >= 7 ? `${streak}-day streak and counting.` : `${Math.round(studyHours)}h logged. It adds up.`,
                cta: 'Build habits with them',
            };
        }
        // Rising — any habits tracked
        if (totalHabits > 0) {
            return {
                label: 'rising',
                headline: 'Grow with them',
                sub: `Tracking ${totalHabits} habits, one day at a time.`,
                cta: 'Start your streak',
            };
        }
        // New — just joined
        return {
            label: 'new member',
            headline: 'Start on day one with them',
            sub: 'They just started. Good time to start too.',
            cta: 'Join for free',
        };
    };

    const tier = getMilestoneTier();

    // Achievements
    const achievements: { title: string; desc: string }[] = [];
    if (habits.totalHabits > 0) achievements.push({ title: 'First steps', desc: 'started tracking habits' });
    if (habits.completionRate >= 80) achievements.push({ title: 'Consistency', desc: '80%+ completion rate' });
    if (study.totalHours >= 100) achievements.push({ title: 'Study champion', desc: '100+ hours studied' });
    if (habits.activeStreaks >= 30) achievements.push({ title: 'Streak legend', desc: '30+ day streak' });
    if (sleep.totalDays >= 100) achievements.push({ title: 'Sleep master', desc: '100+ nights tracked' });

    const displayName = String(profileData.name || username);
    const [firstWord, ...rest] = displayName.split(' ');

    const statItems = [
        { label: 'day streak', value: habits.activeStreaks || 0 },
        { label: 'completion', value: `${habits.completionRate || 0}%` },
        { label: 'active habits', value: habits.totalHabits || 0 },
        { label: 'study hours', value: study.totalHours || 0 },
        { label: 'study sessions', value: study.totalSessions || 0 },
        { label: sleep.averageHours > 0 ? `nights · avg ${sleep.averageHours}h` : 'nights tracked', value: sleep.totalDays || 0 },
        { label: 'meals logged', value: food.totalMeals || 0 },
    ];

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-border backdrop-blur-md [background:color-mix(in_srgb,hsl(var(--background))_88%,transparent)]">
                <div className="mx-auto flex min-h-[64px] w-[min(1200px,100%-2*clamp(16px,4vw,48px))] items-center gap-4">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="saffron-dot" aria-hidden />
                        <span className="font-display text-[26px] leading-none tracking-[-0.01em]">tracker</span>
                    </Link>
                    <Link href={`/register?ref=${username}`} className="ml-auto">
                        <Button size="sm" tabIndex={-1}>Join free →</Button>
                    </Link>
                </div>
            </header>

            <main className="mx-auto w-[min(1200px,100%-2*clamp(16px,4vw,48px))] pb-16">
                <section className="pb-10 pt-[clamp(48px,8vw,96px)]">
                    <p className="eyebrow">@{username}</p>
                    <h1 className="display mt-4 text-[clamp(56px,10vw,140px)] leading-[0.9] tracking-[-0.04em]">
                        {firstWord} {rest.length > 0 ? <em>{rest.join(' ')}</em> : null}
                    </h1>
                    <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                        {profileData.createdAt && (
                            <p className="font-mono text-xs text-muted-foreground">
                                tracking since {format(new Date(profileData.createdAt), 'MMMM yyyy').toLowerCase()} · {tier.label}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={handleShareProfile} disabled={shareLoading}>
                                {shareLoading ? '…' : 'Share card ↗'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCopyInvite}>
                                {copied ? 'Copied ✓' : 'Copy invite link'}
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Numbers on hairlines, label below */}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
                    {statItems.map((s) => (
                        <div key={s.label} className="flex flex-col-reverse gap-2 border-t border-border pt-4">
                            <dt className="font-mono text-xs text-muted-foreground">{s.label}</dt>
                            <dd className="font-display text-[44px] leading-none sm:text-[60px]">{s.value}</dd>
                        </div>
                    ))}
                </dl>

                <section className="pt-20">
                    <div className="section-rule">
                        <p className="eyebrow">§ 01 · The year so far</p>
                    </div>
                    <div className="mt-8">
                        <ActivityCalendar activities={profileData.dailyActivities || []} currentStreak={habits.activeStreaks || 0} />
                    </div>
                </section>

                {achievements.length > 0 && (
                    <section className="pt-20">
                        <div className="section-rule">
                            <p className="eyebrow">§ 02 · Milestones</p>
                        </div>
                        <ul className="mt-6 border-b border-border">
                            {achievements.map((a, i) => (
                                <li key={a.title} className="flex flex-col gap-1 border-t border-border py-5 sm:flex-row sm:items-baseline sm:gap-6 sm:px-2">
                                    <span className="font-mono text-xs text-muted-foreground sm:basis-[120px] sm:shrink-0">
                                        {['i', 'ii', 'iii', 'iv', 'v'][i]}
                                    </span>
                                    <span className="font-display text-[28px] leading-[1.1] sm:basis-[260px] sm:shrink-0">{a.title}</span>
                                    <span className="text-[15px] text-muted-foreground">{a.desc}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Invite: inverted ink panel with a blurred orb */}
                <section className="pt-20">
                    <div className="relative overflow-hidden rounded-[28px] bg-[#17150F] p-8 text-[#F3F0E8] sm:p-12 dark:bg-[#1A1814]">
                        <div
                            className="pointer-events-none absolute -right-48 -top-48 h-[320px] w-[320px] rounded-full bg-saffron opacity-[.42] blur-[110px] sm:-right-40 sm:-top-40 sm:h-[520px] sm:w-[520px]"
                            aria-hidden
                        />
                        <div className="relative">
                            <p className="font-mono text-[12.5px] font-medium uppercase tracking-[.14em] text-[#A39E92]">
                                {tier.label} · invite
                            </p>
                            <h2 className="mt-4 font-display text-[clamp(48px,7vw,100px)] leading-[.95] tracking-[-.03em]">
                                {tier.headline}
                            </h2>
                            <p className="mt-5 max-w-lede text-[17px] text-[#C9C4B8]">{tier.sub}</p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <a
                                    href={inviteUrl}
                                    className="inline-flex min-h-[52px] items-center rounded-full bg-[#F3F0E8] px-[26px] text-base font-medium text-[#17150F] transition-colors duration-150 hover:bg-white"
                                >
                                    {tier.cta} →
                                </a>
                                <button
                                    type="button"
                                    onClick={handleCopyInvite}
                                    className="inline-flex min-h-[52px] items-center rounded-full border border-[#3A362F] px-[26px] text-base font-medium text-[#F3F0E8] transition-colors duration-150 hover:border-[#A39E92]"
                                >
                                    {copied ? 'Copied ✓' : 'Copy invite link'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-rule">
                <div className="mx-auto flex w-[min(1200px,100%-2*clamp(16px,4vw,48px))] flex-wrap items-center justify-between gap-4 py-6">
                    <p className="font-mono text-xs text-muted-foreground">
                        made with{' '}
                        <Link href="/" className="text-coral hover:text-muted-foreground">
                            tracker
                        </Link>{' '}
                        · built by{' '}
                        <a href="https://ratnesh-maurya.com" target="_blank" rel="noopener noreferrer" className="text-coral hover:text-muted-foreground">
                            ratnesh maurya ↗
                        </a>
                    </p>
                </div>
            </footer>
        </>
    );
}
