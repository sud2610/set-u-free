'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Star,
  MapPin,
  BadgeCheck,
  Clock,
  Calendar,
  Phone,
  Mail,
  Share2,
  Heart,
  ChevronRight,
  MessageSquare,
  Users,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BookingModal } from '@/components/providers/BookingModal';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { getProvider, getProviderReviews, getServices, getProvidersByCategory } from '@/lib/firestore';
import type { Provider, Service, Review } from '@/types';

// ==================== TYPES ====================

interface ProviderDetailContentProps {
  providerId: string;
}

// ==================== MOCK DATA ====================

const mockProvider: Provider = {
  uid: '1',
  businessName: 'Smile Dental Clinic',
  description: 'Expert dental care with modern technology and experienced professionals. We provide comprehensive dental services for the whole family.',
  categories: ['Dentist', 'Dental Care', 'Orthodontics'],
  location: 'Shop 12, Crystal Plaza, Andheri West',
  city: 'Mumbai',
  bio: `Welcome to Smile Dental Clinic, where your oral health is our top priority. With over 15 years of experience in dental care, we provide comprehensive services ranging from routine check-ups to advanced cosmetic procedures.

Our team of certified dentists uses state-of-the-art equipment and follows the latest techniques to ensure you receive the best possible care. We believe in making dental visits comfortable and stress-free for all our patients.

Services we offer:
• General Dentistry (cleanings, fillings, extractions)
• Cosmetic Dentistry (whitening, veneers)
• Orthodontics (braces, aligners)
• Pediatric Dentistry
• Emergency Dental Care

Book your free consultation today and take the first step towards a healthier, brighter smile!`,
  profileImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800',
  rating: 4.8,
  reviewCount: 234,
  verified: true,
  consultationSlots: [
    { date: '2024-01-25', startTime: '09:00', endTime: '09:30', available: true },
    { date: '2024-01-25', startTime: '10:00', endTime: '10:30', available: true },
    { date: '2024-01-25', startTime: '11:00', endTime: '11:30', available: false },
    { date: '2024-01-25', startTime: '14:00', endTime: '14:30', available: true },
  ],
  createdAt: new Date('2022-01-15'),
  updatedAt: new Date('2024-01-20'),
};

const mockServices: Service[] = [
  {
    id: 's1',
    providerId: '1',
    category: 'Dentist',
    title: 'Dental Consultation',
    description: 'Comprehensive dental check-up and consultation with our expert dentist.',
    duration: 30,
    images: [],
    createdAt: new Date(),
  },
  {
    id: 's2',
    providerId: '1',
    category: 'Dentist',
    title: 'Teeth Cleaning',
    description: 'Professional teeth cleaning to remove plaque and tartar buildup.',
    duration: 45,
    images: [],
    createdAt: new Date(),
  },
  {
    id: 's3',
    providerId: '1',
    category: 'Dentist',
    title: 'Teeth Whitening',
    description: 'Advanced teeth whitening treatment for a brighter smile.',
    duration: 60,
    images: [],
    createdAt: new Date(),
  },
];

const mockReviews: (Review & { userName: string })[] = [
  {
    id: 'r1',
    userId: 'u1',
    providerId: '1',
    rating: 5,
    comment: 'Excellent service! Dr. Sharma was very professional and made me feel comfortable throughout the procedure. Highly recommended for anyone looking for quality dental care.',
    createdAt: new Date('2024-01-15'),
    userName: 'Rahul Sharma',
  },
  {
    id: 'r2',
    userId: 'u2',
    providerId: '1',
    rating: 4,
    comment: 'Good experience overall. The clinic is clean and well-maintained. Wait time was a bit longer than expected but the treatment was great.',
    createdAt: new Date('2024-01-10'),
    userName: 'Priya Patel',
  },
  {
    id: 'r3',
    userId: 'u3',
    providerId: '1',
    rating: 5,
    comment: 'Best dental clinic in the area! The staff is friendly and the prices are reasonable. Got my teeth cleaned and whitened - very happy with the results.',
    createdAt: new Date('2024-01-05'),
    userName: 'Amit Kumar',
  },
  {
    id: 'r4',
    userId: 'u4',
    providerId: '1',
    rating: 5,
    comment: 'My whole family visits this clinic. They are great with kids too. Very gentle and patient. Thank you for the wonderful service!',
    createdAt: new Date('2024-01-02'),
    userName: 'Sneha Gupta',
  },
];

const mockRelatedProviders: Provider[] = [
  {
    uid: '10',
    businessName: 'Perfect Smile Dental',
    description: 'Advanced dental treatments with care.',
    categories: ['Dentist', 'Orthodontics'],
    location: 'Bandra',
    city: 'Mumbai',
    bio: 'Specialized in orthodontics and cosmetic dentistry.',
    profileImage: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400',
    rating: 4.9,
    reviewCount: 178,
    verified: true,
    consultationSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: '11',
    businessName: 'DentalCare Plus',
    description: 'Modern dental clinic with latest equipment.',
    categories: ['Dentist', 'Dental Care'],
    location: 'Powai',
    city: 'Mumbai',
    bio: 'Quality dental care for the whole family.',
    profileImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400',
    rating: 4.7,
    reviewCount: 156,
    verified: true,
    consultationSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: '12',
    businessName: 'Bright Teeth Clinic',
    description: 'Your smile is our priority.',
    categories: ['Dentist', 'Cosmetic Dentistry'],
    location: 'Juhu',
    city: 'Mumbai',
    bio: 'Expert cosmetic dentistry services.',
    profileImage: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400',
    rating: 4.6,
    reviewCount: 98,
    verified: false,
    consultationSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ==================== PROVIDER DETAIL CONTENT ====================

export function ProviderDetailContent({ providerId }: ProviderDetailContentProps) {
  // ==================== STATE ====================
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<(Review & { userName: string })[]>([]);
  const [relatedProviders, setRelatedProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // ==================== FETCH DATA ====================

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch provider
        const providerData = await getProvider(providerId);
        
        if (providerData) {
          setProvider(providerData);
          
          // Fetch related data
          const [servicesData, reviewsData, relatedData] = await Promise.all([
            getServices(providerId),
            getProviderReviews(providerId),
            getProvidersByCategory(providerData.categories[0] || ''),
          ]);
          
          setServices(servicesData.length > 0 ? servicesData : mockServices);
          setReviews(reviewsData.length > 0 
            ? reviewsData.map(r => ({ ...r, userName: 'Anonymous User' })) 
            : mockReviews
          );
          setRelatedProviders(
            relatedData.filter(p => p.uid !== providerId).slice(0, 3) || mockRelatedProviders
          );
        } else {
          // Use mock data for development
          setProvider(mockProvider);
          setServices(mockServices);
          setReviews(mockReviews);
          setRelatedProviders(mockRelatedProviders);
        }
      } catch (error) {
        console.error('Error fetching provider:', error);
        // Fallback to mock data
        setProvider(mockProvider);
        setServices(mockServices);
        setReviews(mockReviews);
        setRelatedProviders(mockRelatedProviders);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [providerId]);

  // ==================== HANDLERS ====================

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: provider?.businessName,
        text: provider?.description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  // ==================== LOADING STATE ====================

  if (isLoading) {
    return <ProviderDetailLoadingSkeleton />;
  }

  // ==================== NOT FOUND ====================

  if (!provider) {
    notFound();
  }

  // ==================== RENDER ====================

  return (
    <>
      {/* ==================== HERO SECTION ==================== */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-gray-500 hover:text-orange-500">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/" className="text-gray-500 hover:text-orange-500">
              Services
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              href={`/services/${provider.categories[0]?.toLowerCase()}`}
              className="text-gray-500 hover:text-orange-500"
            >
              {provider.categories[0]}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {provider.businessName}
            </span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Image */}
            <div className="relative w-full lg:w-80 h-64 lg:h-80 rounded-2xl overflow-hidden shrink-0">
              {provider.profileImage ? (
                <Image
                  src={provider.profileImage}
                  alt={provider.businessName}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white">
                    {provider.businessName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              {provider.verified && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-lg shadow-lg">
                  <BadgeCheck className="w-4 h-4" />
                  Verified
                </div>
              )}
            </div>

            {/* Provider Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    {provider.businessName}
                  </h1>
                  
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {provider.categories.map((cat, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 mt-4 text-gray-600">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{provider.location}, {provider.city}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(provider.rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-gray-900">{provider.rating}</span>
                    </div>
                    <span className="text-gray-500">
                      ({provider.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isFavorite
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-all"
                    aria-label="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {provider.reviewCount}+
                  </div>
                  <div className="text-sm text-gray-500">Reviews</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {services.length}
                  </div>
                  <div className="text-sm text-gray-500">Services</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">Free</div>
                  <div className="text-sm text-gray-500">Consultation</div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => {
                  setSelectedService(services[0] || null);
                  setIsBookingModalOpen(true);
                }}
                className="w-full sm:w-auto mt-6 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Book Free Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MAIN CONTENT ==================== */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 whitespace-pre-line">{provider.bio}</p>
                </div>
              </div>

              {/* Services Section */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Services Offered
                </h2>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors group"
                    >
                      <div className="mb-3 sm:mb-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} min</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleBookService(service)}
                        className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Customer Reviews ({reviews.length})
                  </h2>
                </div>

                {/* Rating Summary */}
                <div className="flex items-center gap-6 p-4 bg-orange-50 rounded-xl mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {provider.rating}
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(provider.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {provider.reviewCount} reviews
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-white">
                            {review.userName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">
                              {review.userName}
                            </h4>
                            <span className="text-sm text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-600 mt-2">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {reviews.length > 4 && (
                  <button className="w-full mt-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
                    View All Reviews
                  </button>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Availability Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Book Free Consultation
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>Available Today</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>Instant Booking</span>
                  </div>
                  <div className="flex items-center gap-3 text-green-600">
                    <BadgeCheck className="w-5 h-5" />
                    <span className="font-medium">100% Free</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedService(services[0] || null);
                    setIsBookingModalOpen(true);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all"
                >
                  Book Now
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  No payment required
                </p>
              </div>

              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">{provider.location}, {provider.city}</span>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-gray-200 hover:border-orange-300 text-gray-700 hover:text-orange-600 font-medium rounded-xl transition-all">
                    <MessageSquare className="w-5 h-5" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Providers */}
          {relatedProviders.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Similar Providers
                </h2>
                <Link
                  href={`/services/${provider.categories[0]?.toLowerCase()}`}
                  className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProviders.map((relatedProvider) => (
                  <ProviderCard key={relatedProvider.uid} provider={relatedProvider} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          provider={provider}
          service={selectedService}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedService(null);
          }}
          onConfirm={(booking) => {
            console.log('Booking confirmed:', booking);
          }}
        />
      )}
    </>
  );
}

// ==================== LOADING SKELETON ====================

function ProviderDetailLoadingSkeleton() {
  return (
    <>
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="h-5 bg-gray-200 rounded w-64 mb-6 animate-pulse" />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-80 h-64 lg:h-80 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="flex-1 space-y-4">
              <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse" />
                <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-14 bg-gray-200 rounded-xl w-48 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl p-6 lg:p-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-32 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 h-64 animate-pulse" />
          </div>
        </div>
      </section>
    </>
  );
}

