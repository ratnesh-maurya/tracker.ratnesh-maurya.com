import { Metadata } from 'next';
import { PublicProfilePageClient } from './client';

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
    const { username } = params;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tracker.ratnesh-maurya.com';

    try {
        const res = await fetch(`${siteUrl}/api/users/${username}/public`, {
            cache: 'no-store',
            next: { revalidate: 3600 } // Revalidate every hour
        });
        const data = await res.json();

        if (data.success && data.data) {
            const profile = data.data;
            const name = profile.name || username;
            const stats = profile.stats || {};
            const habits = stats.habits || {};
            const study = stats.study || {};

            const title = `${name}'s Progress Tracker | Personal Tracker`;
            const description = `View ${name}'s progress: ${habits.totalHabits || 0} habits, ${study.totalHours || 0} study hours, ${habits.activeStreaks || 0} day streak. Track your habits and achieve your goals!`;
            const url = `${siteUrl}/u/${username}`;
            const image = `${siteUrl}/web-app-manifest-512x512.png`;

            return {
                title,
                description,
                keywords: [
                    `${name} tracker`,
                    `${username} profile`,
                    'habit tracker',
                    'personal tracker',
                    'progress tracker',
                    'productivity',
                    'goal tracking',
                ],
                openGraph: {
                    type: 'profile',
                    title,
                    description,
                    url,
                    siteName: 'Personal Tracker',
                    images: [{
                        url: image,
                        width: 1200,
                        height: 630,
                        alt: `${name}'s Progress Tracker`,
                    }],
                },
                twitter: {
                    card: 'summary_large_image',
                    title,
                    description,
                    images: [image],
                },
                alternates: {
                    canonical: url,
                },
                robots: {
                    index: true,
                    follow: true,
                    googleBot: {
                        index: true,
                        follow: true,
                    },
                },
            };
        }
    } catch (error) {
        console.error('Error generating metadata:', error);
    }

    return {
        title: `${username}'s Profile | Personal Tracker`,
        description: `View ${username}'s progress and achievements on Personal Tracker`,
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default function PublicProfilePage({ params }: { params: { username: string } }) {
    return <PublicProfilePageClient params={params} />;
}
