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
    id: 'dentist',
    name: 'Dentist',
    description: 'Dental care & oral health',
    icon: '🦷',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:border-blue-300 hover:bg-blue-50/50',
    providerCount: 120,
  },
  {
    id: 'beauty',
    name: 'Beauty',
    description: 'Salon, spa & skincare',
    icon: '💅',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    hoverColor: 'hover:border-pink-300 hover:bg-pink-50/50',
    providerCount: 200,
  },
  {
    id: 'gym',
    name: 'Gym',
    description: 'Fitness centers & trainers',
    icon: '💪',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hoverColor: 'hover:border-red-300 hover:bg-red-50/50',
    providerCount: 85,
  },
  {
    id: 'physiotherapy',
    name: 'Physiotherapy',
    description: 'Physical therapy & rehab',
    icon: '🏥',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:border-green-300 hover:bg-green-50/50',
    providerCount: 65,
  },
  {
    id: 'yoga',
    name: 'Yoga',
    description: 'Yoga classes & meditation',
    icon: '🧘',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:border-purple-300 hover:bg-purple-50/50',
    providerCount: 150,
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    description: 'Diet plans & consultations',
    icon: '🥗',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    hoverColor: 'hover:border-amber-300 hover:bg-amber-50/50',
    providerCount: 90,
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
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ==================== HEADER ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full mb-4">
              Categories
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Explore by{' '}
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Category
              </span>
            </h2>
            <p className="mt-3 text-gray-600 max-w-xl">
              Browse through our most popular service categories and find the 
              perfect provider for your needs.
            </p>
          </div>
          
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-yellow-600 font-semibold hover:text-yellow-700 group transition-colors"
          >
            View All Categories
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ==================== CATEGORIES GRID ==================== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/services/${category.id}`}
              className={`group relative p-6 bg-white rounded-2xl border-2 border-gray-100 ${category.hoverColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
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

        {/* ==================== MORE CATEGORIES BANNER ==================== */}
        <div className="mt-12 p-6 sm:p-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <p className="text-gray-400 mt-1">
              We have 50+ categories with 500+ service providers
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            Browse All Services
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CategoriesSection;
