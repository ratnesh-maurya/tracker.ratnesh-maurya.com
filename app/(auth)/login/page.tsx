'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ArrowRight, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const DEFAULT_EMAIL = 'test@example.com';
const DEFAULT_PASSWORD = 'password123';

const features = [
    { icon: '🔥', label: 'Habit streaks' },
    { icon: '😴', label: 'Sleep tracking' },
    { icon: '🍽️', label: 'Food logging' },
    { icon: '📚', label: 'Study sessions' },
    { icon: '💸', label: 'Expense tracking' },
    { icon: '📓', label: 'Daily journal' },
];

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [demoLoading, setDemoLoading] = useState(false);

    // Check if redirected from landing "try demo" button
    useEffect(() => {
        const demo = searchParams.get('demo');
        if (demo === '1') {
            setEmail(DEFAULT_EMAIL);
            setPassword(DEFAULT_PASSWORD);
        }
    }, [searchParams]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/users/me');
                if (res.ok) { router.push('/dashboard'); return; }
            } catch { /* not authenticated */ } finally {
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, [router]);

    const doLogin = async (em: string, pw: string, remember: boolean) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: em, password: pw, rememberMe: remember }),
        });
        return res.json();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await doLogin(email, password, rememberMe);
            if (data.success) { router.push('/dashboard'); router.refresh(); }
            else setError(data.error || 'Login failed');
        } catch { setError('An error occurred. Please try again.'); }
        finally { setLoading(false); }
    };

    const handleDemo = async () => {
        setDemoLoading(true);
        setError('');
        try {
            const data = await doLogin(DEFAULT_EMAIL, DEFAULT_PASSWORD, true);
            if (data.success) { router.push('/dashboard'); router.refresh(); }
            else setError(data.error || 'Demo login failed — please try signing up');
        } catch { setError('An error occurred.'); }
        finally { setDemoLoading(false); }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[#0a0a0f]">
            {/* Left panel — desktop only */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between p-12 relative overflow-hidden border-r border-white/6 flex-shrink-0">
                {/* Glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-600/12 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 left-1/4 w-[200px] h-[200px] bg-purple-600/8 rounded-full blur-[80px]" />
                    <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <Image src="/web-app-manifest-192x192.png" alt="Logo" width={36} height={36} className="rounded-xl" />
                    <div>
                        <p className="text-white font-semibold text-lg leading-none">Personal Tracker</p>
                        <p className="text-gray-500 text-xs mt-0.5">Your life, organized</p>
                    </div>
                </div>

                {/* Middle content */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 leading-tight">Track everything<br />that matters</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">One app. Six powerful trackers. Beautiful insights.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {features.map((f) => (
                            <div key={f.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/4 border border-white/6 text-sm text-gray-300">
                                <span>{f.icon}</span>
                                <span>{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom */}
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
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[400px]"
                >
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2.5 mb-8 lg:hidden">
                        <Image src="/web-app-manifest-192x192.png" alt="Logo" width={32} height={32} className="rounded-xl" />
                        <p className="text-white font-semibold">Personal Tracker</p>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">Welcome back</h1>
                        <p className="text-gray-500 text-sm">Sign in to continue your journey</p>
                    </div>

                    {/* Demo button */}
                    <button
                        type="button"
                        onClick={handleDemo}
                        disabled={demoLoading}
                        className="w-full mb-6 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-indigo-600/12 border border-indigo-500/25 text-indigo-300 text-sm font-medium hover:bg-indigo-600/20 hover:border-indigo-500/40 hover:text-indigo-200 transition-all duration-200 disabled:opacity-60"
                    >
                        {demoLoading ? (
                            <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Zap className="h-4 w-4" />
                        )}
                        {demoLoading ? 'Signing in…' : 'Try demo — sign in instantly'}
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/8" /></div>
                        <div className="relative flex justify-center text-xs text-gray-600">
                            <span className="px-3 bg-[#0a0a0f]">or sign in with email</span>
                        </div>
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

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-gray-400">Password</label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
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

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded accent-indigo-500"
                                />
                                <span className="text-sm text-gray-500">Remember me</span>
                            </label>
                            <button type="button" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-900/30 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign in <ArrowRight className="h-4 w-4" /></>
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        No account?{' '}
                        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Create one free
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}
