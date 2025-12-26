import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import {
  Heart,
  Target,
  Shield,
  Award,
  Zap,
  Globe,
  Star,
  Quote,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

// ==================== METADATA ====================

export const metadata: Metadata = {
  title: 'About Us | Set-U-Free - Connecting You with Trusted Service Providers',
  description:
    'Learn about Set-U-Free, our mission to connect customers with verified service providers for free consultations. Discover our story, values, and the team behind the platform.',
  keywords: [
    'about set-u-free',
    'free consultation platform',
    'service providers',
    'our story',
    'mission',
    'team',
  ],
  openGraph: {
    title: 'About Set-U-Free',
    description: 'Connecting customers with trusted service providers since 2023.',
    images: ['/og-about.png'],
  },
};

// ==================== DATA ====================

const values = [
  {
    icon: Heart,
    title: 'Customer First',
    description: 'We prioritize our users\' needs, ensuring every interaction adds value to their lives.',
    color: 'bg-rose-500',
  },
  {
    icon: Shield,
    title: 'Trust & Safety',
    description: 'Every provider is verified to ensure quality service and peace of mind.',
    color: 'bg-blue-500',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We continuously improve our platform to deliver the best booking experience.',
    color: 'bg-amber-500',
  },
  {
    icon: Globe,
    title: 'Accessibility',
    description: 'Making professional services accessible to everyone, everywhere.',
    color: 'bg-green-500',
  },
];

const milestones = [
  { year: '2023', title: 'Founded', description: 'Set-U-Free was born with a vision' },
  { year: '2023', title: '1000+ Providers', description: 'Reached our first milestone' },
  { year: '2024', title: '10+ Cities', description: 'Expanded across Australia' },
  { year: '2024', title: '50K+ Bookings', description: 'Helped thousands find services' },
];

const testimonials = [
  {
    quote: 'Set-U-Free transformed how I find local services. The free consultation feature is a game-changer!',
    author: 'Meera Joshi',
    role: 'Small Business Owner',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
  },
  {
    quote: 'As a provider, this platform helped me reach more customers than I ever imagined. Highly recommended!',
    author: 'Dr. Vikram Singh',
    role: 'Dental Specialist',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100',
  },
  {
    quote: 'The verification process gives me confidence that I\'m choosing quality professionals.',
    author: 'Ananya Reddy',
    role: 'Homemaker',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
  },
];

const stats = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '500+', label: 'Verified Providers' },
  { value: '25+', label: 'Cities' },
  { value: '4.8', label: 'Average Rating' },
];

// ==================== ABOUT PAGE ====================

export default function AboutPage() {
  return (
    <>
      <Toaster position="top-center" />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-orange-50 via-white to-amber-50 py-20 lg:py-28 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full blur-3xl" />
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto">
                <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6">
                  Our Story
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Connecting People with{' '}
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                    Trusted Professionals
                  </span>
                </h1>
                <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                  Set-U-Free was founded with a simple mission: make it easy for everyone to 
                  access quality services through free consultations with verified professionals.
                </p>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-lg shadow-orange-500/5 border border-orange-100 text-center"
                  >
                    <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-orange-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    We believe everyone deserves access to quality professional services 
                    without the barrier of upfront costs. Our platform bridges the gap between 
                    customers seeking services and verified professionals ready to help.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    Through free consultations, we empower customers to make informed decisions 
                    while giving providers the opportunity to showcase their expertise and grow 
                    their business.
                  </p>
                  <div className="space-y-4">
                    {[
                      '100% free consultations for customers',
                      'Verified and trusted service providers',
                      'Easy booking with instant confirmation',
                      'Secure and transparent platform',
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-3xl bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
                      alt="Team collaboration"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Trusted Platform</div>
                        <div className="text-sm text-gray-500">Since 2023</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Our Core Values
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  The principles that guide everything we do
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div
                      className={`w-14 h-14 ${value.color} rounded-2xl flex items-center justify-center mb-6`}
                    >
                      <value.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Timeline Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Our Journey</h2>
                <p className="mt-4 text-lg text-gray-600">
                  Key milestones in our growth story
                </p>
              </div>

              <div className="relative">
                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-orange-200" />
                <div className="space-y-12">
                  {milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className={`flex flex-col lg:flex-row items-center gap-8 ${
                        index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                      }`}
                    >
                      <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                        <div className="bg-gray-50 rounded-2xl p-6 inline-block">
                          <div className="text-orange-600 font-bold text-lg">{milestone.year}</div>
                          <h3 className="text-xl font-bold text-gray-900 mt-1">{milestone.title}</h3>
                          <p className="text-gray-600 mt-2">{milestone.description}</p>
                        </div>
                      </div>
                      <div className="relative z-10 w-4 h-4 bg-orange-500 rounded-full ring-4 ring-orange-100" />
                      <div className="flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20 bg-orange-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  What People Say
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Hear from our customers and providers
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-sm">
                    <Quote className="w-10 h-10 text-orange-200 mb-4" />
                    <p className="text-gray-700 leading-relaxed mb-6">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.author}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.author}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-orange-500 to-amber-500">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-orange-100 mb-8">
                Join thousands of happy customers who have found their perfect service provider.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors"
                >
                  Browse Services
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/register?role=provider"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Become a Provider
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

