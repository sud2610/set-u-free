import { NextResponse } from 'next/server';

// ==================== CONFIGURATION ====================

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://freesetu.com';

// ==================== ROBOTS.TXT GENERATOR ====================

export async function GET() {
  const robotsTxt = `# FreeSetu Robots.txt
# https://freesetu.com

User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Disallow: /_next/
Disallow: /login
Disallow: /register

# Allow search engine crawlers to access important pages
Allow: /api/sitemap
Allow: /api/robots

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl-delay for polite crawling (optional)
Crawl-delay: 1
`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

