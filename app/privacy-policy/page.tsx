import { Metadata } from 'next';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Shield, Eye, Lock, Bell, Trash2, FileText, Mail } from 'lucide-react';

// ==================== METADATA ====================

export const metadata: Metadata = {
  title: 'Privacy Policy | FreeSetu - How We Protect Your Data',
  description:
    'Learn how FreeSetu collects, uses, and protects your personal information. Our commitment to your privacy and data security.',
  keywords: ['privacy policy', 'data protection', 'personal information', 'user rights', 'GDPR'],
  openGraph: {
    title: 'Privacy Policy | FreeSetu',
    description: 'Our commitment to protecting your privacy and personal data.',
  },
};

// ==================== DATA ====================

const lastUpdated = 'January 15, 2024';

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    icon: Shield,
    content: `Welcome to FreeSetu ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.

By using FreeSetu, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.`,
  },
  {
    id: 'information-collection',
    title: '2. Information We Collect',
    icon: Eye,
    content: `We collect several types of information to provide and improve our services:

**Personal Information:**
• Full name and contact details (email, phone number)
• Location and address information
• Profile pictures and business images
• Payment information (processed securely by third parties)

**Account Information:**
• Username and password (encrypted)
• Account preferences and settings
• Role type (customer or provider)

**Usage Data:**
• Browsing history on our platform
• Search queries and filters used
• Booking history and interactions
• Device information and IP address

**Provider-Specific Information:**
• Business name and description
• Professional credentials and certifications
• Service offerings and pricing
• Availability and time slots`,
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    icon: FileText,
    content: `We use the collected information for the following purposes:

**To Provide Services:**
• Process and manage bookings
• Connect customers with service providers
• Send booking confirmations and reminders
• Enable communication between users

**To Improve Our Platform:**
• Analyze usage patterns and trends
• Develop new features and services
• Optimize user experience
• Conduct research and analytics

**For Communication:**
• Send service-related notifications
• Provide customer support
• Send promotional materials (with consent)
• Respond to inquiries and feedback

**For Safety and Security:**
• Verify user identities
• Prevent fraud and abuse
• Enforce our terms of service
• Comply with legal obligations`,
  },
  {
    id: 'data-sharing',
    title: '4. Information Sharing and Disclosure',
    icon: Lock,
    content: `We may share your information in the following circumstances:

**With Service Providers:**
When you book a consultation, relevant information is shared with the provider to facilitate the service.

**With Third-Party Service Providers:**
We use trusted third parties for:
• Payment processing (Stripe, Razorpay)
• Email delivery services
• Cloud hosting (AWS, Google Cloud)
• Analytics (Google Analytics)

**For Legal Compliance:**
We may disclose information when required by law, legal process, or government request.

**Business Transfers:**
In the event of a merger, acquisition, or sale of assets, user information may be transferred.

**With Your Consent:**
We may share information with third parties when you give us explicit permission.

**We Never Sell Your Data:**
We do not sell, rent, or trade your personal information to third parties for marketing purposes.`,
  },
  {
    id: 'data-security',
    title: '5. Data Security',
    icon: Shield,
    content: `We implement robust security measures to protect your information:

**Technical Safeguards:**
• SSL/TLS encryption for data transmission
• Encrypted storage for sensitive data
• Regular security audits and testing
• Secure authentication mechanisms

**Organizational Measures:**
• Limited access to personal data
• Employee training on data protection
• Incident response procedures
• Regular policy reviews

**What You Can Do:**
• Use strong, unique passwords
• Enable two-factor authentication
• Log out from shared devices
• Report suspicious activity

While we strive to protect your data, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security but commit to promptly addressing any breaches.`,
  },
  {
    id: 'user-rights',
    title: '6. Your Rights and Choices',
    icon: Bell,
    content: `You have the following rights regarding your personal information:

**Access and Portability:**
• Request a copy of your personal data
• Export your data in a portable format
• View what information we hold about you

**Correction and Update:**
• Update your profile information
• Correct inaccurate data
• Complete incomplete information

**Deletion:**
• Request deletion of your account
• Remove specific data points
• Right to be forgotten (subject to legal requirements)

**Opt-Out Options:**
• Unsubscribe from marketing emails
• Disable non-essential notifications
• Opt out of analytics tracking
• Withdraw consent for data processing

**How to Exercise Your Rights:**
Contact us at contact.freesetu@gmail.com or through your account settings. We will respond within 30 days.`,
  },
  {
    id: 'cookies',
    title: '7. Cookies and Tracking',
    icon: Eye,
    content: `We use cookies and similar technologies to enhance your experience:

**Essential Cookies:**
Required for basic platform functionality, authentication, and security.

**Analytics Cookies:**
Help us understand how users interact with our platform to improve services.

**Preference Cookies:**
Remember your settings and preferences for a personalized experience.

**Marketing Cookies:**
Used to deliver relevant advertisements (with your consent).

**Managing Cookies:**
You can control cookies through your browser settings. Note that disabling certain cookies may affect platform functionality.

**Do Not Track:**
We honor Do Not Track signals from browsers where technically feasible.`,
  },
  {
    id: 'data-retention',
    title: '8. Data Retention',
    icon: Trash2,
    content: `We retain your information for as long as necessary to:

• Provide our services
• Comply with legal obligations
• Resolve disputes
• Enforce our agreements

**Retention Periods:**
• Active accounts: Data retained while account is active
• Deleted accounts: Data removed within 90 days
• Transaction records: Retained for 7 years (legal requirement)
• Usage logs: Retained for 2 years

After the retention period, data is securely deleted or anonymized.`,
  },
  {
    id: 'children',
    title: '9. Children\'s Privacy',
    icon: Shield,
    content: `FreeSetu is not intended for users under 18 years of age. We do not knowingly collect personal information from children.

If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. We will take steps to delete such information from our systems.`,
  },
  {
    id: 'international',
    title: '10. International Data Transfers',
    icon: Lock,
    content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place:

• Standard contractual clauses
• Data processing agreements
• Compliance with applicable data protection laws

By using our services, you consent to such transfers while we ensure your data receives the same level of protection.`,
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    icon: FileText,
    content: `We may update this Privacy Policy from time to time. We will notify you of changes by:

• Posting the new policy on this page
• Updating the "Last Updated" date
• Sending email notification for significant changes
• Displaying in-app notifications

We encourage you to review this policy periodically. Continued use of our services after changes constitutes acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '12. Contact Us',
    icon: Mail,
    content: `If you have questions about this Privacy Policy or our data practices, please contact us:

**Email:** contact.freesetu@gmail.com

We aim to respond to all inquiries within 30 days.`,
  },
];

// ==================== PRIVACY POLICY PAGE ====================

export default function PrivacyPolicyPage() {
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
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
              <p className="text-xl text-gray-400">
                Your privacy matters to us. Learn how we protect your data.
              </p>
              <p className="text-sm text-gray-500 mt-6">Last Updated: {lastUpdated}</p>
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

              {/* Footer Note */}
              <div className="mt-12 bg-orange-50 rounded-2xl p-6 text-center">
                <p className="text-gray-700">
                  By using FreeSetu, you acknowledge that you have read and understood this Privacy Policy.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  <Link
                    href="/terms-of-service"
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Terms of Service →
                  </Link>
                  <Link
                    href="/contact"
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Contact Us →
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

