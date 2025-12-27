'use client';

import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import {
  Heart,
  Eye,
  ShieldOff,
  MapPin,
  Sparkles,
  ArrowRight,
  Stethoscope,
  Scale,
  Brain,
  Plane,
  SmilePlus,
} from 'lucide-react';

// ==================== DATA ====================

const promises = [
  { icon: Heart, text: 'People first', sub: "We're here to help, not to sell", gradient: 'from-pink-500 to-rose-500' },
  { icon: Eye, text: 'Transparent', sub: 'We verify details, never exaggerate', gradient: 'from-cyan-500 to-blue-500' },
  { icon: ShieldOff, text: 'No pay-to-rank', sub: 'Providers never pay for visibility', gradient: 'from-orange-500 to-red-500' },
  { icon: MapPin, text: 'Local focus', sub: 'Built for Australia', gradient: 'from-emerald-500 to-teal-500' },
  { icon: Sparkles, text: 'Tech for good', sub: 'Breaking down barriers', gradient: 'from-violet-500 to-purple-500' },
];

const professionals = [
  { icon: Stethoscope, label: 'Doctors' },
  { icon: SmilePlus, label: 'Dentists' },
  { icon: Scale, label: 'Lawyers' },
  { icon: Plane, label: 'Migration Agents' },
  { icon: Brain, label: 'Mental Health' },
];

// ==================== ABOUT PAGE ====================

export default function AboutPage() {
  return (
    <>
      <Toaster position="top-center" />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 overflow-hidden">
          
          {/* Hero - Bold Statement */}
          <section className="relative min-h-[70vh] flex items-center justify-center bg-black overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/40 via-black to-black" />
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }}
            />
            
            <div className="relative max-w-4xl mx-auto px-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                Your first step, free
              </div>
              
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none mb-6">
                Set-U-
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">Free</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Helping people take the first step
                <br />
                <span className="text-white font-medium">without the fear of cost</span>
              </p>
            </div>
            
            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <div className="w-px h-12 bg-gradient-to-b from-gray-500 to-transparent" />
            </div>
          </section>

          {/* The Problem - Dramatic Red */}
          <section className="relative py-20 lg:py-28 bg-gradient-to-b from-black via-gray-950 to-gray-900">
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex items-start gap-6 mb-12">
                <div className="w-1 h-20 bg-gradient-to-b from-red-500 to-transparent rounded-full" />
                <div>
                  <span className="text-red-400 text-sm font-semibold uppercase tracking-wider">The Problem</span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">
                    Why people stay stuck
                  </h2>
                </div>
              </div>
              
              <p className="text-lg text-gray-400 max-w-3xl mb-12 leading-relaxed">
                Across Australia, people put off important decisions — about their health, legal rights, 
                migration status, or mental wellbeing — because they can't afford consultation fees 
                just to understand their options.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { num: '01', text: 'Delay dental care or health checkups indefinitely' },
                  { num: '02', text: 'Live with legal uncertainty because "just asking" feels expensive' },
                  { num: '03', text: 'Stay anxious and stuck — because the first step costs money' },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-800 hover:border-red-500/50 rounded-2xl p-6 transition-all duration-500 hover:transform hover:-translate-y-1"
                  >
                    <span className="text-5xl font-black text-gray-800 group-hover:text-red-900 transition-colors">{item.num}</span>
                    <p className="text-gray-300 mt-4 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* The Solution - Golden */}
          <section className="relative py-20 lg:py-28 bg-gradient-to-b from-gray-900 to-amber-950/30">
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex items-start gap-6 mb-12">
                <div className="w-1 h-20 bg-gradient-to-b from-amber-400 to-transparent rounded-full" />
                <div>
                  <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">The Solution</span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">
                    Free first consultations
                  </h2>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-3xl p-8 lg:p-12 backdrop-blur-sm mb-12">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug mb-6">
                  No payment. No obligation.
                  <br />
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    Just a conversation.
                  </span>
                </p>
                <p className="text-gray-400 text-lg max-w-2xl">
                  Set-U-Free connects you with professionals who are willing to meet you first — for free.
                </p>
              </div>
              
              {/* Professionals */}
              <div className="flex flex-wrap justify-center gap-3">
                {professionals.map((pro, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full text-gray-300 hover:border-amber-500/50 hover:text-amber-400 transition-all cursor-default"
                  >
                    <pro.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{pro.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quote Section */}
          <section className="py-20 lg:py-28 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
            
            <div className="relative max-w-4xl mx-auto px-6 text-center">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Getting help should start with a conversation,
                <br />
                <span className="text-black/80">not a credit card.</span>
              </p>
            </div>
          </section>

          {/* Our Promise - Cards */}
          <section className="py-20 lg:py-28 bg-gray-950">
            <div className="max-w-5xl mx-auto px-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
                Our Promise
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {promises.map((promise, i) => (
                  <div 
                    key={i}
                    className="group relative bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 text-center transition-all duration-300 hover:transform hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-br ${promise.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <promise.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-1">{promise.text}</h3>
                    <p className="text-gray-500 text-sm">{promise.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works - Steps */}
          <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-950 to-black">
            <div className="max-w-3xl mx-auto px-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
                How It Works
              </h2>
              
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500 via-orange-500 to-transparent" />
                
                <div className="space-y-8">
                  {[
                    'Search for the service you need',
                    'Find providers offering free consultations',
                    'Reach out and confirm directly',
                    'Take that first step — without worry',
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-6 group">
                      <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold">{i + 1}</span>
                      </div>
                      <p className="text-lg text-gray-300 group-hover:text-white transition-colors">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 bg-black border-t border-gray-900">
            <div className="max-w-3xl mx-auto px-6 text-center">
              <p className="text-gray-500 mb-4">
                If Set-U-Free helps you move forward without the fear of cost, then it's doing its job.
              </p>
              <h3 className="text-4xl sm:text-5xl font-black text-white mb-2">
                Set-U-<span className="text-amber-400">Free</span>
              </h3>
              <p className="text-amber-400 font-semibold mb-10">— your first step, free.</p>
              
              <Link
                href="/"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-full transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40"
              >
                Find a Professional
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
