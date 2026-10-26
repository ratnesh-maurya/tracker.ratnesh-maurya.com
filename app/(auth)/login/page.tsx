'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { clearUserData } from '@/lib/query/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

const DEFAULT_EMAIL = 'test@example.com';
const DEFAULT_PASSWORD = 'password123';


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
        const data = await res.json();
        // Never show a previous account's cached data to this one
        if (data.success) await clearUserData();
        return data;
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
            <p className="py-24 font-mono text-sm text-muted-foreground" role="status" aria-live="polite">
                checking session…
            </p>
        );
    }

    return (
        <div className="saffron-hairline w-full max-w-[440px] rounded-card bg-card p-7 shadow-card sm:p-9">
            <p className="eyebrow">Sign in</p>
            <h1 className="display mt-3 text-[clamp(36px,4.4vw,48px)]">
                Welcome <em>back</em>
            </h1>
            <p className="mt-2 text-[15px] text-muted-foreground">Pick up where you left off.</p>

            <Button type="button" variant="outline" onClick={handleDemo} disabled={demoLoading} className="mt-7 w-full">
                {demoLoading ? 'Signing in…' : 'Try the demo — sign in instantly →'}
            </Button>

            <div className="my-6 flex items-center gap-3 font-mono text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" aria-hidden />
                or with email
                <span className="h-px flex-1 bg-border" aria-hidden />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="text-sm font-medium text-secondary-foreground">Password</label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
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

                <div className="flex items-center justify-between">
                    <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 accent-[hsl(var(--coral))]"
                        />
                        <span className="text-sm text-muted-foreground">Remember me</span>
                    </label>
                    <button type="button" className="font-mono text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground">
                        forgot password?
                    </button>
                </div>

                <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
                    {loading ? '…' : 'Sign in →'}
                </Button>
            </form>

            <p className="mt-6 text-sm text-muted-foreground">
                No account?{' '}
                <Link href="/register" className="text-coral transition-colors duration-150 hover:text-muted-foreground">
                    Create one, it’s free →
                </Link>
            </p>
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
