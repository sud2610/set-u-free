import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, Shield, Users, AlertTriangle, Scale, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and Conditions for using Set-U-Free platform.',
};

export default function TermsPage() {
  const lastUpdated = 'December 23, 2024';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 text-gray-800 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Register
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/30 rounded-xl">
              <FileText className="w-8 h-8 text-gray-900" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-800">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-yellow-500" />
              1. Agreement to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Welcome to Set-U-Free. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Set-U-Free website, mobile applications, and services (collectively, the &quot;Platform&quot;). By accessing or using our Platform, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-600 leading-relaxed">
              If you do not agree to these Terms, you may not access or use the Platform. We reserve the right to modify these Terms at any time. Your continued use of the Platform following any changes constitutes acceptance of those changes.
            </p>
          </section>

          {/* Definitions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>&quot;Platform&quot;</strong> refers to the Set-U-Free website, applications, and all related services.</li>
              <li><strong>&quot;User&quot;</strong> refers to any individual who accesses or uses the Platform.</li>
              <li><strong>&quot;Customer&quot;</strong> refers to Users who seek services through the Platform.</li>
              <li><strong>&quot;Service Provider&quot;</strong> refers to businesses or individuals offering services on the Platform.</li>
              <li><strong>&quot;Services&quot;</strong> refers to any services offered by Service Providers through the Platform.</li>
              <li><strong>&quot;Content&quot;</strong> refers to all text, images, data, and other materials on the Platform.</li>
            </ul>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-yellow-500" />
              3. Eligibility
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To use the Platform, you must:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Be at least 18 years of age or the legal age of majority in your jurisdiction</li>
              <li>Have the legal capacity to enter into a binding agreement</li>
              <li>Not be prohibited from using the Platform under applicable laws</li>
              <li>Provide accurate and complete registration information</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Account Registration and Security</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To access certain features of the Platform, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
          </section>

          {/* Platform Use */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Platform Use</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">5.1 Permitted Use</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Platform is provided to connect Customers with Service Providers. You may use the Platform only for lawful purposes and in accordance with these Terms.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">5.2 Prohibited Activities</h3>
            <p className="text-gray-600 leading-relaxed mb-2">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Use the Platform for any illegal or unauthorized purpose</li>
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Post false, misleading, or fraudulent content</li>
              <li>Harass, abuse, or harm other Users</li>
              <li>Interfere with or disrupt the Platform or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Platform</li>
              <li>Use automated systems or software to extract data from the Platform</li>
              <li>Impersonate any person or entity</li>
              <li>Transmit viruses, malware, or other harmful code</li>
            </ul>
          </section>

          {/* Service Providers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Service Provider Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you register as a Service Provider, you additionally agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Maintain all necessary licenses, permits, and certifications</li>
              <li>Provide accurate information about your services and qualifications</li>
              <li>Deliver services professionally and in accordance with industry standards</li>
              <li>Honor all bookings and appointments made through the Platform</li>
              <li>Respond to Customer inquiries in a timely manner</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Maintain appropriate insurance coverage where required</li>
            </ul>
          </section>

          {/* Bookings and Payments */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Bookings and Consultations</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Set-U-Free facilitates free consultations between Customers and Service Providers. The Platform serves as an intermediary and is not a party to any agreement between Customers and Service Providers.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>All bookings are subject to Service Provider availability</li>
              <li>Service Providers set their own terms for services beyond initial consultations</li>
              <li>Any payments for services are made directly between Customers and Service Providers</li>
              <li>Set-U-Free is not responsible for the quality, safety, or legality of services provided</li>
            </ul>
          </section>

          {/* Content */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. User Content</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You may post reviews, comments, and other content on the Platform. By posting content, you:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Grant Set-U-Free a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content</li>
              <li>Represent that you own or have the right to post such content</li>
              <li>Agree that your content will not violate any third-party rights</li>
              <li>Accept that Set-U-Free may remove content that violates these Terms</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-yellow-500" />
              9. Intellectual Property
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Platform and its original content, features, and functionality are owned by Set-U-Free and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-gray-600 leading-relaxed">
              You may not copy, modify, distribute, sell, or lease any part of the Platform without our prior written consent.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              10. Disclaimers
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. SET-U-FREE DOES NOT WARRANT THAT:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>The Platform will be uninterrupted, secure, or error-free</li>
              <li>The results obtained from the Platform will be accurate or reliable</li>
              <li>Any Service Provider will meet your expectations</li>
              <li>Any defects in the Platform will be corrected</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SET-U-FREE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Loss of profits, data, or goodwill</li>
              <li>Service interruption or computer damage</li>
              <li>The conduct or content of any third party on the Platform</li>
              <li>Any services provided by Service Providers</li>
            </ul>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Set-U-Free and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Platform, violation of these Terms, or infringement of any third-party rights.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Termination</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may terminate or suspend your account and access to the Platform immediately, without prior notice, for any reason, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Harm to other Users or the Platform</li>
              <li>At our sole discretion for any reason</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Australia, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts of New South Wales, Australia.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on the Platform and updating the &quot;Last Updated&quot; date. Your continued use of the Platform after such changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-yellow-500" />
              16. Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="text-gray-600 space-y-2">
              <li><strong>Email:</strong> contact.freesetu@gmail.com</li>
              <li><strong>Website:</strong> www.setufree.com</li>
            </ul>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link 
            href="/register" 
            className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
          >
            ← Back to Register
          </Link>
          <Link 
            href="/privacy" 
            className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
          >
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}

