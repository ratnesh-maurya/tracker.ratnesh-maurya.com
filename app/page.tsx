'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from '@mui/x-charts/LineChart';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
    Sparkles as SparklesIcon,
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
    Plus
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const chartTheme = createTheme({
    palette: {
        mode: 'light',
    },
});

// Fake data for the chart
const chartData = {
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    sleep: [7.5, 8, 7, 8.5, 7.5, 9, 8],
    study: [2, 3, 1.5, 2.5, 3.5, 1, 2],
    expenses: [450, 200, 1200, 350, 600, 150, 300],
};

export default function LandingPage() {
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Structured Data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Personal Tracker",
        "description": "Track your habits, sleep, food, study, expenses, and journal entries. A comprehensive personal life tracker to help you build better habits and achieve your goals.",
        "url": "https://tracker.ratnesh-maurya.com",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Person",
            "name": "Ratnesh Maurya",
            "url": "https://ratnesh-maurya.com"
        },
        "featureList": [
            "Habit Tracking with Streak Monitoring",
            "Sleep Analytics and Duration Tracking",
            "Food Logging with North Indian Food Database",
            "Study Time Tracker with Topic Categorization",
            "Expense Management with Multi-Currency Support",
            "Daily Journal for Thoughts and Reflections",
            "Interactive Analytics Dashboard",
            "PWA Support for Mobile Installation"
        ],
        "screenshot": "https://tracker.ratnesh-maurya.com/web-app-manifest-512x512.png",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5",
            "ratingCount": "1"
        }
    };

    const faqStructuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is Personal Tracker?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Personal Tracker is a comprehensive web application that helps you track your habits, sleep patterns, food intake, study sessions, expenses, and daily journal entries. It provides analytics and insights to help you build better habits and achieve your goals."
                }
            },
            {
                "@type": "Question",
                "name": "Is Personal Tracker free to use?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Personal Tracker is completely free to use. You can sign up and start tracking your life activities immediately without any cost."
                }
            },
            {
                "@type": "Question",
                "name": "Can I use Personal Tracker on my phone?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Personal Tracker is a Progressive Web App (PWA) that can be installed on your phone for offline access. It works seamlessly on both desktop and mobile devices."
                }
            },
            {
                "@type": "Question",
                "name": "What features does Personal Tracker offer?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Personal Tracker offers habit tracking with streak monitoring, sleep analytics, food logging with North Indian food database, study time tracking, expense management with multi-currency support, daily journaling, and interactive analytics dashboard."
                }
            }
        ]
    };

    return (
        <>
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 bg-gray-900/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-3">
                                <Image
                                    src="/web-app-manifest-192x192.png"
                                    alt="Personal Tracker Logo"
                                    width={32}
                                    height={32}
                                    className="rounded-lg"
                                />
                                <span className="text-xl font-bold text-white">
                                    Personal Tracker
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link href="/login">
                                    <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative overflow-hidden pt-20 pb-32 bg-gradient-to-b from-white via-blue-50/30 to-white">
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 tracking-tight">
                                    Track Your Life,
                                    <br />
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        Transform Your Future
                                    </span>
                                </h1>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                            >
                                <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto font-light">
                                    A comprehensive personal tracker to help you build better habits,
                                    track your progress, and achieve your goals.
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                            >
                                <Link href="/register">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg">
                                            Start Tracking Free
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href="/login">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button size="lg" variant="outline" className="text-lg px-8 py-6 border border-gray-300 hover:border-gray-400 rounded-lg transition-all duration-200">
                                            Sign In
                                        </Button>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Preview Section */}
                <section className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
                                Your Personal Dashboard
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                                Get a complete overview of your life at a glance
                            </p>
                        </motion.div>

                        {/* Dashboard Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="relative"
                        >
                            <Link href="/register">
                                <Card className="border-0 shadow-xl overflow-hidden bg-white rounded-xl cursor-pointer hover:shadow-2xl transition-all duration-300">
                                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-2xl text-white">Dashboard</CardTitle>
                                                <CardDescription className="text-blue-100">Welcome back! Here&apos;s your overview</CardDescription>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                                                <TrendingUp className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        {/* Chart Preview */}
                                        <div className="bg-white rounded-lg border-0 shadow-sm">
                                            <div className="px-4 pt-4 pb-3">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-semibold text-gray-900">Last 7 Days Overview</h3>
                                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="px-0 md:px-6 pb-4">
                                                <div className="w-full">
                                                    <ThemeProvider theme={chartTheme}>
                                                        <LineChart
                                                            xAxis={[{
                                                                scaleType: 'point',
                                                                data: chartData.dates,
                                                            }]}
                                                            yAxis={[
                                                                { id: 'leftAxis' },
                                                                { id: 'rightAxis', position: 'right' },
                                                            ]}
                                                            series={[
                                                                {
                                                                    data: chartData.sleep,
                                                                    label: 'Sleep',
                                                                    color: '#6366f1',
                                                                    yAxisId: 'leftAxis',
                                                                },
                                                                {
                                                                    data: chartData.study,
                                                                    label: 'Study',
                                                                    color: '#9333ea',
                                                                    yAxisId: 'leftAxis',
                                                                },
                                                                {
                                                                    data: chartData.expenses.map(v => v / 100),
                                                                    label: 'Expenses',
                                                                    color: '#eab308',
                                                                    yAxisId: 'rightAxis',
                                                                },
                                                            ]}
                                                            height={280}
                                                            margin={isMobile ? { left: 5, right: 5, top: 10, bottom: 40 } : { left: 30, right: 35, top: 10, bottom: 40 }}
                                                            sx={{
                                                                width: '100%',
                                                                '& .MuiChartsAxis-root': {
                                                                    fontSize: '0.6rem',
                                                                },
                                                                '& .MuiChartsLegend-root': {
                                                                    fontSize: '0.6rem',
                                                                },
                                                            }}
                                                        />
                                                    </ThemeProvider>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Add Section */}
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3">Quick Add</h3>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { icon: Coffee, label: 'Food', color: 'from-green-400 to-green-500' },
                                                    { icon: Bed, label: 'Sleep', color: 'from-indigo-400 to-indigo-500' },
                                                    { icon: IndianRupee, label: 'Expense', color: 'from-yellow-400 to-yellow-500' }
                                                ].map((item, idx) => (
                                                    <button
                                                        key={idx}
                                                        className={`bg-gradient-to-br ${item.color} text-white p-4 rounded-lg hover:scale-105 transition-transform flex flex-col items-center gap-2 shadow-sm`}
                                                    >
                                                        <item.icon className="h-6 w-6" />
                                                        <span className="text-sm font-medium">{item.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quick Access */}
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3">Quick Access</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {[
                                                    { icon: SparklesIcon, label: 'Habits', color: 'from-purple-400 to-purple-500' },
                                                    { icon: GraduationCap, label: 'Study', color: 'from-purple-400 to-purple-500' },
                                                    { icon: BookOpen, label: 'Journal', color: 'from-pink-400 to-pink-500' },
                                                    { icon: IndianRupee, label: 'Expenses', color: 'from-yellow-400 to-yellow-500' },
                                                    { icon: Bed, label: 'Sleep', color: 'from-indigo-400 to-indigo-500' },
                                                    { icon: Coffee, label: 'Food', color: 'from-green-400 to-green-500' }
                                                ].map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-gray-50 border border-gray-200 shadow-sm rounded-lg p-3 hover:shadow-md transition-all flex items-center gap-3"
                                                    >
                                                        <div className={`bg-gradient-to-br ${item.color} p-2 rounded-lg shadow-sm`}>
                                                            <item.icon className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Page Previews Section */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
                                See It In Action
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                                Explore the beautiful, intuitive interface designed for your success
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Habits Page Preview */}
                            <Link href="/register">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                >
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                                            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                                <div className="flex items-center gap-3">
                                                    <SparklesIcon className="h-6 w-6" />
                                                    <CardTitle className="text-white">Habits Tracker</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4 bg-gradient-to-br from-purple-50 to-pink-50">
                                                {[
                                                    { name: 'Morning Exercise', streak: 7, type: 'daily' },
                                                    { name: 'Read 30 minutes', streak: 12, type: 'daily' },
                                                    { name: 'Drink 8 glasses water', streak: 5, type: 'daily' }
                                                ].map((habit, idx) => (
                                                    <div key={idx} className="bg-purple-200 rounded-lg p-4 border-0 shadow-sm">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-semibold text-gray-900">{habit.name}</span>
                                                            <div className="flex items-center gap-1 text-orange-500">
                                                                <Flame className="h-4 w-4" />
                                                                <span className="text-sm font-bold">{habit.streak}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{habit.type}</span>
                                                            <Button size="sm" className="ml-auto bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-sm">
                                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                Check In
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            </Link>

                            {/* Analytics Page Preview */}
                            <Link href="/register">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                >
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                                            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                                <div className="flex items-center gap-3">
                                                    <BarChart3 className="h-6 w-6" />
                                                    <CardTitle className="text-white">Analytics Dashboard</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                                                <div className="bg-blue-200 rounded-lg p-4 border-0 shadow-sm">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-medium text-gray-600">Sleep Analytics</span>
                                                        <Bed className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded flex items-center justify-center border-2 border-dashed border-blue-200">
                                                        <BarChart3 className="h-12 w-12 text-blue-400" />
                                                    </div>
                                                    <div className="mt-3 flex justify-between text-sm">
                                                        <span className="text-gray-600">Avg Duration</span>
                                                        <span className="font-semibold text-gray-900">8h 30m</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-blue-200 rounded-lg p-4 border-0 shadow-sm">
                                                        <div className="text-sm text-gray-600 mb-1">Study Hours</div>
                                                        <div className="text-2xl font-bold text-gray-900">24.5h</div>
                                                    </div>
                                                    <div className="bg-blue-200 rounded-lg p-4 border-0 shadow-sm">
                                                        <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
                                                        <div className="text-2xl font-bold text-gray-900">₹1,560</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            </Link>

                            {/* Study Tracker Preview */}
                            <Link href="/register">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                                >
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                                            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                                                <div className="flex items-center gap-3">
                                                    <GraduationCap className="h-6 w-6" />
                                                    <CardTitle className="text-white">Study Tracker</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-3 bg-gradient-to-br from-green-50 to-emerald-50">
                                                {[
                                                    { topic: 'DSA', duration: '2.5h', tags: ['leetcode', 'arrays'] },
                                                    { topic: 'System Design', duration: '1.5h', tags: ['hld', 'lld'] },
                                                    { topic: 'Golang', duration: '3h', tags: ['concurrency', 'channels'] }
                                                ].map((session, idx) => (
                                                    <div key={idx} className="bg-green-200 rounded-lg p-4 border-0 shadow-sm">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-semibold text-gray-900">{session.topic}</span>
                                                            <span className="text-sm font-bold text-green-600">{session.duration}</span>
                                                        </div>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {session.tags.map((tag, i) => (
                                                                <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            </Link>

                            {/* Expenses Preview */}
                            <Link href="/register">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                                >
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                                            <CardHeader className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white">
                                                <div className="flex items-center gap-3">
                                                    <IndianRupee className="h-6 w-6" />
                                                    <CardTitle className="text-white">Expense Tracker</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-3 bg-gradient-to-br from-yellow-50 to-amber-50">
                                                {[
                                                    { category: 'Food', amount: '₹450', date: 'Today' },
                                                    { category: 'Transport', amount: '₹200', date: 'Today' },
                                                    { category: 'Shopping', amount: '₹1,200', date: 'Yesterday' }
                                                ].map((expense, idx) => (
                                                    <div key={idx} className="bg-yellow-200 rounded-lg p-4 border-0 shadow-sm flex items-center justify-between">
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{expense.category}</div>
                                                            <div className="text-xs text-gray-500">{expense.date}</div>
                                                        </div>
                                                        <div className="text-lg font-bold text-gray-900">{expense.amount}</div>
                                                    </div>
                                                ))}
                                                <div className="bg-yellow-200 rounded-lg p-4 border-2 border-yellow-300 border-dashed">
                                                    <div className="text-center text-sm text-gray-600">
                                                        <Plus className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                                                        Add Expense
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Key Features */}
                <section className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
                                Why Choose Personal Tracker?
                            </h2>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: BarChart3,
                                    title: 'Beautiful Analytics',
                                    description: 'Visualize your progress with interactive charts and insights powered by MUI X Charts.'
                                },
                                {
                                    icon: Calendar,
                                    title: 'Activity Calendar',
                                    description: 'See your streaks and daily activity at a glance with a Google Calendar-style view.'
                                },
                                {
                                    icon: Zap,
                                    title: 'Quick Actions',
                                    description: 'Log entries instantly with quick-add modals from your dashboard.'
                                },
                                {
                                    icon: Target,
                                    title: 'Goal Tracking',
                                    description: 'Set and achieve your goals with daily, weekly, and monthly tracking.'
                                },
                                {
                                    icon: Shield,
                                    title: 'Secure & Private',
                                    description: 'Your data is encrypted and secure. Control your privacy settings.'
                                },
                                {
                                    icon: Smartphone,
                                    title: 'PWA Ready',
                                    description: 'Install as a native app on your phone for offline access.'
                                }
                            ].map((benefit, index) => {
                                const Icon = benefit.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.08 }}
                                        whileHover={{ y: -2 }}
                                    >
                                        <div className="flex items-start space-x-4 p-6 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-all duration-300">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                                    <Icon className="h-5 w-5 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2 text-gray-900">{benefit.title}</h3>
                                                <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-blue-600">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                                Ready to Transform Your Life?
                            </h2>
                            <p className="text-lg text-blue-100 mb-10 font-light">
                                Join thousands of users who are already tracking their progress and achieving their goals
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/register">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-6 rounded-lg shadow-md">
                                            Get Started Free
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href="/login">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-lg">
                                            Sign In
                                        </Button>
                                    </motion.div>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-gray-400 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="flex items-center space-x-3 mb-4 md:mb-0">
                                <Image
                                    src="/web-app-manifest-192x192.png"
                                    alt="Personal Tracker Logo"
                                    width={32}
                                    height={32}
                                    className="rounded-lg"
                                />
                                <span className="text-lg font-semibold text-white">Personal Tracker</span>
                            </div>
                            <p className="text-sm">
                                Built by{' '}
                                <a
                                    href="https://ratnesh-maurya.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 hover:underline"
                                >
                                    Ratnesh Maurya
                                </a>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
