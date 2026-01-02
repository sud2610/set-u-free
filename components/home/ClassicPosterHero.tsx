'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Fallback gradient backgrounds when images fail to load
const fallbackGradients = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-amber-500 to-orange-500',
  'from-green-500 to-teal-500',
  'from-red-500 to-rose-500',
  'from-indigo-500 to-violet-500',
];

// Service-focused poster collections aligned with Set-U-Free's mission
const posterCollections = [
  {
    id: 'health',
    posters: [
      { 
        src: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&q=80', 
        alt: 'Healthcare Consultation',
        fallbackIcon: '👨‍⚕️'
      },
      { 
        src: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=300&q=80', 
        alt: 'Dental Checkup',
        fallbackIcon: '🦷'
      },
      { 
        src: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&q=80', 
        alt: 'Vision Testing',
        fallbackIcon: '👁️'
      },
    ]
  },
  {
    id: 'legal',
    posters: [
      { 
        src: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&q=80', 
        alt: 'Legal Consultation',
        fallbackIcon: '⚖️'
      },
      { 
        src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&q=80', 
        alt: 'Migration Planning',
        fallbackIcon: '🛂'
      },
      { 
        src: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=300&q=80', 
        alt: 'Legal Documents',
        fallbackIcon: '📋'
      },
    ]
  },
  {
    id: 'wellbeing',
    posters: [
      { 
        src: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=300&q=80', 
        alt: 'Mental Health Support',
        fallbackIcon: '🧠'
      },
      { 
        src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&q=80', 
        alt: 'Physical Therapy',
        fallbackIcon: '🏥'
      },
      { 
        src: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&q=80', 
        alt: 'Healthy Nutrition',
        fallbackIcon: '🥗'
      },
    ]
  }
];

// Poster Image component with error handling
function PosterImage({ 
  src, 
  alt, 
  fallbackIcon, 
  priority = false,
  sizes 
}: { 
  src: string; 
  alt: string; 
  fallbackIcon: string;
  priority?: boolean;
  sizes: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const randomGradient = fallbackGradients[Math.floor(Math.random() * fallbackGradients.length)];

  if (hasError) {
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${randomGradient} flex items-center justify-center`}>
        <span className="text-4xl sm:text-5xl">{fallbackIcon}</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-all duration-500 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        sizes={sizes}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        unoptimized
      />
    </>
  );
}

export function ClassicPosterHero() {
  const [mounted, setMounted] = useState(false);
  const [activeCollection, setActiveCollection] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Auto-rotate collections every 5 seconds
    const interval = setInterval(() => {
      setActiveCollection((prev) => (prev + 1) % posterCollections.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentPosters = posterCollections[activeCollection].posters;

  return (
    <div className={`relative transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Poster Grid */}
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {/* Left Poster - Tilted */}
        <div 
          className="relative -rotate-6 hover:rotate-0 transition-transform duration-500 ease-out group"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="relative w-20 h-28 sm:w-28 sm:h-40 lg:w-32 lg:h-44 rounded-lg overflow-hidden shadow-xl border-4 border-white/80 bg-white">
            <PosterImage
              src={currentPosters[0].src}
              alt={currentPosters[0].alt}
              fallbackIcon={currentPosters[0].fallbackIcon}
              sizes="(max-width: 640px) 80px, (max-width: 1024px) 112px, 128px"
            />
            {/* Vintage overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-amber-100/20 mix-blend-overlay pointer-events-none" />
          </div>
          {/* Shadow effect */}
          <div className="absolute -bottom-2 left-2 right-2 h-4 bg-black/20 blur-md rounded-full" />
        </div>

        {/* Center Poster - Main Featured */}
        <div 
          className="relative z-10 hover:scale-105 transition-transform duration-500 ease-out group"
        >
          <div className="relative w-28 h-40 sm:w-36 sm:h-52 lg:w-44 lg:h-60 rounded-lg overflow-hidden shadow-2xl border-4 border-white bg-white">
            <PosterImage
              src={currentPosters[1].src}
              alt={currentPosters[1].alt}
              fallbackIcon={currentPosters[1].fallbackIcon}
              sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 176px"
              priority
            />
            {/* Vintage overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-amber-100/20 mix-blend-overlay pointer-events-none" />
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
          {/* Golden frame highlight */}
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-amber-300/50 to-yellow-500/50 -z-10 blur-sm" />
          {/* Shadow effect */}
          <div className="absolute -bottom-3 left-3 right-3 h-6 bg-black/25 blur-lg rounded-full" />
        </div>

        {/* Right Poster - Tilted opposite */}
        <div 
          className="relative rotate-6 hover:rotate-0 transition-transform duration-500 ease-out group"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="relative w-20 h-28 sm:w-28 sm:h-40 lg:w-32 lg:h-44 rounded-lg overflow-hidden shadow-xl border-4 border-white/80 bg-white">
            <PosterImage
              src={currentPosters[2].src}
              alt={currentPosters[2].alt}
              fallbackIcon={currentPosters[2].fallbackIcon}
              sizes="(max-width: 640px) 80px, (max-width: 1024px) 112px, 128px"
            />
            {/* Vintage overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-amber-100/20 mix-blend-overlay pointer-events-none" />
          </div>
          {/* Shadow effect */}
          <div className="absolute -bottom-2 left-2 right-2 h-4 bg-black/20 blur-md rounded-full" />
        </div>
      </div>

      {/* Collection Indicator Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {posterCollections.map((collection, index) => (
          <button
            key={collection.id}
            onClick={() => setActiveCollection(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeCollection 
                ? 'bg-white w-6' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Show ${collection.id} posters`}
          />
        ))}
      </div>
    </div>
  );
}
