'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  Globe,
  ExternalLink,
  Navigation,
  Building2,
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
        // Fetch provider first
        const providerData = await getProvider(providerId);
        
        if (providerData) {
          setProvider(providerData);
          
          // Update document title with provider name
          document.title = `${providerData.businessName} | ${providerData.categories[0] || 'Services'} | FreeSetu`;
          
          // Fetch related data separately - don't let failures prevent page from loading
          try {
            const servicesData = await getServices(providerId);
            setServices(servicesData);
          } catch (e) {
            console.warn('Failed to fetch services:', e);
            setServices([]);
          }
          
          try {
            const reviewsData = await getProviderReviews(providerId);
            setReviews(reviewsData.map(r => ({ ...r, userName: 'Anonymous User' })));
          } catch (e) {
            console.warn('Failed to fetch reviews:', e);
            setReviews([]);
          }
          
          try {
            const relatedData = await getProvidersByCategory(providerData.categories[0] || '');
            setRelatedProviders(relatedData.filter(p => p.uid !== providerId).slice(0, 3));
          } catch (e) {
            console.warn('Failed to fetch related providers:', e);
            setRelatedProviders([]);
          }
        } else {
          // Provider not found
          setProvider(null);
          document.title = 'Provider Not Found | FreeSetu';
        }
      } catch (error) {
        console.error('Error fetching provider:', error);
        // Provider fetch failed
        setProvider(null);
        document.title = 'Provider Not Found | FreeSetu';
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
    return (
      <section className="py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Provider Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn&apos;t find the provider you&apos;re looking for. 
            They may have been removed or the link might be incorrect.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to Home
          </Link>
        </div>
      </section>
    );
  }

  // ==================== RENDER ====================

  return (
    <>
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-100/20 to-orange-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link href="/" className="text-gray-500 hover:text-yellow-600 transition-colors">
              Services
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link 
              href={`/?category=${encodeURIComponent(provider.categories[0])}`}
              className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
            >
              {provider.categories[0]}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {provider.businessName}
            </span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Profile Image & Call Button */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="relative h-72 lg:h-96 rounded-3xl overflow-hidden shadow-2xl shadow-yellow-500/20 ring-4 ring-white">
                {provider.profileImage ? (
                  <Image
                    src={provider.profileImage}
                    alt={provider.businessName}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 flex items-center justify-center">
                    <span className="text-7xl font-bold text-white drop-shadow-lg">
                      {provider.businessName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                {provider.verified && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-4 py-2 bg-green-500/90 backdrop-blur-sm text-white text-sm font-semibold rounded-full shadow-lg">
                    <BadgeCheck className="w-4 h-4" />
                    Verified Provider
                  </div>
                )}
                {/* Free Consultation Badge */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-4 py-2 bg-white/90 backdrop-blur-sm text-green-700 text-sm font-bold rounded-full shadow-lg">
                  ✓ Free Consultation
                </div>
              </div>
              
              {/* Call for Booking Button */}
              {(provider as any).phone && (
                <a
                  href={`tel:${(provider as any).phone}`}
                  className="group w-full mt-5 px-6 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 font-bold rounded-2xl shadow-xl shadow-yellow-500/30 hover:shadow-yellow-500/40 transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02]"
                >
                  <div className="p-2 bg-white/30 rounded-lg group-hover:bg-white/40 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>Call for Booking</span>
                </a>
              )}
            </div>

            {/* Provider Info */}
            <div className="flex-1">
              {/* Action Buttons - Top Right */}
              <div className="flex justify-end gap-3 mb-4">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-3.5 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    isFavorite
                      ? 'bg-red-50 border-red-200 text-red-500 shadow-lg shadow-red-500/20'
                      : 'bg-white/80 backdrop-blur-sm border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
                  }`}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3.5 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-500 hover:border-yellow-300 hover:text-yellow-600 transition-all duration-300 hover:scale-105"
                  aria-label="Share"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              {/* Centered Business Name with Elegant Typography */}
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent">
                    {provider.businessName}
                  </span>
                </h1>
                {/* Decorative underline - centered */}
                <div className="mt-3 h-1 w-32 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-400 rounded-full mx-auto" />
                
                {/* Categories - centered */}
                <div className="flex flex-wrap justify-center gap-2 mt-5">
                  {provider.categories.map((cat, index) => (
                    <span
                      key={index}
                      className="px-4 py-1.5 bg-white/80 backdrop-blur-sm text-yellow-700 text-sm font-semibold rounded-full border border-yellow-200 shadow-sm"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Location - centered */}
                <div className="flex items-center justify-center gap-2 mt-5 text-gray-600">
                  <div className="p-2 bg-white/80 rounded-lg">
                    <MapPin className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="font-medium">{provider.location}, {provider.city}</span>
                </div>

                {/* Rating - centered */}
                <div className="flex justify-center mt-5">
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                    <div className="flex items-center gap-0.5">
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
                    <span className="font-bold text-gray-900 text-lg">{provider.rating}</span>
                    <span className="text-gray-500 text-sm">
                      ({provider.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center p-5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-yellow-500/10 border border-yellow-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                    {provider.reviewCount}+
                  </div>
                  <div className="text-sm text-gray-500 font-medium mt-1">Reviews</div>
                </div>
                <div className="text-center p-5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-yellow-500/10 border border-yellow-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                    {services.length || '5+'}
                  </div>
                  <div className="text-sm text-gray-500 font-medium mt-1">Services</div>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg shadow-green-500/10 border border-green-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-bold text-green-600">Free</div>
                  <div className="text-sm text-green-600/70 font-medium mt-1">Consultation</div>
                </div>
              </div>


              {/* CTA Button - Hidden for MVP, will be implemented later */}
              {/* <button
                onClick={() => {
                  setSelectedService(services[0] || null);
                  setIsBookingModalOpen(true);
                }}
                className="w-full sm:w-auto mt-6 px-8 py-4 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Book Free Consultation
              </button> */}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MAIN CONTENT ==================== */}
      <section className="py-10 lg:py-14 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <Users className="w-6 h-6 text-yellow-600" />
                  </div>
                  About Us
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed text-lg">
                    {provider.bio || provider.description || 'Welcome to our practice! We are dedicated to providing exceptional service and care to all our clients. Our experienced team is committed to delivering personalized solutions tailored to your unique needs. Contact us today to schedule your free consultation.'}
                  </p>
                  
                  {/* Additional Details */}
                  <div className="mt-8 grid sm:grid-cols-2 gap-4">
                    {/* Location Details */}
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-yellow-100">
                      <div className="p-3 bg-yellow-100 rounded-xl">
                        <Building2 className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Location</p>
                        <p className="text-gray-600 mt-1">
                          {provider.location}
                          {(provider as any).postcode && `, ${(provider as any).postcode}`}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {provider.city}{(provider as any).state && `, ${(provider as any).state}`}
                        </p>
                      </div>
                    </div>
                    
                    {/* Free Consultation Badge */}
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <BadgeCheck className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-green-700">Free Consultation</p>
                        <p className="text-green-600 mt-1">
                          No payment required for initial consultation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Business Hours */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                    <div className="p-2 bg-yellow-100 rounded-xl">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    Business Hours
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(() => {
                      // Default business hours
                      const defaultHours = {
                        monday: '9:00 AM - 5:00 PM',
                        tuesday: '9:00 AM - 5:00 PM',
                        wednesday: '9:00 AM - 5:00 PM',
                        thursday: '9:00 AM - 5:00 PM',
                        friday: '9:00 AM - 5:00 PM',
                        saturday: '10:00 AM - 2:00 PM',
                        sunday: 'Closed',
                      };
                      
                      // Check if provider has business hours with actual values
                      const providerHours = (provider as any).businessHours;
                      const hasValidHours = providerHours && 
                        Object.values(providerHours).some((h: any) => h && h.trim() !== '');
                      
                      const hoursToDisplay = hasValidHours ? providerHours : defaultHours;
                      
                      return Object.entries(hoursToDisplay).map(([day, hours]) => {
                        const isClosed = (hours as string) === 'Closed' || !(hours as string);
                        return (
                          <div 
                            key={day} 
                            className={`flex justify-between text-sm py-3 px-4 rounded-xl ${
                              isClosed 
                                ? 'bg-gray-100 text-gray-500' 
                                : 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100'
                            }`}
                          >
                            <span className="font-semibold capitalize">{day}</span>
                            <span className={isClosed ? 'text-gray-400' : 'text-yellow-700 font-medium'}>
                              {(hours as string) || 'Closed'}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  Services Offered
                </h2>
                {services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-yellow-50/30 rounded-2xl hover:from-yellow-50 hover:to-amber-50 border border-gray-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="mb-3 sm:mb-0 flex-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-yellow-700 transition-colors text-lg">
                            {service.title}
                          </h3>
                          <p className="text-gray-500 mt-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                              <Clock className="w-4 h-4" />
                              <span>{service.duration} min</span>
                            </div>
                            <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                              ✓ Free Consultation
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Show categories as services when no specific services exist */
                  <div className="space-y-4">
                    {provider.categories.map((category, index) => (
                      <div
                        key={index}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-yellow-50/30 rounded-2xl border border-gray-100 hover:border-yellow-200 hover:shadow-md transition-all duration-300"
                      >
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {category} Services
                          </h3>
                          <p className="text-gray-500 mt-2">
                            Professional {category.toLowerCase()} services available. Contact us for details.
                          </p>
                          <div className="flex items-center gap-2 mt-3 text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
                            <BadgeCheck className="w-4 h-4" />
                            <span>Free Consultation Available</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-gray-500 text-center pt-4 border-t border-gray-100">
                      Contact the provider directly for detailed service information and pricing.
                    </p>
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Customer Reviews ({reviews.length})
                  </h2>
                </div>

                {/* Rating Summary */}
                <div className="flex items-center gap-6 p-4 bg-yellow-50 rounded-xl mb-6">
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
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0">
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
                                {new Date(review.createdAt).toLocaleDateString('en-AU', {
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
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
                  </div>
                )}

                {reviews.length > 4 && (
                  <button className="w-full mt-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
                    View All Reviews
                  </button>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Availability Card - Hidden for MVP, will be implemented later */}
              {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
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
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-xl shadow-lg shadow-yellow-500/25 transition-all"
                >
                  Book Now
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  No payment required
                </p>
              </div> */}

              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Contact Information
                </h3>
                
                {/* Verified Badge */}
                {provider.verified && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl mb-4">
                    <BadgeCheck className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-semibold text-green-700 text-sm">Verified Provider</p>
                      <p className="text-green-600 text-xs">Identity & credentials verified</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {/* Location */}
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p>{provider.location}</p>
                      <p className="text-gray-500">{provider.city}{(provider as any).state && `, ${(provider as any).state}`}</p>
                    </div>
                  </div>
                  
                  {/* Phone - Call for Booking */}
                  {(provider as any).phone && (
                    <a 
                      href={`tel:${(provider as any).phone}`}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-xl shadow-lg shadow-yellow-500/25 transition-all"
                    >
                      <Phone className="w-5 h-5" />
                      Call for Booking
                    </a>
                  )}
                  
                  {/* Phone Number Display */}
                  {(provider as any).phone && (
                    <div className="flex items-center gap-3 text-gray-600 p-2 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{(provider as any).phone}</span>
                    </div>
                  )}
                  
                  {/* Website */}
                  {(provider as any).website && (
                    <a 
                      href={(provider as any).website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-gray-200 hover:border-yellow-400 text-gray-700 hover:text-yellow-600 font-medium rounded-xl transition-all"
                    >
                      <Globe className="w-5 h-5" />
                      Visit Website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  
                  {/* Get Directions */}
                  {(provider as any).googleMapsUrl ? (
                    <a 
                      href={(provider as any).googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-600 font-medium rounded-xl transition-all"
                    >
                      <Navigation className="w-5 h-5" />
                      Get Directions
                    </a>
                  ) : (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.location + ', ' + provider.city)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-600 font-medium rounded-xl transition-all"
                    >
                      <Navigation className="w-5 h-5" />
                      Get Directions
                    </a>
                  )}
                </div>
                
                {/* Rating Summary in Sidebar */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Overall Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-gray-900">{provider.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Reviews</span>
                    <span className="font-medium text-gray-700">{provider.reviewCount}</span>
                  </div>
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
                  href="/services"
                  className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
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

      {/* Booking Modal - Hidden for MVP, will be implemented later */}
      {/* {selectedService && (
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
      )} */}
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

