'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Clock, X, CheckCircle, Mail } from 'lucide-react';

export function PendingApprovalBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user just registered as provider
    const registered = searchParams.get('registered');
    if (registered === 'pending') {
      setIsVisible(true);
      
      // Remove the query param from URL without refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 p-2 bg-white/20 rounded-full">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <p className="font-bold text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Registration Successful!
                </p>
                <p className="text-white/90 text-sm sm:text-base">
                  Your provider application is pending admin approval. We&apos;ll notify you via email once approved. 
                  <span className="hidden sm:inline"> This usually takes 1-2 business days.</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close banner"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

