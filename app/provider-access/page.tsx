'use client';

import { useState, useEffect } from 'react';
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
  Check,
  User,
  Building2,
  ArrowLeft,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ==================== VALIDATION SCHEMAS ====================

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z
  .object({
    businessName: z
      .string()
      .min(1, 'Business name is required')
      .min(2, 'Business name must be at least 2 characters')
      .max(100, 'Business name must be less than 100 characters'),
    providerName: z
      .string()
      .min(1, 'Your name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

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
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`flex items-center gap-1.5 ${strength.hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
          <Check className="w-3.5 h-3.5" />
          8+ characters
        </div>
        <div className={`flex items-center gap-1.5 ${strength.hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
          <Check className="w-3.5 h-3.5" />
          Uppercase letter
        </div>
        <div className={`flex items-center gap-1.5 ${strength.hasLowercase ? 'text-green-600' : 'text-gray-400'}`}>
          <Check className="w-3.5 h-3.5" />
          Lowercase letter
        </div>
        <div className={`flex items-center gap-1.5 ${strength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
          <Check className="w-3.5 h-3.5" />
          Number
        </div>
      </div>
    </div>
  );
}

// ==================== PROVIDER ACCESS PAGE ====================

export default function ProviderAccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const { login, register: registerUser, signInWithGoogle, error: authError, clearError } = useAuth();

  // ==================== STATE ====================
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailNotFoundError, setEmailNotFoundError] = useState<string | null>(null);
  const [attemptedEmail, setAttemptedEmail] = useState('');

  // ==================== LOGIN FORM ====================
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // ==================== SIGNUP FORM ====================
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      businessName: '',
      providerName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchPassword = signupForm.watch('password');

  // ==================== EFFECTS ====================
  useEffect(() => {
    // Clear errors when switching modes
    clearError();
    setEmailNotFoundError(null);
  }, [mode, clearError]);

  // ==================== HANDLERS ====================

  const handleLoginSubmit = async (data: LoginFormData) => {
    clearError();
    setEmailNotFoundError(null);
    setAttemptedEmail(data.email);

    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.push(redirectUrl);
    } catch (err: any) {
      // Check for specific Firebase error codes
      const errorMessage = err?.message || '';
      const errorCode = err?.code || '';
      
      if (
        errorCode === 'auth/user-not-found' ||
        errorMessage.toLowerCase().includes('user not found') ||
        errorMessage.toLowerCase().includes('no user') ||
        errorMessage.toLowerCase().includes("couldn't find")
      ) {
        setEmailNotFoundError(data.email);
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    }
  };

  const handleSignupSubmit = async (data: SignupFormData) => {
    clearError();
    setEmailNotFoundError(null);

    try {
      await registerUser(data.email, data.password, {
        fullName: data.providerName,
        role: 'provider',
        businessName: data.businessName,
        location: '',
      });

      toast.success('Account created successfully! Welcome to FreeSetu!');
      router.push('/dashboard');
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setEmailNotFoundError(null);
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

  const switchToSignup = () => {
    // Pre-fill the email if we have an attempted email
    if (attemptedEmail) {
      signupForm.setValue('email', attemptedEmail);
    }
    setMode('signup');
    setEmailNotFoundError(null);
  };

  const isLoginLoading = loginForm.formState.isSubmitting || isGoogleLoading;
  const isSignupLoading = signupForm.formState.isSubmitting || isGoogleLoading;

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen flex">
      {/* ==================== LEFT SIDE - BRANDING ==================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-300/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-2xl font-bold text-yellow-500">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">FreeSetu</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full">
            <Briefcase className="w-5 h-5 text-gray-900" />
            <span className="text-sm font-semibold text-gray-900">Provider Dashboard</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
            Grow your business
            <br />
            with FreeSetu
          </h1>
          <p className="text-gray-800 text-lg max-w-md leading-relaxed">
            Connect with customers seeking free consultations. Manage your services,
            appointments, and grow your client base.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="text-3xl font-bold text-gray-900">1000+</div>
              <div className="text-gray-700 text-sm">Active Providers</div>
            </div>
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="text-3xl font-bold text-gray-900">50+</div>
              <div className="text-gray-700 text-sm">Service Categories</div>
            </div>
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="text-3xl font-bold text-gray-900">10K+</div>
              <div className="text-gray-700 text-sm">Monthly Leads</div>
            </div>
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="text-3xl font-bold text-gray-900">4.9★</div>
              <div className="text-gray-700 text-sm">Provider Rating</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-gray-700 text-sm">
          © {new Date().getFullYear()} FreeSetu. All rights reserved.
        </div>
      </div>

      {/* ==================== RIGHT SIDE - FORM ==================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Back to Home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-gray-900">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FreeSetu</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
              <Briefcase className="w-4 h-4" />
              Provider Access
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-2 text-gray-600">
              {mode === 'login'
                ? 'Enter your credentials to access your dashboard'
                : 'Fill in your details to get started'}
            </p>
          </div>

          {/* ==================== GOOGLE SIGN IN ==================== */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={mode === 'login' ? isLoginLoading : isSignupLoading}
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

          {/* ==================== EMAIL NOT FOUND ERROR ==================== */}
          {emailNotFoundError && mode === 'login' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-800">
                    We couldn&apos;t find an account with this email
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Would you like to create one?
                  </p>
                  <button
                    type="button"
                    onClick={switchToSignup}
                    className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== AUTH ERROR ==================== */}
          {authError && !emailNotFoundError && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">
                  {mode === 'login' ? 'Login Failed' : 'Registration Failed'}
                </p>
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            </div>
          )}

          {/* ==================== LOGIN FORM ==================== */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    disabled={isLoginLoading}
                    {...loginForm.register('email')}
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      loginForm.formState.errors.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-yellow-500 focus:border-yellow-500'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
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
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={isLoginLoading}
                    {...loginForm.register('password')}
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      loginForm.formState.errors.password
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
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoginLoading}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-300 text-gray-900 font-semibold rounded-xl shadow-lg shadow-yellow-500/25 disabled:shadow-none transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loginForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </form>
          )}

          {/* ==================== SIGNUP FORM ==================== */}
          {mode === 'signup' && (
            <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-5">
              {/* Business Name Input */}
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="businessName"
                    type="text"
                    disabled={isSignupLoading}
                    {...signupForm.register('businessName')}
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      signupForm.formState.errors.businessName
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-yellow-500 focus:border-yellow-500'
                    }`}
                    placeholder="Your Business Name"
                  />
                </div>
                {signupForm.formState.errors.businessName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {signupForm.formState.errors.businessName.message}
                  </p>
                )}
              </div>

              {/* Provider Name Input */}
              <div>
                <label htmlFor="providerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="providerName"
                    type="text"
                    autoComplete="name"
                    disabled={isSignupLoading}
                    {...signupForm.register('providerName')}
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      signupForm.formState.errors.providerName
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-yellow-500 focus:border-yellow-500'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {signupForm.formState.errors.providerName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {signupForm.formState.errors.providerName.message}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    disabled={isSignupLoading}
                    {...signupForm.register('email')}
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      signupForm.formState.errors.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-yellow-500 focus:border-yellow-500'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={isSignupLoading}
                    {...signupForm.register('password')}
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      signupForm.formState.errors.password
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-yellow-500 focus:border-yellow-500'
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {signupForm.formState.errors.password.message}
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
                    disabled={isSignupLoading}
                    {...signupForm.register('confirmPassword')}
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      signupForm.formState.errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-yellow-500 focus:border-yellow-500'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {signupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms Agreement */}
              <p className="text-sm text-gray-600">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="font-medium text-yellow-600 hover:text-yellow-700 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-yellow-600 hover:text-yellow-700 underline">
                  Privacy Policy
                </Link>
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSignupLoading}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-300 text-gray-900 font-semibold rounded-xl shadow-lg shadow-yellow-500/25 disabled:shadow-none transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {signupForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* ==================== MODE TOGGLE ==================== */}
          <p className="mt-8 text-center text-gray-600">
            {mode === 'login' ? (
              <>
                New provider?{' '}
                <button
                  type="button"
                  onClick={switchToSignup}
                  className="font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

