import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/account/',
        '/checkout/',
        '/cart/',
        '/login',
        '/register',
        '/forgot-password',
        '/verify-otp',
      ],
    },
    sitemap: 'https://prayogindia.com/sitemap.xml',
  };
}
