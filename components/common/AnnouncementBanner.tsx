'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

// ==================== ANNOUNCEMENT BANNER COMPONENT ====================

/**
 * Floating announcement banner that displays at the top of the page
 * Highlights the free consultation offering
 * Can be dismissed by users
 */
export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white">
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3 text-center">
            <span className="text-lg sm:text-xl animate-bounce">🎉</span>
            <p className="text-sm sm:text-base font-medium">
              All consultations are{' '}
              <span className="font-bold bg-white/20 px-2 py-0.5 rounded">
                100% FREE
              </span>
              {' '}— No credit card required!
            </p>
            <span className="text-lg sm:text-xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎉</span>
          </div>
          
          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 sm:right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBanner;

