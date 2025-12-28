'use client';

import { useEffect, useState } from 'react';

export function AnimatedServiceIllustration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`relative w-80 h-64 sm:w-96 sm:h-72 lg:w-[420px] lg:h-80 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl animate-pulse" />
      
      {/* Main SVG Illustration */}
      <svg
        viewBox="0 0 420 320"
        className="relative w-full h-full drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Decorative background circles */}
        <circle cx="210" cy="180" r="120" fill="white" opacity="0.15" className="animate-pulse-slow" />
        <circle cx="210" cy="180" r="90" fill="white" opacity="0.1" />

        {/* Connection lines from person to services */}
        <g className="animate-connection-flow">
          <path d="M210 140 Q120 80 70 100" stroke="white" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" className="animate-dash-flow" />
          <path d="M210 140 Q300 80 350 100" stroke="white" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" className="animate-dash-flow-reverse" />
          <path d="M180 200 Q100 220 60 260" stroke="white" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" className="animate-dash-flow" />
          <path d="M240 200 Q320 220 360 260" stroke="white" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" className="animate-dash-flow-reverse" />
        </g>

        {/* Main Human Figure - Woman with laptop/phone */}
        <g className="animate-gentle-float">
          {/* Hair */}
          <ellipse cx="210" cy="95" rx="35" ry="38" fill="#4a3728" />
          <path d="M175 95 Q175 130 190 145 Q175 140 170 120 Q165 100 175 85" fill="#4a3728" />
          <path d="M245 95 Q245 130 230 145 Q245 140 250 120 Q255 100 245 85" fill="#4a3728" />
          
          {/* Face */}
          <ellipse cx="210" cy="105" rx="28" ry="32" fill="#f5d0c5" />
          
          {/* Hair bangs */}
          <path d="M182 85 Q195 75 210 78 Q225 75 238 85 Q235 70 210 68 Q185 70 182 85" fill="#4a3728" />
          
          {/* Eyes */}
          <ellipse cx="198" cy="100" rx="4" ry="5" fill="#2d3748" />
          <ellipse cx="222" cy="100" rx="4" ry="5" fill="#2d3748" />
          <circle cx="199" cy="99" r="1.5" fill="white" />
          <circle cx="223" cy="99" r="1.5" fill="white" />
          
          {/* Eyebrows */}
          <path d="M192 92 Q198 90 204 92" stroke="#4a3728" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M216 92 Q222 90 228 92" stroke="#4a3728" strokeWidth="2" fill="none" strokeLinecap="round" />
          
          {/* Nose */}
          <path d="M210 105 Q212 110 210 115" stroke="#e8b4a8" strokeWidth="2" fill="none" strokeLinecap="round" />
          
          {/* Smile */}
          <path d="M200 120 Q210 130 220 120" stroke="#c97b63" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          
          {/* Blush */}
          <ellipse cx="188" cy="115" rx="6" ry="3" fill="#ffb5a7" opacity="0.6" />
          <ellipse cx="232" cy="115" rx="6" ry="3" fill="#ffb5a7" opacity="0.6" />
          
          {/* Neck */}
          <rect x="200" y="135" width="20" height="15" fill="#f5d0c5" />
          
          {/* Body/Shirt */}
          <path d="M165 150 Q165 175 170 210 L180 210 L180 170 Q190 155 210 155 Q230 155 240 170 L240 210 L250 210 Q255 175 255 150 Q240 140 210 140 Q180 140 165 150" fill="#0ea5e9" />
          
          {/* Collar */}
          <path d="M195 150 L210 165 L225 150" stroke="#0284c7" strokeWidth="2" fill="none" />
          
          {/* Arms */}
          <path d="M165 155 Q140 170 135 195" stroke="#f5d0c5" strokeWidth="16" strokeLinecap="round" fill="none" />
          <path d="M255 155 Q280 170 285 195" stroke="#f5d0c5" strokeWidth="16" strokeLinecap="round" fill="none" />
          
          {/* Hands */}
          <circle cx="135" cy="200" r="12" fill="#f5d0c5" />
          <circle cx="285" cy="200" r="12" fill="#f5d0c5" />
          
          {/* Phone in left hand */}
          <rect x="122" y="188" rx="4" width="26" height="45" fill="#1e293b" className="animate-phone-glow" />
          <rect x="125" y="193" rx="2" width="20" height="35" fill="#38bdf8" />
          
          {/* Waving right hand detail */}
          <path d="M280 188 L290 178" stroke="#f5d0c5" strokeWidth="4" strokeLinecap="round" />
          <path d="M285 190 L295 183" stroke="#f5d0c5" strokeWidth="4" strokeLinecap="round" />
          <path d="M288 194 L298 190" stroke="#f5d0c5" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Floating Service Icons */}
        
        {/* Doctor - Top Left */}
        <g className="animate-float-1">
          <circle cx="70" cy="90" r="28" fill="white" opacity="0.95" />
          <circle cx="70" cy="90" r="24" fill="#dbeafe" />
          <text x="70" y="98" textAnchor="middle" fontSize="26">👨‍⚕️</text>
          {/* Ping effect */}
          <circle cx="70" cy="90" r="28" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.5" className="animate-ping-slow" />
        </g>

        {/* Dentist - Top Right */}
        <g className="animate-float-2">
          <circle cx="350" cy="90" r="28" fill="white" opacity="0.95" />
          <circle cx="350" cy="90" r="24" fill="#fef3c7" />
          <text x="350" y="98" textAnchor="middle" fontSize="26">🦷</text>
          <circle cx="350" cy="90" r="28" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.5" className="animate-ping-slow" />
        </g>

        {/* Beauty - Bottom Left */}
        <g className="animate-float-3">
          <circle cx="55" cy="260" r="28" fill="white" opacity="0.95" />
          <circle cx="55" cy="260" r="24" fill="#fce7f3" />
          <text x="55" y="268" textAnchor="middle" fontSize="26">💅</text>
          <circle cx="55" cy="260" r="28" stroke="#ec4899" strokeWidth="2" fill="none" opacity="0.5" className="animate-ping-slow" />
        </g>

        {/* Legal - Bottom Right */}
        <g className="animate-float-4">
          <circle cx="365" cy="260" r="28" fill="white" opacity="0.95" />
          <circle cx="365" cy="260" r="24" fill="#e0e7ff" />
          <text x="365" y="268" textAnchor="middle" fontSize="26">⚖️</text>
          <circle cx="365" cy="260" r="28" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.5" className="animate-ping-slow" />
        </g>

        {/* Sparkles and stars */}
        <g className="animate-sparkle">
          <path d="M100 50 L103 56 L110 56 L105 61 L107 68 L100 64 L93 68 L95 61 L90 56 L97 56 Z" fill="#fbbf24" />
          <path d="M320 50 L322 54 L327 54 L323 57 L325 62 L320 59 L315 62 L317 57 L313 54 L318 54 Z" fill="#fbbf24" />
          <path d="M150 280 L152 284 L157 284 L153 287 L155 292 L150 289 L145 292 L147 287 L143 284 L148 284 Z" fill="white" />
          <path d="M270 280 L272 284 L277 284 L273 287 L275 292 L270 289 L265 292 L267 287 L263 284 L268 284 Z" fill="white" />
        </g>

        {/* Floating hearts */}
        <g className="animate-heart-float">
          <path d="M180 50 C180 45, 175 40, 170 43 C165 46, 165 52, 180 63 C195 52, 195 46, 190 43 C185 40, 180 45, 180 50" fill="#f472b6" />
        </g>
        <g className="animate-heart-float-2">
          <path d="M250 55 C250 52, 247 49, 244 51 C241 53, 241 56, 250 63 C259 56, 259 53, 256 51 C253 49, 250 52, 250 55" fill="#fb7185" opacity="0.8" />
        </g>

        {/* FREE badge */}
        <g className="animate-badge-pop">
          <rect x="165" y="245" rx="16" ry="16" width="90" height="36" fill="#fbbf24" />
          <rect x="167" y="247" rx="14" ry="14" width="86" height="32" fill="#fcd34d" />
          <text x="210" y="270" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#78350f">
            100% FREE
          </text>
        </g>

        {/* Verified checkmarks */}
        <g className="animate-check-pop-1">
          <circle cx="95" cy="65" r="10" fill="#22c55e" />
          <path d="M90 65 L94 69 L101 61" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <g className="animate-check-pop-2">
          <circle cx="325" cy="65" r="10" fill="#22c55e" />
          <path d="M320 65 L324 69 L331 61" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* WiFi/Connection symbol above person */}
        <g className="animate-wifi">
          <path d="M195 45 Q210 35 225 45" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
          <path d="M200 52 Q210 45 220 52" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
          <circle cx="210" cy="58" r="3" fill="white" />
        </g>
      </svg>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-4px, -8px) rotate(-3deg); }
          50% { transform: translate(0, -12px) rotate(0deg); }
          75% { transform: translate(4px, -8px) rotate(3deg); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(4px, -10px) rotate(3deg); }
          50% { transform: translate(0, -15px) rotate(0deg); }
          75% { transform: translate(-4px, -10px) rotate(-3deg); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-5px, -6px) rotate(-2deg); }
          50% { transform: translate(0, -10px) rotate(0deg); }
          75% { transform: translate(5px, -6px) rotate(2deg); }
        }
        
        @keyframes float-4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(5px, -8px) rotate(2deg); }
          50% { transform: translate(0, -13px) rotate(0deg); }
          75% { transform: translate(-5px, -8px) rotate(-2deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(10deg); }
        }
        
        @keyframes heart-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.9; }
          50% { transform: translateY(-10px) scale(1.15); opacity: 1; }
        }
        
        @keyframes heart-float-2 {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(-8px) scale(1.1); opacity: 0.9; }
        }
        
        @keyframes badge-pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        
        @keyframes check-pop-1 {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.25); opacity: 0.9; }
        }
        
        @keyframes check-pop-2 {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.25); opacity: 0.9; }
        }
        
        @keyframes dash-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20; }
        }
        
        @keyframes dash-flow-reverse {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 20; }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.05); opacity: 0.2; }
        }
        
        @keyframes phone-glow {
          0%, 100% { filter: drop-shadow(0 0 3px rgba(56, 189, 248, 0.5)); }
          50% { filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.8)); }
        }
        
        @keyframes wifi {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        :global(.animate-gentle-float) {
          animation: gentle-float 3s ease-in-out infinite;
        }
        
        :global(.animate-float-1) {
          animation: float-1 4s ease-in-out infinite;
        }
        
        :global(.animate-float-2) {
          animation: float-2 4.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        
        :global(.animate-float-3) {
          animation: float-3 3.8s ease-in-out infinite;
          animation-delay: 0.3s;
        }
        
        :global(.animate-float-4) {
          animation: float-4 4.2s ease-in-out infinite;
          animation-delay: 0.7s;
        }
        
        :global(.animate-sparkle) {
          animation: sparkle 2.5s ease-in-out infinite;
        }
        
        :global(.animate-heart-float) {
          animation: heart-float 3s ease-in-out infinite;
        }
        
        :global(.animate-heart-float-2) {
          animation: heart-float-2 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        
        :global(.animate-badge-pop) {
          animation: badge-pop 2.5s ease-in-out infinite;
        }
        
        :global(.animate-check-pop-1) {
          animation: check-pop-1 2s ease-in-out infinite;
          animation-delay: 0.3s;
        }
        
        :global(.animate-check-pop-2) {
          animation: check-pop-2 2s ease-in-out infinite;
          animation-delay: 0.8s;
        }
        
        :global(.animate-dash-flow) {
          animation: dash-flow 2s linear infinite;
        }
        
        :global(.animate-dash-flow-reverse) {
          animation: dash-flow-reverse 2s linear infinite;
        }
        
        :global(.animate-ping-slow) {
          animation: ping-slow 3s ease-in-out infinite;
        }
        
        :global(.animate-pulse-slow) {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        :global(.animate-phone-glow) {
          animation: phone-glow 2s ease-in-out infinite;
        }
        
        :global(.animate-wifi) {
          animation: wifi 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
