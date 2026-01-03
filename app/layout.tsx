import type { Metadata } from "next";
import { Baloo_Bhai_2 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PWAInstaller } from "@/components/pwa/PWAInstaller";
import { PWAMeta } from "@/components/pwa/PWAMeta";
import { SEO } from "@/components/SEO";

const balooBhai2 = Baloo_Bhai_2({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-baloo-bhai-2",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tracker.ratnesh-maurya.com';
const siteName = "Personal Tracker";
const siteDescription = "Track your habits, sleep, food, study, expenses, and journal entries. A comprehensive personal life tracker to help you build better habits and achieve your goals.";
const siteImage = `${siteUrl}/web-app-manifest-512x512.png`;

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: siteName,
        template: `%s | ${siteName}`
    },
    description: siteDescription,
    keywords: [
        "habit tracker",
        "personal tracker",
        "life tracker",
        "productivity app",
        "sleep tracker",
        "expense tracker",
        "food tracker",
        "study tracker",
        "journal app",
        "goal tracking",
        "self improvement",
        "health tracker"
    ],
    authors: [{ name: "Ratnesh Maurya", url: "https://ratnesh-maurya.com" }],
    creator: "Ratnesh Maurya",
    publisher: "Ratnesh Maurya",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteUrl,
        siteName: siteName,
        title: siteName,
        description: siteDescription,
        images: [
            {
                url: siteImage,
                width: 1200,
                height: 630,
                alt: siteName,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteName,
        description: siteDescription,
        images: [siteImage],
        creator: process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@ratneshmaurya",
    },
    alternates: {
        canonical: siteUrl,
    },
    manifest: "/manifest.json",
    themeColor: "#3B82F6",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: siteName,
    },
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
    category: "productivity",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": siteName,
        "description": siteDescription,
        "url": siteUrl,
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
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5",
            "ratingCount": "1"
        }
    };

    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />

                {/* Structured Data for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </head>
            <body className={balooBhai2.className}>
                <PWAMeta />
                <SEO />
                <ErrorBoundary>
                    <Providers>
                        {children}
                        <PWAInstaller />
                    </Providers>
                </ErrorBoundary>
            </body>
        </html>
    );
}

