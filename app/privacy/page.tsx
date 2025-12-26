import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Database, Lock, Globe, Users, Mail, Cookie } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for FreeSetu platform - How we collect, use, and protect your data.',
};

export default function PrivacyPage() {
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
              <Shield className="w-8 h-8 text-gray-900" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Privacy Policy</h1>
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
              <Eye className="w-6 h-6 text-yellow-500" />
              1. Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              FreeSetu (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile applications, and services (collectively, the &quot;Platform&quot;).
            </p>
            <p className="text-gray-600 leading-relaxed">
              Please read this Privacy Policy carefully. By accessing or using our Platform, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-yellow-500" />
              2. Information We Collect
            </h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Personal Information You Provide</h3>
            <p className="text-gray-600 leading-relaxed mb-2">We collect information you provide directly, including:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
              <li><strong>Profile Information:</strong> Profile photo, location, bio, preferences</li>
              <li><strong>Business Information:</strong> (For Service Providers) Business name, address, licenses, certifications, service descriptions</li>
              <li><strong>Communications:</strong> Messages, reviews, feedback, and support requests</li>
              <li><strong>Payment Information:</strong> When applicable, payment card details and billing address</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 Information Collected Automatically</h3>
            <p className="text-gray-600 leading-relaxed mb-2">When you use our Platform, we automatically collect:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers</li>
              <li><strong>Log Information:</strong> Access times, pages viewed, IP address, referring URL</li>
              <li><strong>Location Information:</strong> General location based on IP address; precise location with your consent</li>
              <li><strong>Usage Information:</strong> Features used, actions taken, time spent on Platform</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.3 Information from Third Parties</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Social Media:</strong> If you sign in via Google or other social platforms, we receive basic profile information</li>
              <li><strong>Service Providers:</strong> Analytics providers, advertising networks, and other third-party services</li>
              <li><strong>Public Sources:</strong> Publicly available information relevant to our services</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-2">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide, maintain, and improve our Platform</li>
              <li>Create and manage your account</li>
              <li>Connect Customers with Service Providers</li>
              <li>Process bookings and consultations</li>
              <li>Send notifications, updates, and promotional communications</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address fraud and security issues</li>
              <li>Comply with legal obligations</li>
              <li>Personalize your experience and provide recommendations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-yellow-500" />
              4. How We Share Your Information
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may share your information in the following circumstances:
            </p>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1 With Other Users</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li>Customers can see Service Provider profiles, including business name, services, location, and reviews</li>
              <li>Service Providers can see Customer names and contact information for booked consultations</li>
              <li>Reviews and ratings are visible to all users</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">4.2 With Service Providers</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              We share information with third-party service providers who perform services on our behalf, such as hosting, analytics, customer support, and payment processing.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">4.3 For Legal Reasons</h3>
            <p className="text-gray-600 leading-relaxed mb-2">We may disclose information if required by law or if we believe it is necessary to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li>Comply with legal process or government requests</li>
              <li>Enforce our Terms of Service</li>
              <li>Protect our rights, privacy, safety, or property</li>
              <li>Protect the safety of our users or the public</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">4.4 Business Transfers</h3>
            <p className="text-gray-600 leading-relaxed">
              If FreeSetu is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-yellow-500" />
              5. Data Security
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security assessments and audits</li>
              <li>Access controls and employee training</li>
              <li>Incident response procedures</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We retain your personal information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Support business operations</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              When you delete your account, we will delete or anonymize your personal information within 30 days, except where retention is required by law.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights and Choices</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restrict Processing:</strong> Request limitations on how we use your data</li>
              <li><strong>Object:</strong> Object to certain types of data processing</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              To exercise these rights, please contact us at contact.freesetu@gmail.com. We will respond to your request within 30 days.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-yellow-500" />
              8. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to collect and store information. These include:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li><strong>Essential Cookies:</strong> Required for the Platform to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Platform</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Track your activity for advertising purposes</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              You can manage cookie preferences through your browser settings. Note that disabling certain cookies may affect Platform functionality.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-yellow-500" />
              9. International Data Transfers
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. When we transfer your information internationally, we implement appropriate safeguards to ensure your data remains protected in accordance with this Privacy Policy.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our Platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at contact.freesetu@gmail.com, and we will take steps to delete such information.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Third-Party Links</h2>
            <p className="text-gray-600 leading-relaxed">
              Our Platform may contain links to third-party websites and services. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Australian Privacy Principles */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Australian Privacy Principles</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              For Australian users, we comply with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth). This includes:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Open and transparent management of personal information</li>
              <li>Giving you the option to deal with us anonymously where practicable</li>
              <li>Collecting only necessary information</li>
              <li>Ensuring information is accurate, up-to-date, and complete</li>
              <li>Providing access to your personal information upon request</li>
              <li>Allowing you to request correction of your information</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              If you believe we have breached the APPs, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC).
            </p>
          </section>

          {/* Contact */}
          <section className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-yellow-500" />
              14. Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions, concerns, or complaints about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="text-gray-600 space-y-2">
              <li><strong>Email:</strong> contact.freesetu@gmail.com</li>
              <li><strong>Website:</strong> www.setufree.com</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We will respond to all privacy-related inquiries within 30 days.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link 
            href="/terms" 
            className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
          >
            ← Terms of Service
          </Link>
          <Link 
            href="/register" 
            className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
          >
            Back to Register →
          </Link>
        </div>
      </div>
    </div>
  );
}

