'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  MapPin,
  Star,
  Phone,
  ArrowRight,
  Trash2,
  Search,
} from 'lucide-react';

export default function FavoritesPage() {
  const { user } = useAuth();

  // Redirect providers to dashboard
  if (user?.role === 'provider') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">This page is only available for customers.</p>
        <Link href="/dashboard" className="text-yellow-600 hover:text-yellow-700 mt-2 inline-block">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Mock favorites data
  const favorites = [
    {
      id: 1,
      name: 'Smile Dental Clinic',
      category: 'Dentist',
      rating: 4.8,
      reviews: 234,
      location: 'Sydney CBD',
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400',
      verified: true,
    },
    {
      id: 2,
      name: 'FitLife Gym',
      category: 'Gym',
      rating: 4.6,
      reviews: 189,
      location: 'Bondi Beach',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      verified: true,
    },
    {
      id: 3,
      name: 'Zen Yoga Studio',
      category: 'Yoga',
      rating: 4.9,
      reviews: 156,
      location: 'Surry Hills',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
      verified: false,
    },
  ];

  const handleRemoveFavorite = (id: number) => {
    // In production, call API to remove from favorites
    console.log('Remove favorite:', id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-500 mt-1">Quick access to your saved service providers</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors"
        >
          <Search className="w-4 h-4" />
          Find More
        </Link>
      </div>

      {/* Favorites Grid */}
      {favorites.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Image */}
              <div className="relative h-40 bg-gray-100">
                <Image
                  src={provider.image}
                  alt={provider.name}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => handleRemoveFavorite(provider.id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition-colors group/btn"
                  title="Remove from favorites"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500 group-hover/btn:scale-110 transition-transform" />
                </button>
                {provider.verified && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-lg">
                    Verified
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                      {provider.name}
                    </h3>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      {provider.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-900">{provider.rating}</span>
                    <span className="text-sm text-gray-400">({provider.reviews})</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {provider.location}
                </div>

                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/providers/${provider.id}`}
                    className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium text-sm text-center rounded-lg transition-colors"
                  >
                    View Profile
                  </Link>
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-500 mb-6">
            Start exploring services and save your favorite providers for quick access!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors"
          >
            Find Services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

