'use client';

import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  ArrowRight,
} from 'lucide-react';

// ==================== TYPES ====================

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ==================== CONSTANTS ====================

const footerSections: FooterSection[] = [
  {
    title: 'Services',
    links: [
      { label: 'Browse All Services', href: '/services' },
      { label: 'Recruitment Agencies', href: '/services?category=Recruitment' },
      { label: 'Migration & Visa', href: '/services?category=Migration' },
      { label: 'Beauty & Wellness', href: '/services?category=Beauty' },
      { label: 'Dentist', href: '/services?category=Dentist' },
      { label: 'Doctors', href: '/services?category=Doctors' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Become a Provider', href: '/register?role=provider' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Register', href: '/register' },
      { label: 'Login', href: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

const socialLinks: SocialLink[] = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'YouTube', href: '#', icon: Youtube },
];

// ==================== FOOTER COMPONENT ====================

/**
 * Main footer component
 * Features:
 * - Company logo and description
 * - Four-column layout for links (Services, Company, Support, Legal)
 * - Contact information
 * - Social media links
 * - Newsletter subscription
 * - Copyright notice
 * - Responsive: 4 columns on desktop, stacked on mobile
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* ==================== MAIN FOOTER ==================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* ==================== BRAND SECTION ==================== */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-gray-900">S</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">Set-U-</span>
                <span className="text-xl font-bold text-yellow-400">Free</span>
              </div>
            </Link>

            {/* Description */}
            <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-sm">
              Connecting you with trusted local service providers. Book instantly, 
              get things done effortlessly, and set yourself free from everyday hassles.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a
                href="mailto:contact.freesetu@gmail.com"
                className="flex items-center gap-3 text-gray-400 hover:text-yellow-400 transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                contact.freesetu@gmail.com
              </a>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <button
                    key={social.name}
                    onClick={() => toast.success(`Follow us on ${social.name} - Coming soon!`)}
                    className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-yellow-400 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all duration-200"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ==================== LINK SECTIONS ==================== */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-yellow-400 transition-colors text-sm inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ==================== NEWSLETTER SECTION ==================== */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-white font-semibold mb-2">
                Subscribe to our newsletter
              </h3>
              <p className="text-gray-400 text-sm">
                Get the latest updates, tips, and exclusive offers delivered to your inbox.
              </p>
            </div>
            <form 
              className="flex gap-3 w-full lg:w-auto"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Thank you for your interest! Newsletter coming soon.');
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-72 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-xl shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all flex items-center gap-2 text-sm whitespace-nowrap"
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ==================== BOTTOM BAR ==================== */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} FreeSetu. All rights reserved.
            </p>

            {/* Bottom Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <Link
                href="/privacy"
                className="text-gray-500 hover:text-yellow-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-500 hover:text-yellow-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-gray-500 hover:text-yellow-400 transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Made with love */}
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Made with
              <span className="text-red-500">❤</span>
              in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
