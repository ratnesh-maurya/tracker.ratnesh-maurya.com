'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Chip } from '@/components/ui/chip';
import { EmptyState, PageHeader, PageShell, Section, Stat } from '@/components/layout/page';
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

    // A ruled row: mono kind, serif title, muted note, share action on the right
    const row = (key: string, kind: string, title: string, note: string, share: React.ReactNode) => (
        <li key={key} className="flex items-center gap-4 border-t border-border px-2 py-5 transition-colors duration-150 hover:bg-hover">
            <span className="hidden w-28 shrink-0 font-mono text-xs text-muted-foreground sm:block">{kind}</span>
            <div className="min-w-0 flex-1">
                <p className="font-display text-[24px] leading-[1.15] sm:text-[28px]">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{note}</p>
            </div>
            {share}
        </li>
    );

    const achievements = [
        habits.totalHabits > 0 &&
            row('first', 'achievement', 'First habit', 'Created your first habit',
                <SocialShare data={{ username, name, type: 'achievement', title: 'First Habit', subtitle: 'Started my habit journey!', emoji: '🏆', color: 'indigo' }} />),
        habits.completionRate > 80 &&
            row('consistency', 'achievement', 'Consistency master', `${habits.completionRate?.toFixed(0)}% completion rate`,
                <SocialShare data={{ username, name, type: 'achievement', title: 'Consistency Master', subtitle: `${habits.completionRate?.toFixed(0)}% completion rate!`, value: habits.completionRate?.toFixed(0) + '%', emoji: '⚡', color: 'green' }} />),
        study.totalHours > 100 &&
            row('study', 'achievement', 'Study champion', `${Math.round(study.totalHours)}h of deep study`,
                <SocialShare data={{ username, name, type: 'achievement', title: 'Study Champion', subtitle: '100+ hours of deep study!', value: Math.round(study.totalHours), emoji: '📚', color: 'blue' }} />),
    ].filter(Boolean);

    return (
        <PageShell>
            <PageHeader
                kicker={`§ 10 · @${username}`}
                title={name ? <>{name.split(' ').slice(0, -1).join(' ')} <em>{name.split(' ').slice(-1)[0]}</em></> : <>Your <em>profile</em></>}
                lede={(userData as any)?.email}
                action={
                    (userData as any)?.username && (userData as any)?.profilePublic ? (
                        <Link
                            href={`/u/${(userData as any).username}`}
                            target="_blank"
                            className="text-[15px] text-coral transition-colors duration-150 hover:text-muted-foreground"
                        >
                            Public profile ↗
                        </Link>
                    ) : (
                        <Link href="/settings" className="text-[15px] text-coral transition-colors duration-150 hover:text-muted-foreground">
                            Settings →
                        </Link>
                    )
                }
            />

            <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
                <Stat label="habits" value={habits.totalHabits || 0} className="border-t border-border pt-4" />
                <Stat label="study this year" value={`${Math.round(study.totalHours || 0)}h`} className="border-t border-border pt-4" />
                <Stat label="day streak" value={habits.activeStreaks || 0} className="border-t border-border pt-4" />
            </dl>

            <div className="mt-12 flex gap-2" role="group" aria-label="Profile view">
                {(['activity', 'achievements'] as const).map((tab) => (
                    <Chip key={tab} label={tab === 'activity' ? 'Activity' : 'Achievements'} selected={activeTab === tab} onClick={() => setActiveTab(tab)} />
                ))}
            </div>

            {activeTab === 'activity' && (
                <Section kicker="§ 01 · Recent activity" className="mt-8">
                    <ul className="border-b border-border">
                        {row('goal', 'daily goal', 'Daily goal completed', 'All habits checked in today',
                            <SocialShare data={{ username, name, type: 'daily-goal', title: 'Daily Goal', subtitle: 'All habits done today!', emoji: '🎯', color: 'green' }} />)}
                        {row('study', 'study', 'Study this year', `${Math.round(study.totalHours || 0)} hours total`,
                            <SocialShare data={{ username, name, type: 'study', title: 'Study Hours', subtitle: `${Math.round(study.totalHours || 0)}h of deep work`, value: Math.round(study.totalHours || 0), emoji: '📚', color: 'blue' }} />)}
                        {habits.activeStreaks > 0 &&
                            row('streak', 'streak', 'Streak kept', `${habits.activeStreaks} days in a row`,
                                <SocialShare data={{ username, name, type: 'streak', title: 'On Fire!', subtitle: `${habits.activeStreaks} day streak`, value: habits.activeStreaks, emoji: '🔥', color: 'orange' }} />)}
                    </ul>
                </Section>
            )}

            {activeTab === 'achievements' && (
                <Section kicker="§ 02 · Achievements" className="mt-8">
                    {achievements.length > 0 ? (
                        <ul className="border-b border-border">{achievements}</ul>
                    ) : (
                        <EmptyState>Keep tracking to unlock achievements.</EmptyState>
                    )}
                </Section>
            )}
        </PageShell>
    );
}
