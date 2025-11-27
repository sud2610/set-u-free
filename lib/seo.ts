import { Metadata } from 'next';

// ==================== TYPES ====================

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  locale?: string;
  siteName?: string;
}

export interface ProviderSEO {
  businessName: string;
  description: string;
  categories: string[];
  city: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
}

export interface ServiceCategorySEO {
  category: string;
  city?: string;
}

// ==================== CONSTANTS ====================

const SITE_NAME = 'Set-U-Free';
const DEFAULT_LOCALE = 'en_IN';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://setufree.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`;

// ==================== CATEGORY DATA ====================

const categoryMetadata: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    icon: string;
  }
> = {
  dentist: {
    title: 'Dentist',
    description:
      'Book free dental consultations with verified dentists. Get expert advice on teeth cleaning, whitening, braces, and more.',
    keywords: [
      'dentist',
      'dental clinic',
      'teeth cleaning',
      'dental care',
      'orthodontist',
      'dental consultation',
      'tooth pain',
      'dental checkup',
    ],
    icon: '🦷',
  },
  beauty: {
    title: 'Beauty & Spa',
    description:
      'Discover premium beauty and spa services. Free consultations with expert beauticians for hair, skin, and makeup services.',
    keywords: [
      'beauty salon',
      'spa',
      'hair styling',
      'makeup artist',
      'skincare',
      'facial',
      'beauty parlor',
      'grooming',
    ],
    icon: '💅',
  },
  gym: {
    title: 'Gym & Fitness',
    description:
      'Find the best gyms and personal trainers near you. Free fitness consultations to kickstart your health journey.',
    keywords: [
      'gym',
      'fitness center',
      'personal trainer',
      'workout',
      'fitness classes',
      'strength training',
      'cardio',
      'weight loss',
    ],
    icon: '💪',
  },
  physiotherapy: {
    title: 'Physiotherapy',
    description:
      'Connect with certified physiotherapists for pain relief and rehabilitation. Free consultations for injury recovery.',
    keywords: [
      'physiotherapy',
      'physical therapy',
      'pain relief',
      'rehabilitation',
      'sports injury',
      'back pain',
      'joint pain',
      'physio',
    ],
    icon: '🏥',
  },
  yoga: {
    title: 'Yoga',
    description:
      'Find yoga instructors and meditation centers. Free trial sessions for beginners and advanced practitioners.',
    keywords: [
      'yoga',
      'yoga classes',
      'meditation',
      'yoga instructor',
      'hatha yoga',
      'vinyasa',
      'wellness',
      'mindfulness',
    ],
    icon: '🧘',
  },
  nutrition: {
    title: 'Nutrition',
    description:
      'Consult certified nutritionists and dietitians. Free diet consultations for weight management and healthy living.',
    keywords: [
      'nutritionist',
      'dietitian',
      'diet plan',
      'weight loss',
      'healthy eating',
      'nutrition consultation',
      'meal planning',
      'diet chart',
    ],
    icon: '🥗',
  },
  'mental-health': {
    title: 'Mental Health',
    description:
      'Connect with professional counselors and therapists. Free initial consultations for stress, anxiety, and mental wellness.',
    keywords: [
      'mental health',
      'counselor',
      'therapist',
      'psychologist',
      'anxiety',
      'stress',
      'depression',
      'therapy',
    ],
    icon: '🧠',
  },
  dermatology: {
    title: 'Dermatology',
    description:
      'Book free consultations with skin specialists. Expert advice on skincare, acne treatment, and dermatological concerns.',
    keywords: [
      'dermatologist',
      'skin specialist',
      'skincare',
      'acne treatment',
      'skin clinic',
      'hair fall',
      'skin problems',
    ],
    icon: '✨',
  },
};

// ==================== HOME PAGE METADATA ====================

export function getHomePageMetadata(): Metadata {
  return {
    title: 'Set-U-Free - Free Consultations from Trusted Professionals',
    description:
      'Book free initial consultations with verified dentists, beauty parlors, gyms, physiotherapists, yoga instructors, and more. Find trusted service providers near you.',
    keywords: [
      'free consultation',
      'service providers',
      'dentist',
      'beauty salon',
      'gym',
      'physiotherapy',
      'yoga',
      'nutrition',
      'book appointment',
      'verified professionals',
      'India',
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: DEFAULT_LOCALE,
      url: BASE_URL,
      siteName: SITE_NAME,
      title: 'Set-U-Free - Free Consultations from Trusted Professionals',
      description:
        'Book free initial consultations with verified dentists, beauty parlors, gyms, physiotherapists, and more.',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: 'Set-U-Free - Find Trusted Service Providers',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Set-U-Free - Free Consultations from Trusted Professionals',
      description:
        'Book free initial consultations with verified service providers.',
      images: [DEFAULT_OG_IMAGE],
      creator: '@setufree',
    },
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
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

// ==================== SERVICES PAGE METADATA ====================

export function getServicesPageMetadata(): Metadata {
  return {
    title: 'Browse All Services | Find Trusted Service Providers',
    description:
      'Explore our wide range of services including dentists, beauty experts, fitness trainers, yoga instructors, and more. Book free consultations with verified professionals.',
    keywords: [
      'services',
      'dentist',
      'beauty salon',
      'fitness trainer',
      'yoga classes',
      'physiotherapy',
      'nutrition',
      'free consultation',
      'book appointment',
    ],
    alternates: {
      canonical: '/services',
    },
    openGraph: {
      type: 'website',
      locale: DEFAULT_LOCALE,
      url: `${BASE_URL}/services`,
      siteName: SITE_NAME,
      title: 'Browse All Services | Set-U-Free',
      description:
        'Find trusted service providers for free consultations. Browse by category and location.',
      images: [
        {
          url: `${BASE_URL}/og-services.png`,
          width: 1200,
          height: 630,
          alt: 'Browse Services on Set-U-Free',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Browse All Services | Set-U-Free',
      description: 'Find trusted service providers for free consultations.',
      images: [`${BASE_URL}/og-services.png`],
    },
  };
}

// ==================== CATEGORY PAGE METADATA ====================

export function getCategoryPageMetadata(
  category: string,
  city?: string
): Metadata {
  const categoryData = categoryMetadata[category.toLowerCase()] || {
    title: category,
    description: `Find ${category} services and book free consultations.`,
    keywords: [category, 'services', 'consultation'],
    icon: '📋',
  };

  const titleWithCity = city
    ? `${categoryData.title} in ${city} | Free Consultations`
    : `${categoryData.title} Services | Free Consultations`;

  const descriptionWithCity = city
    ? `Find the best ${categoryData.title.toLowerCase()} services in ${city}. ${categoryData.description}`
    : categoryData.description;

  const keywordsWithCity = city
    ? [...categoryData.keywords, city, `${category} in ${city}`]
    : categoryData.keywords;

  const canonicalUrl = city
    ? `/services/${category.toLowerCase()}?city=${encodeURIComponent(city)}`
    : `/services/${category.toLowerCase()}`;

  return {
    title: `${titleWithCity} | ${SITE_NAME}`,
    description: descriptionWithCity,
    keywords: keywordsWithCity,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      locale: DEFAULT_LOCALE,
      url: `${BASE_URL}${canonicalUrl}`,
      siteName: SITE_NAME,
      title: titleWithCity,
      description: descriptionWithCity,
      images: [
        {
          url: `${BASE_URL}/og-category-${category.toLowerCase()}.png`,
          width: 1200,
          height: 630,
          alt: `${categoryData.title} Services on Set-U-Free`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleWithCity,
      description: descriptionWithCity,
      images: [`${BASE_URL}/og-category-${category.toLowerCase()}.png`],
    },
  };
}

// ==================== PROVIDER PAGE METADATA ====================

export function getProviderPageMetadata(provider: ProviderSEO): Metadata {
  const primaryCategory = provider.categories[0] || 'Service';
  const title = `${provider.businessName} - ${primaryCategory} Consultation in ${provider.city}`;
  
  const ratingText = provider.rating
    ? ` ⭐ ${provider.rating}/5 (${provider.reviewCount || 0} reviews)`
    : '';
  
  const description = `${provider.description}${ratingText}. Book a free consultation with ${provider.businessName} in ${provider.city}.`;

  const keywords = [
    provider.businessName,
    ...provider.categories,
    provider.city,
    'free consultation',
    'book appointment',
    `${primaryCategory} in ${provider.city}`,
  ];

  const ogImage = provider.image || DEFAULT_OG_IMAGE;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords,
    openGraph: {
      type: 'profile',
      locale: DEFAULT_LOCALE,
      siteName: SITE_NAME,
      title,
      description: provider.description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: provider.businessName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: provider.description,
      images: [ogImage],
    },
  };
}

// ==================== DASHBOARD METADATA ====================

export function getDashboardMetadata(
  type: 'user' | 'provider',
  section?: string
): Metadata {
  const baseTitle =
    type === 'user' ? 'My Dashboard' : 'Provider Dashboard';
  
  const sectionTitles: Record<string, string> = {
    bookings: 'My Bookings',
    profile: 'Profile Settings',
    settings: 'Account Settings',
    services: 'Manage Services',
    appointments: 'Appointments',
    reviews: 'Reviews',
    notifications: 'Notifications',
  };

  const title = section
    ? `${sectionTitles[section] || section} | ${baseTitle}`
    : baseTitle;

  const description =
    type === 'user'
      ? 'Manage your bookings, profile, and account settings on Set-U-Free.'
      : 'Manage your services, appointments, and business profile on Set-U-Free.';

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
      'max-snippet': 0,
    },
    openGraph: {
      type: 'website',
      locale: DEFAULT_LOCALE,
      siteName: SITE_NAME,
      title,
      description,
    },
  };
}

// ==================== AUTH PAGES METADATA ====================

export function getAuthPageMetadata(type: 'login' | 'register'): Metadata {
  const isLogin = type === 'login';

  const title = isLogin
    ? 'Login to Your Account'
    : 'Create Your Free Account';

  const description = isLogin
    ? 'Sign in to Set-U-Free to manage your bookings and access your dashboard.'
    : 'Join Set-U-Free for free. Book consultations with verified professionals or register as a service provider.';

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: DEFAULT_LOCALE,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

// ==================== STATIC PAGES METADATA ====================

export function getStaticPageMetadata(
  page: 'about' | 'contact' | 'privacy' | 'terms'
): Metadata {
  const pageData = {
    about: {
      title: 'About Us - Our Story, Mission & Team',
      description:
        'Learn about Set-U-Free, our mission to connect customers with verified service providers for free consultations. Meet our team.',
      url: '/about',
    },
    contact: {
      title: 'Contact Us - Get in Touch',
      description:
        'Have questions or feedback? Contact Set-U-Free support team. We\'re here to help you.',
      url: '/contact',
    },
    privacy: {
      title: 'Privacy Policy - How We Protect Your Data',
      description:
        'Learn how Set-U-Free collects, uses, and protects your personal information. Your privacy matters to us.',
      url: '/privacy-policy',
    },
    terms: {
      title: 'Terms of Service - Platform Rules',
      description:
        'Read the Terms of Service for Set-U-Free. Understand your rights, responsibilities, and platform rules.',
      url: '/terms-of-service',
    },
  };

  const data = pageData[page];

  return {
    title: `${data.title} | ${SITE_NAME}`,
    description: data.description,
    alternates: {
      canonical: data.url,
    },
    openGraph: {
      type: 'website',
      locale: DEFAULT_LOCALE,
      url: `${BASE_URL}${data.url}`,
      siteName: SITE_NAME,
      title: data.title,
      description: data.description,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

// ==================== CUSTOM METADATA BUILDER ====================

export function buildMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = DEFAULT_OG_IMAGE,
    url,
    type = 'website',
    noIndex = false,
    locale = DEFAULT_LOCALE,
    siteName = SITE_NAME,
  } = config;

  return {
    title: title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`,
    description,
    keywords,
    openGraph: {
      type,
      locale,
      siteName,
      title,
      description,
      url: url ? `${BASE_URL}${url}` : undefined,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    alternates: url
      ? {
          canonical: url,
        }
      : undefined,
  };
}

// ==================== JSON-LD STRUCTURED DATA ====================

export function generateOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      'Set-U-Free connects customers with verified service providers for free consultations.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Business Park, Sector 5',
      addressLocality: 'Mumbai',
      addressRegion: 'Maharashtra',
      postalCode: '400001',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-1800-XXX-XXXX',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://facebook.com/setufree',
      'https://twitter.com/setufree',
      'https://instagram.com/setufree',
      'https://linkedin.com/company/setufree',
    ],
  };
}

export function generateLocalBusinessSchema(provider: ProviderSEO): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: provider.businessName,
    description: provider.description,
    image: provider.image,
    address: {
      '@type': 'PostalAddress',
      addressLocality: provider.city,
      addressCountry: 'IN',
    },
    aggregateRating: provider.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: provider.rating,
          reviewCount: provider.reviewCount || 0,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    priceRange: 'Free Consultation',
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function generateServiceSchema(
  category: string,
  providers: { name: string; rating?: number }[]
): object {
  const categoryData = categoryMetadata[category.toLowerCase()];

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: categoryData?.title || category,
    description: categoryData?.description || `${category} services`,
    provider: providers.map((p) => ({
      '@type': 'LocalBusiness',
      name: p.name,
      aggregateRating: p.rating
        ? {
            '@type': 'AggregateRating',
            ratingValue: p.rating,
            bestRating: 5,
          }
        : undefined,
    })),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      description: 'Free initial consultation',
    },
  };
}

// ==================== EXPORTS ====================

export {
  SITE_NAME,
  BASE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_LOCALE,
  categoryMetadata,
};

