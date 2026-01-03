import { MetadataRoute } from 'next';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tracker.ratnesh-maurya.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    await connectDB();
    
    // Fetch all users (both public and private profiles for SEO)
    const users = await User.find({})
      .select('username profilePublic updatedAt')
      .lean();

    const userRoutes: MetadataRoute.Sitemap = users.map((user) => ({
      url: `${baseUrl}/u/${user.username}`,
      lastModified: user.updatedAt || new Date(),
      changeFrequency: 'daily' as const,
      priority: user.profilePublic ? 0.7 : 0.5, // Higher priority for public profiles
    }));

    return [...staticRoutes, ...userRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static routes if database connection fails
    return staticRoutes;
  }
}
