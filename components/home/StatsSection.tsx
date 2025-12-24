'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, UserCheck, MapPin, MessageSquare } from 'lucide-react';

// ==================== TYPES ====================

interface Stat {
  id: string;
  value: number;
  suffix: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

// ==================== CONSTANTS ====================

const stats: Stat[] = [
  {
    id: 'customers',
    value: 10000,
    suffix: '+',
    label: 'Happy Customers',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'providers',
    value: 500,
    suffix: '+',
    label: 'Verified Providers',
    icon: UserCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'cities',
    value: 25,
    suffix: '+',
    label: 'Cities Covered',
    icon: MapPin,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    id: 'consultations',
    value: 50000,
    suffix: '+',
    label: 'Free Consultations',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

// ==================== ANIMATED COUNTER HOOK ====================

/**
 * Custom hook for animating a number counter
 * Uses requestAnimationFrame for smooth animation
 */
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function: easeOutQuart
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(easeOutQuart * end);

      setCount(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [hasStarted, end, duration]);

  return { count, ref };
}

// ==================== STAT CARD COMPONENT ====================

interface StatCardProps {
  stat: Stat;
  index: number;
}

function StatCard({ stat, index }: StatCardProps) {
  const { count, ref } = useCountUp(stat.value, 2000);
  const Icon = stat.icon;

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K`;
    }
    return num.toString();
  };

  return (
    <div
      ref={ref}
      className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-yellow-300 transition-all duration-300 hover:-translate-y-1"
      style={{
        animationDelay: `${index * 150}ms`,
      }}
    >
      {/* Icon */}
      <div
        className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className={`w-7 h-7 ${stat.color}`} />
      </div>

      {/* Value */}
      <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
        {formatNumber(count)}
        <span className="text-yellow-500">{stat.suffix}</span>
      </div>

      {/* Label */}
      <p className="text-gray-600 font-medium">{stat.label}</p>

      {/* Decorative Element */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
    </div>
  );
}

// ==================== STATS SECTION COMPONENT ====================

/**
 * Stats section for the home page
 * Features:
 * - Display 4 key statistics
 * - Animated counters that trigger on scroll
 * - Responsive grid layout
 * - Icons for each stat
 * - Hover effects
 */
export function StatsSection() {
  return (
    <section className="py-10 lg:py-12 bg-gradient-to-b from-white to-yellow-50/50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ==================== HEADER ==================== */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full mb-4">
            Our Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            Join our growing community of satisfied customers and verified service providers.
            Here&apos;s what we&apos;ve achieved together.
          </p>
        </div>

        {/* ==================== STATS GRID ==================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.id} stat={stat} index={index} />
          ))}
        </div>

        {/* ==================== CTA SECTION ==================== */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            Ready to experience the difference?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-xl shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300"
            >
              Find a Service Provider
            </a>
            <a
              href="/register?role=provider"
              className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
            >
              Register as Provider
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
