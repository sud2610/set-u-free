import { Metadata } from 'next';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import {
  FileText,
  Users,
  Shield,
  Ban,
  Scale,
  AlertTriangle,
  CreditCard,
  Mail,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// ==================== METADATA ====================

export const metadata: Metadata = {
  title: 'Terms of Service | FreeSetu - Platform Rules and User Agreement',
  description:
    'Read the Terms of Service for FreeSetu. Understand your rights, responsibilities, and the rules governing the use of our platform.',
  keywords: ['terms of service', 'user agreement', 'platform rules', 'terms and conditions'],
  openGraph: {
    title: 'Terms of Service | FreeSetu',
    description: 'The rules and guidelines for using FreeSetu platform.',
  },
};

// ==================== DATA ====================

const lastUpdated = 'January 15, 2024';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    icon: FileText,
    content: `By accessing or using FreeSetu ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Platform.

These Terms apply to all users, including:
• Customers seeking services
• Service providers offering consultations
• Visitors browsing the Platform

We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms.`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    icon: Users,
    content: `To use FreeSetu, you must:

**Age Requirements:**
• Be at least 18 years old
• Have the legal capacity to enter into binding agreements
• If under 18, have parental or guardian consent

**Account Requirements:**
• Provide accurate and complete information
• Maintain the security of your account credentials
• Accept responsibility for all activities under your account
• Not create multiple accounts or impersonate others

**Provider Requirements:**
• Possess valid professional licenses where applicable
• Provide accurate business information
• Maintain appropriate insurance coverage
• Comply with all applicable laws and regulations`,
  },
  {
    id: 'services',
    title: '3. Platform Services',
    icon: Shield,
    content: `FreeSetu provides a platform connecting customers with service providers. We do not directly provide professional services.

**What We Offer:**
• Service provider discovery and search
• Booking and scheduling tools
• Communication features
• Review and rating system
• Payment processing (where applicable)

**What We Don't Guarantee:**
• Quality of services provided by third-party providers
• Accuracy of provider information
• Availability of specific providers or time slots
• Outcomes of consultations or services

**Free Consultations:**
Initial consultations booked through our platform are free. Providers may charge for additional services at their discretion.`,
  },
  {
    id: 'user-responsibilities',
    title: '4. User Responsibilities',
    icon: CheckCircle,
    content: `**All Users Must:**
• Provide accurate information
• Respect other users' privacy
• Communicate professionally
• Honor booking commitments
• Report violations or concerns
• Comply with applicable laws

**Customers Must:**
• Show up for scheduled appointments
• Cancel bookings with reasonable notice (24 hours minimum)
• Provide accurate health/service information when required
• Pay for any agreed-upon services
• Leave honest reviews

**Providers Must:**
• Maintain accurate business profiles
• Respond to booking requests promptly
• Honor confirmed appointments
• Provide services as described
• Maintain professional standards
• Handle customer data responsibly`,
  },
  {
    id: 'prohibited-conduct',
    title: '5. Prohibited Conduct',
    icon: Ban,
    content: `The following activities are strictly prohibited:

**Account Violations:**
• Creating fake accounts or profiles
• Sharing account credentials
• Accessing others' accounts without permission
• Circumventing security measures

**Content Violations:**
• Posting false or misleading information
• Uploading harmful or illegal content
• Harassing or threatening other users
• Spamming or sending unsolicited messages

**Service Violations:**
• Offering services outside the Platform to avoid fees
• Discriminating against users
• Providing false credentials or qualifications
• Engaging in fraudulent activities

**Technical Violations:**
• Attempting to hack or disrupt the Platform
• Scraping data without permission
• Introducing malware or viruses
• Interfering with other users' access

Violations may result in immediate account suspension or termination.`,
  },
  {
    id: 'bookings',
    title: '6. Bookings and Cancellations',
    icon: Scale,
    content: `**Booking Process:**
• Bookings are requests until confirmed by providers
• Confirmation is sent via email and app notification
• Both parties must honor confirmed bookings

**Cancellation Policy:**
• Customers: Cancel at least 24 hours before appointment
• Providers: Cancel only in exceptional circumstances
• Repeated cancellations may result in penalties

**No-Shows:**
• Customers who don't show up may be flagged
• Three no-shows may result in booking restrictions
• Providers who don't honor bookings face review penalties

**Rescheduling:**
• Both parties may request rescheduling
• Must be done at least 12 hours before appointment
• Subject to mutual agreement`,
  },
  {
    id: 'payments',
    title: '7. Payments and Fees',
    icon: CreditCard,
    content: `**Free Consultations:**
Initial consultations booked through FreeSetu are free for customers.

**Paid Services:**
• Providers may charge for services beyond free consultation
• Prices are set by providers
• Payment terms are between customer and provider
• We may facilitate payments through our platform

**Platform Fees:**
• Providers may be charged service fees
• Fee structure is communicated upon registration
• Fees are subject to change with notice

**Refunds:**
• Refund policies for paid services are set by providers
• Platform fees are non-refundable except in specific cases
• Disputes are handled through our support system`,
  },
  {
    id: 'intellectual-property',
    title: '8. Intellectual Property',
    icon: FileText,
    content: `**Platform Ownership:**
All content, design, and functionality of FreeSetu are owned by us and protected by intellectual property laws.

**User Content:**
• You retain ownership of content you create
• You grant us a license to use, display, and distribute your content
• You are responsible for ensuring you have rights to content you post

**Restrictions:**
• Do not copy or reproduce Platform content
• Do not use our trademarks without permission
• Do not reverse engineer our technology
• Respect other users' intellectual property`,
  },
  {
    id: 'disclaimers',
    title: '9. Disclaimers',
    icon: AlertTriangle,
    content: `**Service Disclaimer:**
THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE:
• Uninterrupted or error-free service
• Accuracy of information provided by users
• Quality of third-party services
• Results from using the Platform

**Provider Disclaimer:**
We are not responsible for:
• Actions of service providers
• Quality of services rendered
• Disputes between users
• Professional advice given by providers

**Limitation of Liability:**
TO THE MAXIMUM EXTENT PERMITTED BY LAW, SET-U-FREE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.`,
  },
  {
    id: 'indemnification',
    title: '10. Indemnification',
    icon: Shield,
    content: `You agree to indemnify and hold harmless FreeSetu, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:

• Your use of the Platform
• Your violation of these Terms
• Your violation of any third-party rights
• Content you post on the Platform
• Services you provide (for providers)
• Disputes with other users

This indemnification obligation survives termination of your account.`,
  },
  {
    id: 'termination',
    title: '11. Account Termination',
    icon: XCircle,
    content: `**Voluntary Termination:**
• You may close your account at any time
• Request account deletion through settings or support
• Some data may be retained for legal purposes

**Involuntary Termination:**
We may suspend or terminate accounts for:
• Violation of these Terms
• Fraudulent or illegal activity
• Repeated complaints from other users
• Extended inactivity
• At our discretion with notice

**Effects of Termination:**
• Access to the Platform will be revoked
• Pending bookings will be cancelled
• Your content may be removed
• Outstanding obligations remain enforceable`,
  },
  {
    id: 'disputes',
    title: '12. Dispute Resolution',
    icon: Scale,
    content: `**Between Users:**
• First, attempt to resolve disputes directly
• Contact our support team for mediation
• We may investigate and take action

**With FreeSetu:**
• Disputes are governed by Australian law
• Courts in New South Wales, Australia have exclusive jurisdiction
• You waive any right to participate in class actions

**Process:**
1. Submit a written complaint to contact.freesetu@gmail.com
2. We will respond within 30 days
3. If unresolved, proceed to formal dispute resolution`,
  },
  {
    id: 'general',
    title: '13. General Provisions',
    icon: FileText,
    content: `**Entire Agreement:**
These Terms, along with our Privacy Policy, constitute the entire agreement between you and FreeSetu.

**Severability:**
If any provision is found unenforceable, the remaining provisions remain in effect.

**Waiver:**
Failure to enforce any right does not constitute a waiver of that right.

**Assignment:**
You may not assign your rights under these Terms. We may assign our rights without restriction.

**Force Majeure:**
We are not liable for delays or failures due to circumstances beyond our control.`,
  },
  {
    id: 'contact',
    title: '14. Contact Information',
    icon: Mail,
    content: `For questions about these Terms of Service, please contact us:

**Email:** contact.freesetu@gmail.com

We aim to respond to all inquiries within 5 business days.`,
  },
];

// ==================== TERMS PAGE ====================

export default function TermsOfServicePage() {
  return (
    <>
      <Toaster position="top-center" />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 lg:py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Terms of Service</h1>
              <p className="text-xl text-gray-400">
                The rules and guidelines for using FreeSetu
              </p>
              <p className="text-sm text-gray-500 mt-6">Last Updated: {lastUpdated}</p>
            </div>
          </section>

          {/* Quick Summary */}
          <section className="py-8 bg-orange-50 border-b border-orange-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Free consultations for customers</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Verified service providers</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700">24-hour cancellation policy</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Secure and private platform</span>
                </div>
              </div>
            </div>
          </section>

          {/* Table of Contents */}
          <section className="py-8 bg-white border-b border-gray-200 sticky top-16 lg:top-20 z-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-2 justify-center">
                {sections.slice(0, 6).map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 text-sm rounded-lg transition-colors"
                  >
                    {section.title.split('. ')[1]}
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="py-12 lg:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-12">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm scroll-mt-40"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <section.icon className="w-5 h-5 text-orange-600" />
                      </div>
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                        {section.title}
                      </h2>
                    </div>
                    <div className="prose prose-gray max-w-none">
                      {section.content.split('\n\n').map((paragraph, index) => (
                        <p
                          key={index}
                          className="text-gray-600 leading-relaxed mb-4 whitespace-pre-line"
                          dangerouslySetInnerHTML={{
                            __html: paragraph
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
                              .replace(/^• /gm, '<span class="text-orange-500 mr-2">•</span>'),
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Agreement Section */}
              <div className="mt-12 bg-gray-900 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-4">
                  By using FreeSetu, you agree to these Terms
                </h3>
                <p className="text-gray-400 mb-6">
                  If you have questions or concerns, please contact us before using the platform.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/privacy-policy"
                    className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/contact"
                    className="px-6 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

