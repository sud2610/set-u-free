'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import {
  Mail,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

// ==================== DATA ====================

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
  {
    question: 'Can I cancel or reschedule my booking?',
    answer: 'Yes, you can cancel or reschedule your booking anytime before the scheduled appointment through your dashboard.',
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
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
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      toast.success('Message sent successfully!');
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
        <main className="flex-1 overflow-hidden">
          
          {/* Hero Section */}
          <section className="relative py-20 lg:py-28 bg-black overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-900/30 via-black to-black" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px]" />
            
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
              }}
            />
            
            <div className="relative max-w-4xl mx-auto px-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-8 backdrop-blur-sm">
                <MessageSquare className="w-4 h-4" />
                Get in Touch
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
                We&apos;d Love to
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                  Hear From You
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 max-w-xl mx-auto">
                Have a question, feedback, or need support? Our team is here to help.
              </p>
            </div>
          </section>

          {/* Contact Info Badges */}
          <section className="relative -mt-8 z-10 pb-12">
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-3 px-6 py-4 bg-gray-900 border border-gray-800 rounded-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="text-white font-medium">contact.freesetu@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-gray-900 border border-gray-800 rounded-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Response Time</p>
                    <p className="text-white font-medium">Within 24-48 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Form Section */}
          <section className="py-16 lg:py-20 bg-gradient-to-b from-black via-gray-950 to-gray-900">
            <div className="max-w-5xl mx-auto px-6">
              <div className="grid lg:grid-cols-5 gap-12">
                
                {/* Contact Form */}
                <div className="lg:col-span-3">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Send className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Send a Message</h2>
                        <p className="text-gray-500 text-sm">We&apos;ll get back to you soon</p>
                      </div>
                    </div>

                    {isSubmitted ? (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
                          <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
                        <p className="text-gray-400 mb-8">
                          Thank you for reaching out. Our team will get back to you within 24 hours.
                        </p>
                        <button
                          onClick={() => setIsSubmitted(false)}
                          className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                        >
                          Send another message →
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name & Email Row */}
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all ${
                                errors.name ? 'border-red-500/50' : 'border-gray-700'
                              }`}
                              placeholder="John Doe"
                            />
                            {errors.name && (
                              <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                              Email *
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all ${
                                errors.email ? 'border-red-500/50' : 'border-gray-700'
                              }`}
                              placeholder="john@example.com"
                            />
                            {errors.email && (
                              <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
                            )}
                          </div>
                        </div>

                        {/* Phone & Subject Row */}
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">
                              Phone (Optional)
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all ${
                                errors.phone ? 'border-red-500/50' : 'border-gray-700'
                              }`}
                              placeholder="0400 000 000"
                            />
                            {errors.phone && (
                              <p className="mt-1.5 text-sm text-red-400">{errors.phone}</p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-2">
                              Subject
                            </label>
                            <select
                              id="subject"
                              name="subject"
                              value={formData.subject}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all appearance-none cursor-pointer"
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                            >
                              <option value="general">General Inquiry</option>
                              <option value="support">Customer Support</option>
                              <option value="provider">Provider Support</option>
                              <option value="business">Business Partnership</option>
                              <option value="feedback">Feedback</option>
                              <option value="bug">Report a Bug</option>
                            </select>
                          </div>
                        </div>

                        {/* Message */}
                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">
                            Message *
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={5}
                            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none ${
                              errors.message ? 'border-red-500/50' : 'border-gray-700'
                            }`}
                            placeholder="How can we help you?"
                          />
                          {errors.message && (
                            <p className="mt-1.5 text-sm text-red-400">{errors.message}</p>
                          )}
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>

                {/* Side Panel */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h3 className="font-bold text-white">Quick Actions</h3>
                    </div>
                    <div className="space-y-3">
                      <Link
                        href="/"
                        className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-amber-500/30 transition-all group"
                      >
                        <span className="text-gray-300 group-hover:text-white transition-colors">Browse Services</span>
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-amber-400 transition-colors" />
                      </Link>
                      <Link
                        href="/provider-access"
                        className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-amber-500/30 transition-all group"
                      >
                        <span className="text-gray-300 group-hover:text-white transition-colors">Become a Provider</span>
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-amber-400 transition-colors" />
                      </Link>
                      <Link
                        href="/about"
                        className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-amber-500/30 transition-all group"
                      >
                        <span className="text-gray-300 group-hover:text-white transition-colors">About Set-U-Free</span>
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-amber-400 transition-colors" />
                      </Link>
                    </div>
                  </div>

                  {/* Direct Email */}
                  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-3">Prefer Email?</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      You can also reach us directly at
                    </p>
                    <a
                      href="mailto:contact.freesetu@gmail.com"
                      className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition-colors"
                    >
                      contact.freesetu@gmail.com
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 lg:py-20 bg-gray-900">
            <div className="max-w-3xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-gray-500">Quick answers to common questions</p>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="font-medium text-white pr-4">{faq.question}</span>
                      <ChevronDown 
                        className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-300 ${
                          openFaq === index ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ${
                        openFaq === index ? 'max-h-40' : 'max-h-0'
                      }`}
                    >
                      <p className="px-5 pb-5 text-gray-400">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-10">
                <p className="text-gray-500">
                  Still have questions?{' '}
                  <a
                    href="mailto:contact.freesetu@gmail.com"
                    className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                  >
                    Email us directly
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="py-16 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
            <div className="relative max-w-3xl mx-auto px-6 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Find a Professional?
              </h3>
              <p className="text-white/80 mb-8">
                Browse hundreds of verified professionals offering free first consultations.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-black hover:bg-gray-900 text-white font-bold rounded-full transition-colors shadow-xl"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
