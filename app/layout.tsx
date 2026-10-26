import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PWAInstaller } from "@/components/pwa/PWAInstaller";
import { UpdatePrompt } from "@/components/pwa/UpdatePrompt";
import { SEO } from "@/components/SEO";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

// Ledger type roles: serif for headings, sans for reading, mono for labels and data.
const instrument = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
    variable: "--font-instrument",
});
const geist = Geist({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-geist",
});
const jetbrains = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--font-jetbrains",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tracker.ratnesh-maurya.com';
const siteName = "Personal Tracker — by Ratnesh Maurya";
const siteTitle = "Personal Tracker";
const siteDescription = "Free personal life tracker — track habits, streaks, sleep, food (Indian meals), study hours, expenses, and daily journal. Build better habits and achieve your goals. By Ratnesh Maurya.";
const authorUrl = "https://ratnesh-maurya.com";
const blogUrl = "https://blog.ratnesh-maurya.com";
const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@ratneshmaurya";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    // Follows the app's own theme (dark by default), not the OS; lib/theme.ts updates it.
    themeColor: "#0E0D0B",
};

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: siteName,
        template: `%s | ${siteTitle}`,
    },
    description: siteDescription,
    keywords: [
        "personal tracker", "habit tracker", "habit streak tracker",
        "life tracker app", "productivity tracker", "sleep tracker",
        "expense tracker India", "food tracker Indian meals", "study tracker",
        "journal app", "goal tracking", "self improvement app",
        "health tracker free", "daily routine tracker", "Ratnesh Maurya",
        "free habit app", "no login tracker", "PWA habit tracker",
    ],
    authors: [{ name: "Ratnesh Maurya", url: authorUrl }],
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
        siteName: siteTitle,
        title: siteName,
        description: siteDescription,
        images: [
            {
                url: `${siteUrl}/opengraph-image`,
                width: 1200,
                height: 630,
                alt: "Personal Tracker — Track habits, sleep, study, food, expenses & journal",
                type: "image/png",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteName,
        description: siteDescription,
        images: [`${siteUrl}/opengraph-image`],
        creator: twitterHandle,
        site: twitterHandle,
    },
    alternates: {
        canonical: siteUrl,
    },
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: siteTitle,
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
    category: "productivity",
    other: {
        "msapplication-TileColor": "#0E0D0B",
    },
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
        // Dark is the default; the inline script switches to a saved light theme before paint.
        <html
            lang="en"
            data-theme="dark"
            className={`${instrument.variable} ${geist.variable} ${jetbrains.variable}`}
            suppressHydrationWarning
        >
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
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
            <body>
                <SEO />
                <ErrorBoundary>
                    <Providers>
                        {children}
                        <PWAInstaller />
                        <UpdatePrompt />
                    </Providers>
                </ErrorBoundary>
            </body>
        </html>
    );
}

