import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
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
      { label: 'Home Services', href: '/services/home-services' },
      { label: 'Beauty & Wellness', href: '/services/beauty-wellness' },
      { label: 'Health & Fitness', href: '/services/health-fitness' },
      { label: 'Education & Tutoring', href: '/services/education-tutoring' },
      { label: 'Events & Entertainment', href: '/services/events-entertainment' },
      { label: 'All Categories', href: '/services' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Press & Media', href: '/press' },
      { label: 'Partner With Us', href: '/partners' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Safety Guidelines', href: '/safety' },
      { label: 'Community Guidelines', href: '/guidelines' },
      { label: 'Report an Issue', href: '/report' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Refund Policy', href: '/refund' },
      { label: 'Cancellation Policy', href: '/cancellation' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  },
];

const socialLinks: SocialLink[] = [
  { name: 'Facebook', href: 'https://facebook.com/setufree', icon: Facebook },
  { name: 'Twitter', href: 'https://twitter.com/setufree', icon: Twitter },
  { name: 'Instagram', href: 'https://instagram.com/setufree', icon: Instagram },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/setufree', icon: Linkedin },
  { name: 'YouTube', href: 'https://youtube.com/@setufree', icon: Youtube },
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
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">Set-U-</span>
                <span className="text-xl font-bold text-orange-500">Free</span>
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
                href="mailto:support@setufree.com"
                className="flex items-center gap-3 text-gray-400 hover:text-orange-400 transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                support@setufree.com
              </a>
              <a
                href="tel:+61298765432"
                className="flex items-center gap-3 text-gray-400 hover:text-orange-400 transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                +61 2 9876 5432
              </a>
              <div className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  123 George Street,<br />
                  Sydney, NSW 2000
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-orange-500 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
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
                      className="text-gray-400 hover:text-orange-400 transition-colors text-sm inline-block"
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
            <form className="flex gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-72 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center gap-2 text-sm whitespace-nowrap"
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
              © {currentYear} Set-U-Free. All rights reserved.
            </p>

            {/* Bottom Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <Link
                href="/privacy"
                className="text-gray-500 hover:text-orange-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-500 hover:text-orange-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-gray-500 hover:text-orange-400 transition-colors"
              >
                Cookie Settings
              </Link>
              <Link
                href="/sitemap"
                className="text-gray-500 hover:text-orange-400 transition-colors"
              >
                Sitemap
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
