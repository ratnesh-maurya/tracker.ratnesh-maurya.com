'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Settings, User, Moon, Volume2, LogOut } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [darkMode, setDarkMode] = useState(false);
    const [sounds, setSounds] = useState(true);
    const [profilePublic, setProfilePublic] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const { data: userData } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const res = await fetch('/api/users/me');
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
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
        },
    });

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    useEffect(() => {
        if (userData) {
            setProfilePublic(userData.profilePublic || false);
            setName(userData.name ?? '');
            setPhone(userData.phone ?? '');
        }
    }, [userData]);

    const handleToggle = (setting: string, value: boolean) => {
        if (setting === 'darkMode') {
            setDarkMode(value);
            // Apply dark mode class
            if (value) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } else if (setting === 'sounds') {
            setSounds(value);
        } else if (setting === 'profilePublic') {
            setProfilePublic(value);
            updateMutation.mutate({ profilePublic: value });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-20">
                <div className="space-y-6">
                    {/* General Section */}
                    <Card className="dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                <Settings className="h-5 w-5" />
                                GENERAL
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <p className="font-medium dark:text-white">Dark Mode</p>
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

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Volume2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <p className="font-medium dark:text-white">Sounds</p>
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

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <p className="font-medium dark:text-white">Public Profile</p>
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
                        </CardContent>
                    </Card>

                    {/* Profile Section */}
                    <Card className="dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                <User className="h-5 w-5" />
                                PROFILE
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isEditingProfile ? (
                                <>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</p>
                                            <p className="font-medium dark:text-white">{name || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                                            <p className="font-medium dark:text-white">{phone || 'Not set'}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full"
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
                                        console.log('Sending update:', updatePayload);
                                        await updateMutation.mutateAsync(updatePayload);
                                        setIsEditingProfile(false);
                                    } catch (error) {
                                        console.error('Error updating profile:', error);
                                        alert('Failed to update profile. Please check the console for details.');
                                    }
                                }} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium mb-2 dark:text-white">
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
                                        <label htmlFor="phone" className="block text-sm font-medium mb-2 dark:text-white">
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
                                            className="flex-1"
                                            onClick={() => {
                                                setIsEditingProfile(false);
                                                if (userData) {
                                                    setName(userData.name || '');
                                                    setPhone(userData.phone || '');
                                                }
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1"
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
                    <Card className="dark:bg-gray-800">
                        <CardContent className="pt-6">
                            <Button
                                onClick={handleLogout}
                                variant="destructive"
                                className="w-full"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Developer Credit */}
                    <div className="text-center pt-4 pb-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Built by{' '}
                            <a
                                href="https://ratnesh-maurya.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
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

