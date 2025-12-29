'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Quote, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

const quotes = [
    {
        text: "The secret of getting ahead is getting started.",
        author: "Mark Twain"
    },
    {
        text: "You don't have to be great to start, but you have to start to be great.",
        author: "Zig Ziglar"
    },
    {
        text: "Every accomplishment starts with the decision to try.",
        author: "John F. Kennedy"
    },
    {
        text: "The future depends on what you do today.",
        author: "Mahatma Gandhi"
    }
];

const features = [
    "Track habits & build consistency",
    "Monitor sleep & wellness",
    "Log meals & nutrition",
    "Record expenses & budget",
    "Study time & productivity",
    "Daily journaling"
];

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, name, password, rememberMe }),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/dashboard');
                router.refresh();
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding & Quote */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between relative overflow-hidden">
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
                            <p className="text-indigo-100 text-sm">Your life, organized</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 max-w-md">
                    <Quote className="h-8 w-8 text-white/80 mb-4" />
                    <blockquote className="text-3xl font-semibold text-white mb-4 leading-tight">
                        &ldquo;{currentQuote.text}&rdquo;
                    </blockquote>
                    <p className="text-indigo-100 text-lg">— {currentQuote.author}</p>

                    <div className="mt-8 space-y-3">
                        <p className="text-white/90 font-medium mb-3">Start tracking:</p>
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <CheckCircle2 className="h-5 w-5 text-white/80" />
                                <span className="text-indigo-100">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 flex space-x-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-white/30"></div>
                    ))}
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
                        <p className="text-gray-600">Start your journey to a better you</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                            <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                Name <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={100}
                                className="h-12 text-base"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                minLength={3}
                                maxLength={30}
                                className="h-12 text-base"
                            />
                            <p className="text-xs text-gray-500">3-30 characters, letters and numbers only</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="h-12 text-base"
                            />
                            <p className="text-xs text-gray-500">At least 6 characters</p>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                Remember me for 30 days
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create account'
                            )}
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-50 text-gray-500">Already have an account?</span>
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                                Sign in
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
                                className="text-indigo-500 hover:text-indigo-600 hover:underline"
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

