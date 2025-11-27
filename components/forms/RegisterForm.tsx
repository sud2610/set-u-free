'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
  UserCircle,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ==================== VALIDATION SCHEMA ====================

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['customer', 'provider'], {
      required_error: 'Please select a role',
    }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ==================== PASSWORD STRENGTH ====================

interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

function getPasswordStrength(password: string): PasswordStrength {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const checks = Object.values(strength);
  const passedChecks = checks.filter(Boolean).length;

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
              passedChecks >= level
                ? passedChecks === 4
                  ? 'bg-green-500'
                  : passedChecks >= 3
                  ? 'bg-yellow-500'
                  : 'bg-orange-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Strength Checks */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div
          className={`flex items-center gap-1.5 ${
            strength.hasMinLength ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          8+ characters
        </div>
        <div
          className={`flex items-center gap-1.5 ${
            strength.hasUppercase ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          Uppercase letter
        </div>
        <div
          className={`flex items-center gap-1.5 ${
            strength.hasLowercase ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          Lowercase letter
        </div>
        <div
          className={`flex items-center gap-1.5 ${
            strength.hasNumber ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          Number
        </div>
      </div>
    </div>
  );
}

// ==================== REGISTER FORM COMPONENT ====================

/**
 * Registration form component
 * Features:
 * - Full name, email, password inputs
 * - Confirm password with match validation
 * - Role selection (Customer/Provider)
 * - Terms acceptance checkbox
 * - Password strength indicator
 * - Form validation with Zod
 * - Google sign-in
 * - Loading states
 * - Error display
 * - Toast notifications
 */
export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') as 'customer' | 'provider' | null;

  const { register: registerUser, signInWithGoogle, error: authError, clearError } = useAuth();

  // ==================== STATE ====================
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ==================== FORM ====================
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: defaultRole || 'customer',
      acceptTerms: false,
    },
  });

  const watchPassword = watch('password');
  const watchRole = watch('role');

  // ==================== HANDLERS ====================

  const onSubmit = async (data: RegisterFormData) => {
    clearError();

    try {
      await registerUser(data.email, data.password, {
        fullName: data.fullName,
        role: data.role,
        location: '',
      });
      
      toast.success('Account created successfully!');
      
      // Redirect based on role
      const redirectUrl = data.role === 'provider' 
        ? '/dashboard/provider' 
        : '/dashboard/user';
      router.push(redirectUrl);
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
      toast.success('Account created successfully!');
      router.push('/dashboard/user');
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
      {/* ==================== ROLE SELECTION ==================== */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          I want to
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              watchRole === 'customer'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="radio"
              value="customer"
              {...register('role')}
              className="sr-only"
            />
            <UserCircle
              className={`w-8 h-8 mb-2 ${
                watchRole === 'customer' ? 'text-orange-500' : 'text-gray-400'
              }`}
            />
            <span
              className={`font-semibold ${
                watchRole === 'customer' ? 'text-orange-700' : 'text-gray-700'
              }`}
            >
              Find Services
            </span>
            <span className="text-xs text-gray-500 mt-1">As a customer</span>
            {watchRole === 'customer' && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </label>

          <label
            className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              watchRole === 'provider'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="radio"
              value="provider"
              {...register('role')}
              className="sr-only"
            />
            <Briefcase
              className={`w-8 h-8 mb-2 ${
                watchRole === 'provider' ? 'text-orange-500' : 'text-gray-400'
              }`}
            />
            <span
              className={`font-semibold ${
                watchRole === 'provider' ? 'text-orange-700' : 'text-gray-700'
              }`}
            >
              Offer Services
            </span>
            <span className="text-xs text-gray-500 mt-1">As a provider</span>
            {watchRole === 'provider' && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </label>
        </div>
        {errors.role && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.role.message}
          </p>
        )}
      </div>

      {/* ==================== GOOGLE SIGN UP ==================== */}
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
            or register with email
          </span>
        </div>
      </div>

      {/* ==================== ERROR DISPLAY ==================== */}
      {authError && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Registration Failed</p>
            <p className="text-sm text-red-600">{authError}</p>
          </div>
        </div>
      )}

      {/* ==================== FORM ==================== */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name Input */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              disabled={isLoading}
              {...register('fullName')}
              className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.fullName
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'
              }`}
              placeholder="John Doe"
            />
          </div>
          {errors.fullName && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.fullName.message}
            </p>
          )}
        </div>

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
                  : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={isLoading}
              {...register('password')}
              className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.password
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'
              }`}
              placeholder="Create a strong password"
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
          <PasswordStrengthIndicator password={watchPassword} />
        </div>

        {/* Confirm Password Input */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={isLoading}
              {...register('confirmPassword')}
              className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.confirmPassword
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'
              }`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-3">
          <input
            id="acceptTerms"
            type="checkbox"
            {...register('acceptTerms')}
            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-600 cursor-pointer">
            I agree to the{' '}
            <Link
              href="/terms"
              className="font-medium text-orange-600 hover:text-orange-700 underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="font-medium text-orange-600 hover:text-orange-700 underline"
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-red-600 flex items-center gap-1 -mt-2">
            <AlertCircle className="w-4 h-4" />
            {errors.acceptTerms.message}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 disabled:shadow-none transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* ==================== LOGIN LINK ==================== */}
      <p className="mt-8 text-center text-gray-600">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default RegisterForm;
