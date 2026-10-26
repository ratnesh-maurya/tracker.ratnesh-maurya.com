'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { clearUserData } from '@/lib/query/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';


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
            if (data.success) { await clearUserData(); router.push('/dashboard'); router.refresh(); }
            else setError(data.error || 'Registration failed');
        } catch { setError('An error occurred. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="saffron-hairline w-full max-w-[440px] rounded-card bg-card p-7 shadow-card sm:p-9">
            {refUsername && (
                <p className="mb-6 rounded-inner border border-border bg-muted px-4 py-3 text-sm text-body">
                    <span className="font-mono text-kicker">@{refUsername}</span> invited you. Their streaks are waiting for company.
                </p>
            )}

            <p className="eyebrow">Create an account</p>
            <h1 className="display mt-3 text-[clamp(36px,4.4vw,48px)]">
                Start the <em>streak</em>
            </h1>
            <p className="mt-2 text-[15px] text-muted-foreground">Free, and it takes about thirty seconds.</p>

            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
                {error && (
                    <p role="alert" className="rounded-inner border border-kicker/30 px-4 py-3 text-sm text-kicker">
                        {error}
                    </p>
                )}

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-secondary-foreground">Email</label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-sm font-medium text-secondary-foreground">
                            Name <span className="font-mono text-xs font-normal text-muted-foreground">optional</span>
                        </label>
                        <Input
                            id="name"
                            type="text"
                            autoComplete="name"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="username" className="text-sm font-medium text-secondary-foreground">Username</label>
                        <Input
                            id="username"
                            type="text"
                            autoComplete="username"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            maxLength={30}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="text-sm font-medium text-secondary-foreground">Password</label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.8} aria-hidden /> : <Eye className="h-4 w-4" strokeWidth={1.8} aria-hidden />}
                        </button>
                    </div>
                </div>

                <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 accent-[hsl(var(--coral))]"
                    />
                    <span className="text-sm text-muted-foreground">Remember me for 30 days</span>
                </label>

                <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
                    {loading ? '…' : 'Create account →'}
                </Button>
            </form>

            <p className="mt-6 text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-coral transition-colors duration-150 hover:text-muted-foreground">
                    Sign in →
                </Link>
            </p>
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
