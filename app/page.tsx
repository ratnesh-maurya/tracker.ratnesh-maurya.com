'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Bed,
    Coffee,
    IndianRupee,
    GraduationCap,
    BookOpen,
    TrendingUp,
    ArrowRight,
    BarChart3,
    Calendar,
    Target,
    Zap,
    Shield,
    Smartphone,
    Flame,
    CheckCircle2,
    Plus,
    Sparkles,
    Check,
    Star,
    PlayCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (delay = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }
    })
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: (delay = 0) => ({
        opacity: 1,
        transition: { duration: 0.5, delay }
    })
};

const features = [
    { icon: Sparkles, label: 'Habits', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', desc: 'Build streaks, quit bad habits' },
    { icon: Bed, label: 'Sleep', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', desc: 'Track sleep quality & duration' },
    { icon: Coffee, label: 'Food', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', desc: 'Log meals & calories' },
    { icon: GraduationCap, label: 'Study', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', desc: 'Focus sessions & topics' },
    { icon: IndianRupee, label: 'Expenses', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', desc: 'Budgets & spending insight' },
    { icon: BookOpen, label: 'Journal', color: '#ec4899', bg: 'rgba(236,72,153,0.12)', desc: 'Daily reflections & notes' },
];

const benefits = [
    { icon: BarChart3, title: 'Beautiful Analytics', description: 'Interactive charts that reveal patterns in your daily life at a glance.' },
    { icon: Calendar, title: 'Activity Calendar', description: 'GitHub-style heatmap showing your streaks and momentum.' },
    { icon: Zap, title: 'Quick Actions', description: 'Log anything in seconds with streamlined one-tap modals.' },
    { icon: Target, title: 'Goal Tracking', description: 'Set daily, weekly, and monthly goals and watch yourself hit them.' },
    { icon: Shield, title: 'Secure & Private', description: 'JWT auth, httpOnly cookies, and full control over your privacy.' },
    { icon: Smartphone, title: 'Install as App', description: 'PWA support — add to home screen for a native-like experience.' },
];

const habits = [
    { name: 'Morning Exercise', streak: 7 },
    { name: 'Read 30 minutes', streak: 12 },
    { name: 'Drink 8 glasses water', streak: 5 },
];

const studySessions = [
    { topic: 'DSA', duration: '2.5h', tags: ['leetcode', 'arrays'] },
    { topic: 'System Design', duration: '1.5h', tags: ['hld', 'lld'] },
    { topic: 'Golang', duration: '3h', tags: ['concurrency'] },
];

const expenses = [
    { category: 'Food', amount: '₹450', date: 'Today' },
    { category: 'Transport', amount: '₹200', date: 'Today' },
    { category: 'Shopping', amount: '₹1,200', date: 'Yesterday' },
];

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [demoLoading, setDemoLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const handleTryDemo = async () => {
        setDemoLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@example.com', password: 'password123', rememberMe: true }),
            });
            const data = await res.json();
            if (data.success) {
                router.push('/dashboard');
                router.refresh();
            } else {
                // Fallback: redirect to login with demo param pre-filled
                router.push('/login?demo=1');
            }
        } catch {
            router.push('/login?demo=1');
        } finally {
            setDemoLoading(false);
        }
    };

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Personal Tracker",
        "description": "Track your habits, sleep, food, study, expenses, and journal entries.",
        "url": "https://tracker.ratnesh-maurya.com",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "author": { "@type": "Person", "name": "Ratnesh Maurya", "url": "https://ratnesh-maurya.com" },
    };

    const faqStructuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            { "@type": "Question", "name": "What is Personal Tracker?", "acceptedAnswer": { "@type": "Answer", "text": "A comprehensive web app to track habits, sleep, food, study, expenses, and journal entries." } },
            { "@type": "Question", "name": "Is it free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, completely free." } },
            { "@type": "Question", "name": "Does it work on mobile?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, it's a PWA that can be installed on your phone." } },
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />

            <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

                {/* ── Navbar ── */}
                <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20' : 'bg-transparent'}`}>
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Image src="/web-app-manifest-192x192.png" alt="Logo" width={30} height={30} className="rounded-lg" />
                            <span className="text-base font-semibold text-white tracking-tight">Personal Tracker</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/8 text-sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 rounded-lg shadow-lg shadow-indigo-900/40 transition-all duration-200">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* ── Hero ── */}
                <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-20 overflow-hidden">
                    {/* Background glows */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
                        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/8 rounded-full blur-[100px]" />
                        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-600/8 rounded-full blur-[100px]" />
                        {/* Dot grid */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                            backgroundSize: '28px 28px'
                        }} />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8 backdrop-blur-sm"
                        >
                            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                            <span>Free forever · No credit card needed</span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={0.08}
                            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
                        >
                            Track your life,
                            <br />
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                build momentum
                            </span>
                        </motion.h1>

                        {/* Sub */}
                        <motion.p
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={0.16}
                            className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
                        >
                            One app for habits, sleep, food, study, expenses and journaling — with beautiful analytics to keep you growing.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={0.24}
                            className="flex flex-col sm:flex-row items-center justify-center gap-3"
                        >
                            <Link href="/register">
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-6 text-base font-medium rounded-xl shadow-xl shadow-indigo-900/40 transition-all duration-200 flex items-center gap-2">
                                        Start for free
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            </Link>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <button
                                    onClick={handleTryDemo}
                                    disabled={demoLoading}
                                    className="flex items-center gap-2.5 px-7 py-[14px] rounded-xl border border-white/12 bg-white/4 hover:bg-white/8 text-gray-300 hover:text-white text-base font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-60"
                                >
                                    {demoLoading ? (
                                        <span className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <PlayCircle className="h-4 w-4 text-indigo-400" />
                                    )}
                                    {demoLoading ? 'Loading…' : 'Try demo'}
                                </button>
                            </motion.div>
                        </motion.div>

                        {/* Social proof */}
                        <motion.div
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                            custom={0.4}
                            className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-500"
                        >
                            <div className="flex -space-x-2">
                                {['#6366f1', '#a855f7', '#ec4899', '#3b82f6'].map((c, i) => (
                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: c }}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                            </div>
                            <span>Joined by developers & students</span>
                        </motion.div>
                    </div>

                    {/* Feature pills */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={0.32}
                        className="relative z-10 mt-16 flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto"
                    >
                        {features.map((f) => (
                            <div
                                key={f.label}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/8 bg-white/4 backdrop-blur-sm text-sm font-medium text-gray-300 hover:border-white/16 hover:bg-white/8 transition-all duration-200 cursor-default"
                            >
                                <f.icon className="h-4 w-4" style={{ color: f.color }} />
                                {f.label}
                            </div>
                        ))}
                    </motion.div>
                </section>

                {/* ── Tracker Categories ── */}
                <section className="py-24 px-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d18] to-[#0a0a0f] pointer-events-none" />
                    <div className="relative max-w-6xl mx-auto">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="text-center mb-14"
                        >
                            <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3">Everything in one place</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Six trackers, one app</h2>
                        </motion.div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {features.map((f, i) => (
                                <motion.div
                                    key={f.label}
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    custom={i * 0.06}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className="group relative p-6 rounded-2xl border border-white/6 bg-white/3 hover:border-white/12 hover:bg-white/6 transition-all duration-300 cursor-default"
                                >
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: f.bg }}>
                                        <f.icon className="h-5 w-5" style={{ color: f.color }} />
                                    </div>
                                    <h3 className="font-semibold text-white mb-1">{f.label}</h3>
                                    <p className="text-sm text-gray-500">{f.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Dashboard Preview ── */}
                <section className="py-24 px-4 relative">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px]" />
                    </div>
                    <div className="relative max-w-5xl mx-auto">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="text-center mb-14"
                        >
                            <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3">Dashboard</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Your life at a glance</h2>
                            <p className="text-gray-400 text-lg max-w-xl mx-auto">Quick-add anything, see weekly trends, and stay on top of every goal.</p>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={0.1}
                        >
                            <Link href="/register">
                                <motion.div
                                    whileHover={{ scale: 1.008 }}
                                    transition={{ duration: 0.25 }}
                                    className="rounded-2xl border border-white/8 bg-[#111118] overflow-hidden shadow-2xl shadow-black/50 cursor-pointer hover:border-indigo-500/20 transition-all duration-300"
                                >
                                    {/* Dashboard header */}
                                    <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90 px-6 py-4 flex items-center justify-between border-b border-white/8">
                                        <div>
                                            <p className="text-white font-semibold text-lg">Dashboard</p>
                                            <p className="text-indigo-200 text-sm">Welcome back! Here&apos;s your overview</p>
                                        </div>
                                        <TrendingUp className="h-5 w-5 text-white/70" />
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Stats row */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { label: 'Habits Done', value: '4/6', color: '#a855f7' },
                                                { label: 'Study Hours', value: '2.5h', color: '#6366f1' },
                                                { label: 'Sleep Avg', value: '7.8h', color: '#22c55e' },
                                            ].map((s) => (
                                                <div key={s.label} className="rounded-xl bg-white/4 border border-white/6 p-4">
                                                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                                                    <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Quick add */}
                                        <div>
                                            <p className="text-sm font-medium text-gray-400 mb-3">Quick Add</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { icon: Coffee, label: 'Food', from: '#16a34a', to: '#15803d' },
                                                    { icon: Bed, label: 'Sleep', from: '#4f46e5', to: '#4338ca' },
                                                    { icon: IndianRupee, label: 'Expense', from: '#d97706', to: '#b45309' },
                                                ].map((item) => (
                                                    <div
                                                        key={item.label}
                                                        className="flex flex-col items-center gap-2 p-4 rounded-xl text-white font-medium text-sm transition-all duration-200 hover:scale-105 hover:brightness-110"
                                                        style={{ background: `linear-gradient(135deg, ${item.from}, ${item.to})` }}
                                                    >
                                                        <item.icon className="h-5 w-5" />
                                                        <span>{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quick access grid */}
                                        <div>
                                            <p className="text-sm font-medium text-gray-400 mb-3">Quick Access</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {features.map((f) => (
                                                    <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/6 hover:bg-white/7 transition-all duration-200">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: f.bg }}>
                                                            <f.icon className="h-4 w-4" style={{ color: f.color }} />
                                                        </div>
                                                        <span className="text-sm text-gray-300 font-medium">{f.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* ── Page Previews ── */}
                <section className="py-24 px-4">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="text-center mb-14"
                        >
                            <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3">Explore</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">See it in action</h2>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Habits */}
                            <PreviewCard
                                href="/register"
                                gradient="from-purple-600/90 to-pink-600/90"
                                glowColor="rgba(168,85,247,0.12)"
                                icon={<Sparkles className="h-5 w-5 text-white" />}
                                title="Habits Tracker"
                                delay={0}
                            >
                                <div className="space-y-3">
                                    {habits.map((h, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/6 border border-white/6">
                                            <span className="text-sm font-medium text-gray-200">{h.name}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-orange-400">
                                                    <Flame className="h-3.5 w-3.5 fill-orange-400" />
                                                    <span className="text-xs font-bold">{h.streak}</span>
                                                </div>
                                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Done
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </PreviewCard>

                            {/* Study */}
                            <PreviewCard
                                href="/register"
                                gradient="from-emerald-600/90 to-teal-600/90"
                                glowColor="rgba(16,185,129,0.12)"
                                icon={<GraduationCap className="h-5 w-5 text-white" />}
                                title="Study Tracker"
                                delay={0.05}
                            >
                                <div className="space-y-3">
                                    {studySessions.map((s, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-white/6 border border-white/6">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-gray-200">{s.topic}</span>
                                                <span className="text-sm font-bold text-emerald-400">{s.duration}</span>
                                            </div>
                                            <div className="flex gap-1.5 flex-wrap">
                                                {s.tags.map((t, j) => (
                                                    <span key={j} className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-medium">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </PreviewCard>

                            {/* Analytics */}
                            <PreviewCard
                                href="/register"
                                gradient="from-blue-600/90 to-indigo-600/90"
                                glowColor="rgba(59,130,246,0.12)"
                                icon={<BarChart3 className="h-5 w-5 text-white" />}
                                title="Analytics Dashboard"
                                delay={0.1}
                            >
                                <div className="space-y-3">
                                    <div className="p-4 rounded-xl bg-white/6 border border-white/6">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm text-gray-400">Weekly Sleep</span>
                                            <Bed className="h-4 w-4 text-indigo-400" />
                                        </div>
                                        {/* Simple bar chart visualization */}
                                        <div className="flex items-end gap-1.5 h-16">
                                            {[7.5, 8, 7, 8.5, 7.5, 9, 8].map((v, i) => (
                                                <div key={i} className="flex-1 rounded-sm bg-indigo-500/40" style={{ height: `${(v / 10) * 100}%` }} />
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-gray-600">
                                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-white/6 border border-white/6">
                                            <p className="text-xs text-gray-500 mb-1">Study Hours</p>
                                            <p className="text-2xl font-bold text-blue-400">24.5h</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/6 border border-white/6">
                                            <p className="text-xs text-gray-500 mb-1">Total Expenses</p>
                                            <p className="text-2xl font-bold text-amber-400">₹1,560</p>
                                        </div>
                                    </div>
                                </div>
                            </PreviewCard>

                            {/* Expenses */}
                            <PreviewCard
                                href="/register"
                                gradient="from-amber-600/90 to-orange-600/90"
                                glowColor="rgba(245,158,11,0.12)"
                                icon={<IndianRupee className="h-5 w-5 text-white" />}
                                title="Expense Tracker"
                                delay={0.15}
                            >
                                <div className="space-y-3">
                                    {expenses.map((e, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/6 border border-white/6">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-200">{e.category}</p>
                                                <p className="text-xs text-gray-500">{e.date}</p>
                                            </div>
                                            <span className="text-base font-bold text-amber-400">{e.amount}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/12 text-gray-500 text-sm hover:border-amber-500/30 hover:text-amber-400 transition-colors cursor-pointer">
                                        <Plus className="h-4 w-4" />
                                        Add Expense
                                    </div>
                                </div>
                            </PreviewCard>
                        </div>
                    </div>
                </section>

                {/* ── Why Choose ── */}
                <section className="py-24 px-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d18] to-[#0a0a0f] pointer-events-none" />
                    <div className="relative max-w-6xl mx-auto">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="text-center mb-14"
                        >
                            <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3">Why choose us</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Built for real life</h2>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {benefits.map((b, i) => (
                                <motion.div
                                    key={b.title}
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    custom={i * 0.07}
                                    whileHover={{ y: -3 }}
                                    className="p-6 rounded-2xl border border-white/6 bg-white/3 hover:border-white/10 hover:bg-white/5 transition-all duration-300"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600/15 flex items-center justify-center mb-4">
                                        <b.icon className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-2">{b.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{b.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Free Plan ── */}
                <section className="py-24 px-4">
                    <div className="max-w-xl mx-auto">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="text-center mb-10"
                        >
                            <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3">Pricing</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Always free</h2>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={0.1}
                            whileHover={{ y: -3 }}
                            className="rounded-2xl border border-indigo-500/25 bg-gradient-to-b from-indigo-600/10 to-transparent p-8 text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                            <div className="relative">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-5">
                                    ✦ Free Forever
                                </div>
                                <div className="text-5xl font-bold text-white mb-1">₹0</div>
                                <p className="text-gray-500 mb-7">per month, always</p>

                                <ul className="space-y-3 mb-8 text-left">
                                    {[
                                        'All 6 trackers included',
                                        'Unlimited log entries',
                                        'Analytics & charts',
                                        'Activity calendar',
                                        'PWA — install on phone',
                                        'Secure & private data',
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                                            <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                                <Check className="h-3 w-3 text-indigo-400" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/register" className="block">
                                    <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-6 rounded-xl shadow-lg shadow-indigo-900/40 transition-all duration-200">
                                        Get started free
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="py-28 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]" />
                    </div>
                    <div className="relative max-w-3xl mx-auto text-center">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                                Ready to start
                                <br />
                                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    tracking?
                                </span>
                            </h2>
                            <p className="text-lg text-gray-400 mb-10 font-light max-w-lg mx-auto">
                                Sign up in seconds and start building better habits today. No credit card, no setup — just track.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link href="/register">
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 text-base font-medium rounded-xl shadow-xl shadow-indigo-900/40 transition-all duration-200">
                                            Start for free
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                </Link>
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <button
                                        onClick={handleTryDemo}
                                        disabled={demoLoading}
                                        className="flex items-center gap-2.5 px-8 py-[14px] rounded-xl border border-white/12 bg-white/4 hover:bg-white/8 text-gray-300 hover:text-white text-base font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-60"
                                    >
                                        {demoLoading ? <span className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" /> : <PlayCircle className="h-4 w-4 text-indigo-400" />}
                                        {demoLoading ? 'Loading…' : 'Try demo'}
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="border-t border-white/5 py-10 px-4">
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <Image src="/web-app-manifest-192x192.png" alt="Logo" width={28} height={28} className="rounded-lg" />
                            <span className="text-sm font-semibold text-gray-300">Personal Tracker</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Built with ♥ by{' '}
                            <a href="https://ratnesh-maurya.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                Ratnesh Maurya
                            </a>
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function PreviewCard({
    href,
    gradient,
    glowColor,
    icon,
    title,
    delay,
    children,
}: {
    href: string;
    gradient: string;
    glowColor: string;
    icon: React.ReactNode;
    title: string;
    delay: number;
    children: React.ReactNode;
}) {
    return (
        <Link href={href}>
            <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={delay}
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-white/6 bg-[#111118] overflow-hidden shadow-xl shadow-black/30 cursor-pointer hover:border-white/12 hover:shadow-2xl transition-all duration-300 relative"
            >
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" style={{ boxShadow: `inset 0 0 60px ${glowColor}` }} />
                <div className={`bg-gradient-to-r ${gradient} px-5 py-4 flex items-center gap-3`}>
                    {icon}
                    <h3 className="font-semibold text-white">{title}</h3>
                </div>
                <div className="p-5">
                    {children}
                </div>
            </motion.div>
        </Link>
    );
}
