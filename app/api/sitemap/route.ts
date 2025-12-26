import { NextResponse } from 'next/server';

// ==================== CONFIGURATION ====================

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://freesetu.com';

// ==================== STATIC PAGES ====================

const staticPages = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/services', priority: 0.9, changefreq: 'daily' },
  { url: '/about', priority: 0.7, changefreq: 'monthly' },
  { url: '/contact', priority: 0.7, changefreq: 'monthly' },
  { url: '/privacy-policy', priority: 0.3, changefreq: 'yearly' },
  { url: '/terms-of-service', priority: 0.3, changefreq: 'yearly' },
];

// ==================== SERVICE CATEGORIES ====================

const serviceCategories = [
  'recruitment-agencies',
  'migration-visa',
  'beauty',
  'dentist',
  'eye-care',
  'doctors',
  'mental-health',
  'nutrition',
  'physiotherapy',
  'legal-services',
  'gym',
  'yoga',
];

// ==================== SITEMAP GENERATOR ====================

export async function GET() {
  const currentDate = new Date().toISOString().split('T')[0];

  // Build sitemap XML
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Add static pages
  for (const page of staticPages) {
    sitemap += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  // Add service category pages
  for (const category of serviceCategories) {
    sitemap += `  <url>
    <loc>${BASE_URL}/services/${category}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  sitemap += `</urlset>`;

  // Return XML response
  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

