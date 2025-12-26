'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// ==================== TYPES ====================

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  hoverColor: string;
  providerCount: number;
}

// ==================== CONSTANTS ====================

const categories: Category[] = [
  {
    id: 'recruitment-agencies',
    name: 'Recruitment Agencies',
    description: 'Job placement & staffing services',
    icon: '💼',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:border-blue-300 hover:bg-blue-50/50',
    providerCount: 50,
  },
  {
    id: 'migration-visa',
    name: 'Migration & Visa',
    description: 'Immigration & visa consultation',
    icon: '🛂',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    hoverColor: 'hover:border-indigo-300 hover:bg-indigo-50/50',
    providerCount: 40,
  },
  {
    id: 'beauty',
    name: 'Beauty',
    description: 'Salon, spa & skincare',
    icon: '💅',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    hoverColor: 'hover:border-pink-300 hover:bg-pink-50/50',
    providerCount: 80,
  },
  {
    id: 'dentist',
    name: 'Dentist',
    description: 'Dental care & oral health',
    icon: '🦷',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    hoverColor: 'hover:border-cyan-300 hover:bg-cyan-50/50',
    providerCount: 60,
  },
  {
    id: 'eye-care',
    name: 'Eye Care',
    description: 'Vision & eye health',
    icon: '👁️',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:border-purple-300 hover:bg-purple-50/50',
    providerCount: 35,
  },
  {
    id: 'doctors',
    name: 'Doctors',
    description: 'General practice & specialists',
    icon: '👨‍⚕️',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:border-green-300 hover:bg-green-50/50',
    providerCount: 70,
  },
  {
    id: 'mental-health',
    name: 'Mental Health',
    description: 'Counseling & therapy',
    icon: '🧠',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    hoverColor: 'hover:border-violet-300 hover:bg-violet-50/50',
    providerCount: 45,
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    description: 'Diet plans & consultations',
    icon: '🥗',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    hoverColor: 'hover:border-amber-300 hover:bg-amber-50/50',
    providerCount: 30,
  },
  {
    id: 'physiotherapy',
    name: 'Physiotherapy',
    description: 'Physical therapy & rehab',
    icon: '🏥',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    hoverColor: 'hover:border-teal-300 hover:bg-teal-50/50',
    providerCount: 40,
  },
  {
    id: 'legal-services',
    name: 'Legal Services',
    description: 'Legal advice & representation',
    icon: '⚖️',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    hoverColor: 'hover:border-slate-300 hover:bg-slate-50/50',
    providerCount: 25,
  },
];

// ==================== CATEGORIES SECTION COMPONENT ====================

/**
 * Categories section for the home page
 * Features:
 * - Display 6 popular categories with icons
 * - Clickable category cards
 * - Responsive grid layout
 * - Provider count for each category
 * - Hover animations
 */
export function CategoriesSection() {
  return (
    <section className="py-10 lg:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ==================== HEADER ==================== */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full mb-4">
            Categories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Explore by{' '}
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Browse through our service categories and find the 
            perfect provider for your needs.
          </p>
        </div>

        {/* ==================== CATEGORIES GRID ==================== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/services/${category.id}`}
              className={`group relative p-6 bg-white rounded-2xl border-2 border-amber-200 ${category.hoverColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 ${category.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <span className="text-3xl">{category.icon}</span>
              </div>

              {/* Content */}
              <h3 className={`font-semibold text-gray-900 group-hover:${category.color} transition-colors truncate`}>
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                {category.description}
              </p>

              {/* Provider Count */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  {category.providerCount}+ providers
                </span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

export default CategoriesSection;
