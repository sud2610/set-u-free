'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Classic culturally familiar poster collections
const posterCollections = [
  {
    id: 'movies',
    posters: [
      { src: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop', alt: 'Cinema', title: 'Movie Magic' },
      { src: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop', alt: 'Classic Film', title: 'Golden Age' },
      { src: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop', alt: 'Movie Theater', title: 'Cinema Dreams' },
    ]
  },
  {
    id: 'music',
    posters: [
      { src: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=450&fit=crop', alt: 'Vinyl Records', title: 'Timeless Music' },
      { src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=450&fit=crop', alt: 'Concert', title: 'Live Legends' },
      { src: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=450&fit=crop', alt: 'Guitar', title: 'Rock Era' },
    ]
  },
  {
    id: 'culture',
    posters: [
      { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=450&fit=crop', alt: 'Australian Landscape', title: 'Outback Beauty' },
      { src: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=300&h=450&fit=crop', alt: 'Sydney Opera House', title: 'Iconic Sydney' },
      { src: 'https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=300&h=450&fit=crop', alt: 'Beach Culture', title: 'Aussie Life' },
    ]
  }
];

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
            <Image
              src={currentPosters[0].src}
              alt={currentPosters[0].alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 80px, (max-width: 1024px) 112px, 128px"
            />
            {/* Vintage overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-amber-100/20 mix-blend-overlay" />
          </div>
          {/* Shadow effect */}
          <div className="absolute -bottom-2 left-2 right-2 h-4 bg-black/20 blur-md rounded-full" />
        </div>

        {/* Center Poster - Main Featured */}
        <div 
          className="relative z-10 hover:scale-105 transition-transform duration-500 ease-out group"
        >
          <div className="relative w-28 h-40 sm:w-36 sm:h-52 lg:w-44 lg:h-60 rounded-lg overflow-hidden shadow-2xl border-4 border-white bg-white">
            <Image
              src={currentPosters[1].src}
              alt={currentPosters[1].alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 176px"
              priority
            />
            {/* Vintage overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-amber-100/20 mix-blend-overlay" />
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
            <Image
              src={currentPosters[2].src}
              alt={currentPosters[2].alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 80px, (max-width: 1024px) 112px, 128px"
            />
            {/* Vintage overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-amber-100/20 mix-blend-overlay" />
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

