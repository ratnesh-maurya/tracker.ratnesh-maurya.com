import type { Metadata, Viewport } from "next";
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
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#0d0d1a" },
        { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    ],
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
        "msapplication-TileColor": "#6366f1",
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
        <html lang="en">
            <head>
                {/* Apply dark mode before paint to prevent flash */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var s=localStorage.getItem('darkMode');var dark=s!==null?s==='true':true;if(dark){document.documentElement.classList.add('dark');if(s===null)localStorage.setItem('darkMode','true')}}catch(e){}})();`,
                    }}
                />
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

