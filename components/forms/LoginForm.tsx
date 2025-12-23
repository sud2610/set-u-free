'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ==================== VALIDATION SCHEMA ====================

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ==================== LOGIN FORM COMPONENT ====================

/**
 * Login form component
 * Features:
 * - Email and password inputs
 * - Remember me checkbox
 * - Form validation with Zod
 * - Google sign-in
 * - Loading states
 * - Error display
 * - Toast notifications
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  
  const { login, signInWithGoogle, error: authError, clearError } = useAuth();

  // ==================== STATE ====================
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ==================== FORM ====================
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // ==================== HANDLERS ====================

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.push(redirectUrl);
    } catch (err) {
      // Error is handled by AuthContext and displayed in the form
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setIsGoogleLoading(true);
    
    try {
      await signInWithGoogle();
      toast.success('Welcome!');
      router.push(redirectUrl);
    } catch (err) {
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isLoading = isSubmitting || isGoogleLoading;

  // ==================== RENDER ====================

  return (
    <div className="w-full max-w-md">
      {/* ==================== GOOGLE SIGN IN ==================== */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-medium text-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Continue with Google
      </button>

      {/* ==================== DIVIDER ==================== */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-sm text-gray-500">
            or continue with email
          </span>
        </div>
      </div>

      {/* ==================== ERROR DISPLAY ==================== */}
      {authError && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Login Failed</p>
            <p className="text-sm text-red-600">{authError}</p>
          </div>
        </div>
      )}

      {/* ==================== FORM ==================== */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isLoading}
              {...register('email')}
              className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:ring-yellow-500 focus:border-yellow-500'
              }`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              disabled={isLoading}
              {...register('password')}
              className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.password
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:ring-yellow-500 focus:border-yellow-500'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-3">
          <input
            id="rememberMe"
            type="checkbox"
            {...register('rememberMe')}
            className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
            Remember me for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-300 text-gray-900 font-semibold rounded-xl shadow-lg shadow-yellow-500/25 disabled:shadow-none transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* ==================== SIGN UP LINK ==================== */}
      <p className="mt-8 text-center text-gray-600">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
