'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Quote } from 'lucide-react';
import Image from 'next/image';

const quotes = [
    {
        text: "The journey of a thousand miles begins with a single step.",
        author: "Lao Tzu"
    },
    {
        text: "Success is the sum of small efforts repeated day in and day out.",
        author: "Robert Collier"
    },
    {
        text: "What gets measured gets managed.",
        author: "Peter Drucker"
    },
    {
        text: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb"
    }
];

// Default credentials for development/testing
const DEFAULT_EMAIL = 'test@example.com';
const DEFAULT_PASSWORD = 'password123';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [currentQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

    // Force light mode on login page (client-side only)
    useEffect(() => {
        setMounted(true);
        const savedDarkMode = localStorage.getItem('darkMode');
        document.documentElement.classList.remove('dark');
        return () => {
            // Restore previous theme when leaving page
            if (savedDarkMode === 'true') {
                document.documentElement.classList.add('dark');
            }
        };
    }, []);

    // Check if user is already authenticated
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/users/me');
                if (response.ok) {
                    router.push('/dashboard');
                    return;
                }
            } catch (err) {
                // Not authenticated, continue to login page
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, [router]);

    const handleUseTestCredentials = () => {
        setEmail(DEFAULT_EMAIL);
        setPassword(DEFAULT_PASSWORD);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, rememberMe }),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/dashboard');
                router.refresh();
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding & Quote */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                            <Image
                                src="/web-app-manifest-192x192.png"
                                alt="Personal Tracker Logo"
                                width={48}
                                height={48}
                                className="rounded-lg"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Personal Tracker</h1>
                            <p className="text-blue-100 text-sm">Your life, organized</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 max-w-md">
                    <Quote className="h-8 w-8 text-white/80 mb-4" />
                    <blockquote className="text-3xl font-semibold text-white mb-4 leading-tight">
                        &ldquo;{currentQuote.text}&rdquo;
                    </blockquote>
                    <p className="text-blue-100 text-lg">— {currentQuote.author}</p>
                </div>

                <div className="relative z-10 flex space-x-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-white/30"></div>
                    ))}
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="mb-8 lg:hidden">
                        <div className="flex items-center space-x-3 mb-4">
                            <Image
                                src="/web-app-manifest-192x192.png"
                                alt="Personal Tracker Logo"
                                width={40}
                                height={40}
                                className="rounded-lg"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Personal Tracker</h1>
                                <p className="text-gray-600 text-sm">Your life, organized</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
                        <p className="text-gray-600">Sign in to continue your journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 text-base"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <Link href="#" className="text-sm text-blue-600 hover:text-blue-700">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-12 text-base"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                    Remember me for 30 days
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={handleUseTestCredentials}
                                className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                            >
                                Use test credentials
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-50 text-gray-500">New to Personal Tracker?</span>
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                                Sign up
                            </Link>
                        </p>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400">
                            Built by{' '}
                            <a
                                href="https://ratnesh-maurya.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 hover:underline"
                            >
                                Ratnesh Maurya
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
