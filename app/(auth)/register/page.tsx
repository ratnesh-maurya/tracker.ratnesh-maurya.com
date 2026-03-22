'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ArrowRight, Check, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const features = [
    'Habit tracking with streaks',
    'Sleep & wellness analytics',
    'Food logging (Indian foods)',
    'Study time & productivity',
    'Expense management',
    'Daily journaling',
];

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const refUsername = searchParams.get('ref');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, name, password, rememberMe }),
            });
            const data = await res.json();
            if (data.success) { router.push('/dashboard'); router.refresh(); }
            else setError(data.error || 'Registration failed');
        } catch { setError('An error occurred. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex bg-[#0a0a0f]">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between p-12 relative overflow-hidden border-r border-white/6 flex-shrink-0">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600/12 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] bg-pink-600/8 rounded-full blur-[80px]" />
                    <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <Image src="/web-app-manifest-192x192.png" alt="Logo" width={36} height={36} className="rounded-xl" />
                    <div>
                        <p className="text-white font-semibold text-lg leading-none">Personal Tracker</p>
                        <p className="text-gray-500 text-xs mt-0.5">Your life, organized</p>
                    </div>
                </div>

                <div className="relative z-10 space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 leading-tight">Start tracking<br />your life today</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">Free forever. No credit card. Sign up in 30 seconds.</p>
                    </div>
                    <ul className="space-y-3">
                        {features.map((f) => (
                            <li key={f} className="flex items-center gap-3 text-sm text-gray-400">
                                <div className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                                    <Check className="h-3 w-3 text-indigo-400" />
                                </div>
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative z-10">
                    <p className="text-xs text-gray-600">
                        Built by{' '}
                        <a href="https://ratnesh-maurya.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                            Ratnesh Maurya
                        </a>
                    </p>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[400px] py-8"
                >
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2.5 mb-8 lg:hidden">
                        <Image src="/web-app-manifest-192x192.png" alt="Logo" width={32} height={32} className="rounded-xl" />
                        <p className="text-white font-semibold">Personal Tracker</p>
                    </div>

                    {refUsername && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="mb-6 px-4 py-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-start gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <UserPlus className="h-4 w-4 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-indigo-300">You were invited by <span className="font-bold">@{refUsername}</span></p>
                                <p className="text-xs text-gray-500 mt-0.5">Join them on their tracking journey!</p>
                            </div>
                        </motion.div>
                    )}

                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">Create your account</h1>
                        <p className="text-gray-500 text-sm">{refUsername ? `Invited by @${refUsername} · Start your journey` : 'Start your journey to a better you'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-gray-400">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                                className="h-11 bg-white/4 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/60 focus:bg-white/6 transition-all duration-200 rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label htmlFor="name" className="text-sm font-medium text-gray-400">Name <span className="text-gray-600 text-xs font-normal">(optional)</span></label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={100}
                                    className="h-11 bg-white/4 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/60 focus:bg-white/6 transition-all duration-200 rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="username" className="text-sm font-medium text-gray-400">Username</label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    minLength={3}
                                    maxLength={30}
                                    className="h-11 bg-white/4 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/60 focus:bg-white/6 transition-all duration-200 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-gray-400">Password</label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="h-11 bg-white/4 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/60 focus:bg-white/6 transition-all duration-200 rounded-xl pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded accent-indigo-500"
                            />
                            <span className="text-sm text-gray-500">Remember me for 30 days</span>
                        </label>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-900/30 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Create account <ArrowRight className="h-4 w-4" /></>
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={null}>
            <RegisterForm />
        </Suspense>
    );
}
