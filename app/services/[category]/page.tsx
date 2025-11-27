import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CategoryServicesContent } from './CategoryServicesContent';
import { ServicesLoading } from '../ServicesLoading';

// ==================== TYPES ====================

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ==================== CATEGORY DATA ====================

const categoryData: Record<
  string,
  {
    name: string;
    description: string;
    longDescription: string;
    icon: string;
    color: string;
    bgColor: string;
    keywords: string[];
  }
> = {
  dentist: {
    name: 'Dentist',
    description: 'Find trusted dental professionals for all your oral health needs.',
    longDescription:
      'Connect with verified dentists for free consultations. Get expert advice on dental care, cleanings, fillings, orthodontics, and cosmetic dentistry.',
    icon: '🦷',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    keywords: ['dentist', 'dental care', 'oral health', 'teeth cleaning', 'orthodontics'],
  },
  beauty: {
    name: 'Beauty & Spa',
    description: 'Discover beauty experts for salon and spa services.',
    longDescription:
      'Find premium beauty and spa services including hair styling, makeup, skincare treatments, and relaxing spa experiences with verified professionals.',
    icon: '💅',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    keywords: ['beauty salon', 'spa', 'hair styling', 'makeup', 'skincare'],
  },
  gym: {
    name: 'Gym & Fitness',
    description: 'Connect with fitness centers and personal trainers.',
    longDescription:
      'Achieve your fitness goals with verified gyms and certified personal trainers. Get free consultations to find the perfect fitness solution.',
    icon: '💪',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    keywords: ['gym', 'fitness', 'personal trainer', 'workout', 'exercise'],
  },
  physiotherapy: {
    name: 'Physiotherapy',
    description: 'Expert physiotherapists for pain relief and rehabilitation.',
    longDescription:
      'Get professional physiotherapy services for injury recovery, chronic pain management, and physical rehabilitation from verified experts.',
    icon: '🏥',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    keywords: ['physiotherapy', 'physical therapy', 'rehabilitation', 'pain relief'],
  },
  yoga: {
    name: 'Yoga',
    description: 'Find yoga instructors and meditation centers.',
    longDescription:
      'Discover inner peace with verified yoga instructors. Find classes for all levels, from beginner to advanced, including meditation and wellness programs.',
    icon: '🧘',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    keywords: ['yoga', 'meditation', 'wellness', 'mindfulness', 'yoga classes'],
  },
  nutrition: {
    name: 'Nutrition',
    description: 'Consult with certified nutritionists and dietitians.',
    longDescription:
      'Get personalized nutrition advice from certified professionals. Free consultations for diet planning, weight management, and healthy lifestyle guidance.',
    icon: '🥗',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    keywords: ['nutrition', 'dietitian', 'diet plan', 'healthy eating', 'weight management'],
  },
  'mental-health': {
    name: 'Mental Health',
    description: 'Professional counselors and therapists for mental wellness.',
    longDescription:
      'Your mental health matters. Connect with verified counselors and therapists for free consultations on stress, anxiety, depression, and overall mental wellness.',
    icon: '🧠',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    keywords: ['mental health', 'counseling', 'therapy', 'psychologist', 'wellness'],
  },
  dermatology: {
    name: 'Dermatology',
    description: 'Skin specialists for all your dermatological needs.',
    longDescription:
      'Consult with verified dermatologists for skin care, acne treatment, anti-aging solutions, and other dermatological concerns.',
    icon: '✨',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    keywords: ['dermatology', 'skin care', 'acne treatment', 'skin specialist'],
  },
};

// ==================== METADATA ====================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = categoryData[resolvedParams.category];

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} Services | Find Trusted ${category.name} Providers`,
    description: category.longDescription,
    keywords: category.keywords,
    openGraph: {
      title: `${category.name} Services | Set-U-Free`,
      description: category.description,
      images: [`/og-category-${resolvedParams.category}.png`],
    },
  };
}

// ==================== STATIC PARAMS ====================

export async function generateStaticParams() {
  return Object.keys(categoryData).map((category) => ({
    category,
  }));
}

// ==================== CATEGORY PAGE COMPONENT ====================

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const category = categoryData[resolvedParams.category];

  if (!category) {
    notFound();
  }

  return (
    <>
      {/* Hero Section */}
      <section className={`${category.bgColor} py-12 lg:py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-gray-500 hover:text-orange-500 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/services" className="text-gray-500 hover:text-orange-500 transition-colors">
              Services
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className={`font-medium ${category.color}`}>{category.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Icon */}
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center shrink-0">
              <span className="text-5xl">{category.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                {category.name}{' '}
                <span className={category.color}>Services</span>
              </h1>
              <p className="mt-3 text-lg text-gray-600 max-w-2xl">
                {category.longDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <Suspense fallback={<ServicesLoading />}>
        <CategoryServicesContent
          categoryId={resolvedParams.category}
          categoryName={category.name}
        />
      </Suspense>
    </>
  );
}
