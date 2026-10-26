'use client';

import { useState, useEffect } from 'react';
import { clearUserData } from '@/lib/query/client';
import { getTheme, setTheme } from '@/lib/theme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Copy, Check } from 'lucide-react';
import { PageHeader, PageShell, Section } from '@/components/layout/page';
import { useRouter } from 'next/navigation';
import { handleApiResponse } from '@/lib/api/client';

export default function SettingsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    // Server renders dark; read the real theme after mount so hydration matches
    const [darkMode, setDarkMode] = useState(true);
    useEffect(() => {
        setDarkMode(getTheme() === 'dark');
    }, []);
    const [sounds, setSounds] = useState(true);
    const [profilePublic, setProfilePublic] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [copied, setCopied] = useState(false);

    const { data: userData } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const res = await fetch('/api/users/me', { cache: 'no-store' });
            return handleApiResponse(res);
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const updateMutation = useMutation({
        mutationFn: async (updates: any) => {
            const res = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            setIsEditingProfile(false);
        },
    });

    const handleLogout = async () => {
        // Logging out wipes this device's queue, so unsynced saves would be lost
        const unsynced = queryClient.getMutationCache().findAll({ mutationKey: ['offline'], status: 'pending' }).length;
        if (unsynced > 0 && !confirm(`${unsynced} saved change(s) have not synced yet and will be lost. Log out anyway?`)) {
            return;
        }
        await fetch('/api/auth/logout', { method: 'POST' });
        await clearUserData();
        router.push('/login');
    };

    useEffect(() => {
        if (userData) {
            const data = userData as any;
            setProfilePublic(data.profilePublic || false);
            setSounds(data.sounds !== undefined ? data.sounds : true);
            setName(data.name ?? '');
            setPhone(data.phone ?? '');
        }
    }, [userData]);

    const handleToggle = (setting: string, value: boolean) => {
        if (setting === 'darkMode') {
            setDarkMode(value);
            setTheme(value ? 'dark' : 'light');
        } else if (setting === 'sounds') {
            setSounds(value);
            localStorage.setItem('sounds', value.toString()); // Update localStorage immediately
            updateMutation.mutate({ sounds: value });
        } else if (setting === 'profilePublic') {
            setProfilePublic(value);
            updateMutation.mutate({ profilePublic: value });
        }
    };

    const publicUrl = typeof window !== 'undefined' && (userData as any)?.username
        ? `${window.location.origin}/u/${(userData as any).username}`
        : '';

    return (
        <PageShell>
            <PageHeader kicker="§ 11 · Settings" title={<>How it <em>behaves</em></>} />

            <div className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Section kicker="§ 01 · General" className="mt-0">
                        <ul className="border-b border-border">
                            <SettingRow label="Dark mode" description="Ink paper at night. The default.">
                                <Switch label="Dark mode" checked={darkMode} onChange={() => handleToggle('darkMode', !darkMode)} />
                            </SettingRow>
                            <SettingRow label="Sounds" description="A short tick when you check something in.">
                                <Switch label="Sounds" checked={sounds} onChange={() => handleToggle('sounds', !sounds)} />
                            </SettingRow>
                            <SettingRow label="Public profile" description="Anyone with the link can see your streaks and totals.">
                                <Switch label="Public profile" checked={profilePublic} onChange={() => handleToggle('profilePublic', !profilePublic)} />
                            </SettingRow>
                        </ul>

                        {profilePublic && (userData as any)?.username && (
                            <div className="mt-4 flex items-center gap-2 rounded-inner bg-muted py-2 pl-4 pr-2">
                                <p className="min-w-0 flex-1 truncate font-mono text-[13px] text-body">{publicUrl}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={copied ? 'Link copied' : 'Copy link'}
                                    onClick={async () => {
                                        const url = typeof window !== 'undefined' ? `${window.location.origin}/u/${(userData as any).username}` : '';
                                        if (url) {
                                            await navigator.clipboard.writeText(url);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }
                                    }}
                                >
                                    {copied ? <Check className="h-4 w-4" strokeWidth={1.8} aria-hidden /> : <Copy className="h-4 w-4" strokeWidth={1.8} aria-hidden />}
                                </Button>
                                <a
                                    href={`/u/${(userData as any).username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-11 items-center px-3 text-[15px] text-coral transition-colors duration-150 hover:text-muted-foreground"
                                >
                                    Open ↗
                                </a>
                            </div>
                        )}
                    </Section>

                    <Section kicker="§ 02 · Profile">
                        {!isEditingProfile ? (
                            <>
                                <dl className="border-b border-border">
                                    {[
                                        ['name', name || 'Not set'],
                                        ['phone', phone || 'Not set'],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex items-baseline justify-between gap-4 border-t border-border px-2 py-4">
                                            <dt className="font-mono text-xs text-muted-foreground">{label}</dt>
                                            <dd className="text-[17px] text-foreground">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                                <Button variant="outline" className="mt-5" onClick={() => setIsEditingProfile(true)}>
                                    Edit profile
                                </Button>
                            </>
                        ) : (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const updatePayload: any = {};
                                    if (name !== undefined) updatePayload.name = name || null;
                                    if (phone !== undefined) updatePayload.phone = phone || null;
                                    await updateMutation.mutateAsync(updatePayload);
                                } catch (error) {
                                    console.error('Error updating profile:', error);
                                    alert('Failed to update profile. Please try again.');
                                }
                            }} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                                        Name
                                    </label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your full name"
                                        maxLength={100}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="mb-2 block text-sm font-medium text-foreground">
                                        Phone
                                    </label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+1234567890"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditingProfile(false);
                                            if (userData) {
                                                const data = userData as any;
                                                setName(data.name || '');
                                                setPhone(data.phone || '');
                                            }
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={updateMutation.isPending}>
                                        {updateMutation.isPending ? '…' : 'Save'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </Section>
                </div>

                <div>
                    <Section kicker="§ 03 · Account" className="mt-0">
                        <dl className="border-b border-border">
                            {[
                                ['username', (userData as any)?.username || '—'],
                                ['email', (userData as any)?.email || '—'],
                                ['name', (userData as any)?.name || 'Not set'],
                            ].map(([label, value]) => (
                                <div key={label} className="border-t border-border px-2 py-3">
                                    <dt className="font-mono text-xs text-muted-foreground">{label}</dt>
                                    <dd className="mt-1 truncate text-[15px] text-foreground">{value}</dd>
                                </div>
                            ))}
                        </dl>
                        <Button onClick={handleLogout} variant="outline" className="mt-5 w-full hover:text-kicker">
                            <LogOut className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                            Sign out
                        </Button>
                        <p className="mt-6 font-mono text-[11px] text-muted-foreground">
                            built by{' '}
                            <a
                                href="https://ratnesh-maurya.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-coral transition-colors duration-150 hover:text-muted-foreground"
                            >
                                ratnesh maurya ↗
                            </a>
                        </p>
                    </Section>
                </div>
            </div>
        </PageShell>
    );
}

// One settings line: label and note on the left, control on the right.
function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
    return (
        <li className="flex items-center justify-between gap-6 border-t border-border px-2 py-4">
            <div className="min-w-0">
                <p className="text-[17px] font-medium text-foreground">{label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
        </li>
    );
}

// Pill switch: ink when on, muted when off. The thumb jumps rather than slides
// (Ledger motion is colour only); the button keeps a 44px hit area.
function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={onChange}
            className="inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-full"
        >
            <span
                className={`flex h-7 w-12 items-center rounded-full border p-[3px] transition-colors duration-150 ${
                    checked ? 'justify-end border-primary bg-primary' : 'justify-start border-border bg-muted'
                }`}
            >
                <span className={`h-5 w-5 rounded-full ${checked ? 'bg-primary-foreground' : 'bg-muted-foreground'}`} />
            </span>
        </button>
    );
}
