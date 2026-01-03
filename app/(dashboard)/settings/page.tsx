'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Settings, User, Moon, Volume2, LogOut, ExternalLink, Copy, Check } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { useRouter } from 'next/navigation';
import { handleApiResponse } from '@/lib/api/client';

export default function SettingsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [darkMode, setDarkMode] = useState(false);
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
        gcTime: 0,
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
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    useEffect(() => {
        // Initialize dark mode from localStorage or system preference
        const savedDarkMode = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedDarkMode !== null ? savedDarkMode === 'true' : prefersDark;

        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

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
            localStorage.setItem('darkMode', value.toString());
            if (value) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } else if (setting === 'sounds') {
            setSounds(value);
            localStorage.setItem('sounds', value.toString()); // Update localStorage immediately
            updateMutation.mutate({ sounds: value });
        } else if (setting === 'profilePublic') {
            setProfilePublic(value);
            updateMutation.mutate({ profilePublic: value });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/90 dark:to-gray-800/90">
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-3">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                Settings
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-20">
                <div className="space-y-6 animate-fade-in">
                    {/* General Section */}
                    <Card className="border border-white/30 dark:border-white/10 shadow-xl bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                General
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                                        <Moon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-100">Dark Mode</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Switch to dark theme</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggle('darkMode', !darkMode)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                                        <Volume2 className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-100">Sounds</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Enable sound notifications</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggle('sounds', !sounds)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sounds ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sounds ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-100">Public Profile</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Make your profile visible to others</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggle('profilePublic', !profilePublic)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profilePublic ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profilePublic ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                                {profilePublic && (userData as any)?.username && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Your Public Profile</p>
                                                <p className="text-xs text-blue-700 dark:text-blue-300 truncate">
                                                    {typeof window !== 'undefined' ? `${window.location.origin}/u/${(userData as any).username}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 ml-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={async () => {
                                                        const url = typeof window !== 'undefined' ? `${window.location.origin}/u/${(userData as any).username}` : '';
                                                        if (url) {
                                                            await navigator.clipboard.writeText(url);
                                                            setCopied(true);
                                                            setTimeout(() => setCopied(false), 2000);
                                                        }
                                                    }}
                                                    className="h-8 w-8 text-blue-600 dark:text-blue-400"
                                                >
                                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                                <a
                                                    href={`/u/${(userData as any).username}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profile Section */}
                    <Card className="border border-white/30 dark:border-white/10 shadow-xl bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isEditingProfile ? (
                                <>
                                    <div className="space-y-4">
                                        <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</p>
                                            <p className="font-medium text-gray-800 dark:text-gray-100">{name || 'Not set'}</p>
                                        </div>
                                        <div className="py-3">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                                            <p className="font-medium text-gray-800 dark:text-gray-100">{phone || 'Not set'}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-lg"
                                        onClick={() => setIsEditingProfile(true)}
                                    >
                                        Edit Profile
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
                                        <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Name
                                        </label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your full name"
                                            maxLength={100}
                                            className="rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Phone
                                        </label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+1234567890"
                                            className="rounded-lg"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1 rounded-lg"
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
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                                            disabled={updateMutation.isPending}
                                        >
                                            {updateMutation.isPending ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* Logout */}
                    <Card className="border border-white/30 dark:border-white/10 shadow-xl bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl">
                        <CardContent className="pt-6">
                            <Button
                                onClick={handleLogout}
                                variant="destructive"
                                className="w-full rounded-lg"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Developer Credit */}
                    <div className="text-center pt-4 pb-2 animate-fade-in">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Built by{' '}
                            <a
                                href="https://ratnesh-maurya.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
                            >
                                Ratnesh Maurya
                            </a>
                        </p>
                    </div>
                </div>
            </main>
            <NavBar />
        </div>
    );
}
