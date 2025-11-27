'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  MessageSquare,
  HelpCircle,
  Building,
  ArrowRight,
} from 'lucide-react';

// ==================== DATA ====================

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    details: ['support@setufree.com', 'business@setufree.com'],
    color: 'bg-blue-500',
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+91 1800-XXX-XXXX (Toll Free)', 'Mon-Sat: 9AM - 6PM IST'],
    color: 'bg-green-500',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    details: ['123 Business Park, Sector 5', 'Mumbai, Maharashtra 400001'],
    color: 'bg-orange-500',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    details: ['Monday - Saturday', '9:00 AM - 6:00 PM IST'],
    color: 'bg-purple-500',
  },
];

const faqs = [
  {
    question: 'How do I book a free consultation?',
    answer: 'Simply browse our services, select a provider, and click "Book Free Consultation". Choose your preferred time slot and confirm your booking.',
  },
  {
    question: 'Is there any cost for using the platform?',
    answer: 'No! Consultations are completely free for customers. Providers may charge for additional services after the consultation.',
  },
  {
    question: 'How are providers verified?',
    answer: 'We verify all providers through document checks, background verification, and customer reviews to ensure quality service.',
  },
];

// ==================== CONTACT PAGE ====================

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==================== VALIDATION ====================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.message.trim() || formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== HANDLERS ====================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, send to API
      // await fetch('/api/contact', {
      //   method: 'POST',
      //   body: JSON.stringify(formData),
      // });

      setIsSubmitted(true);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <>
      <Toaster position="top-center" />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-orange-50 via-white to-amber-50 py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto">
                <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6">
                  Get in Touch
                </span>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                  We&apos;d Love to{' '}
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                    Hear From You
                  </span>
                </h1>
                <p className="mt-6 text-xl text-gray-600">
                  Have a question, feedback, or need support? Our team is here to help you.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Info Cards */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {contactInfo.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div
                      className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4`}
                    >
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    {item.details.map((detail, i) => (
                      <p key={i} className="text-gray-600 text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Form & Map Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
                      <p className="text-gray-500 text-sm">We&apos;ll respond within 24 hours</p>
                    </div>
                  </div>

                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Thank you for reaching out. Our team will get back to you within 24 hours.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                            errors.name ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="Enter your name"
                        />
                        {errors.name && (
                          <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                            errors.email ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="Enter your email"
                        />
                        {errors.email && (
                          <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number (Optional)
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                            errors.phone ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="Enter your phone number"
                        />
                        {errors.phone && (
                          <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>
                        )}
                      </div>

                      {/* Subject */}
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="support">Customer Support</option>
                          <option value="provider">Provider Support</option>
                          <option value="business">Business Partnership</option>
                          <option value="feedback">Feedback</option>
                          <option value="bug">Report a Bug</option>
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none ${
                            errors.message ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="How can we help you?"
                        />
                        {errors.message && (
                          <p className="mt-1.5 text-sm text-red-600">{errors.message}</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>

                {/* Map & Additional Info */}
                <div className="space-y-8">
                  {/* Map Embed */}
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm h-80">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1704000000000!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Office Location"
                    />
                  </div>

                  {/* Quick Links */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Links</h3>
                    <div className="space-y-4">
                      <Link
                        href="/"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                          <span className="font-medium text-gray-700 group-hover:text-orange-600">
                            Browse Services
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                      </Link>
                      <Link
                        href="/register?role=provider"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                          <span className="font-medium text-gray-700 group-hover:text-orange-600">
                            Become a Provider
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                      </Link>
                      <Link
                        href="/about"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                          <span className="font-medium text-gray-700 group-hover:text-orange-600">
                            About Us
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                <p className="mt-4 text-gray-600">
                  Quick answers to common questions
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <p className="text-gray-600">
                  Still have questions?{' '}
                  <a
                    href="mailto:support@setufree.com"
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Email us directly
                  </a>
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

