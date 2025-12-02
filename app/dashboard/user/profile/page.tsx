'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { updateUser } from '@/lib/firestore';

// ==================== VALIDATION SCHEMAS ====================

const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number')
    .optional()
    .or(z.literal('')),
  location: z.string().min(2, 'Location is required').max(100, 'Location too long'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must include uppercase, lowercase, and number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// ==================== PROFILE PAGE ====================

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Load user data
  useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
      });
    }
  }, [user, resetProfile]);

  // ==================== HANDLERS ====================

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user?.uid) return;

    setIsProfileSaving(true);
    setProfileSaved(false);

    try {
      await updateUser(user.uid, {
        fullName: data.fullName,
        phone: data.phone || undefined,
        location: data.location,
      });

      setProfileSaved(true);
      toast.success('Profile updated successfully!');

      // Reset saved state after 3 seconds
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsProfileSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordSaving(true);

    try {
      // In production, implement password change logic with Firebase Auth
      // await updatePassword(user, data.newPassword);
      
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Password changed successfully!');
      resetPassword();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password. Please try again.');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'password'
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Change Password
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
          {/* Profile Image */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="relative">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {user?.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <button
                className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                aria-label="Change profile picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.fullName || 'User'}
              </h2>
              <p className="text-gray-500">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                Customer
              </span>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...registerProfile('fullName')}
                  type="text"
                  id="fullName"
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    profileErrors.fullName ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {profileErrors.fullName && (
                <p className="mt-1.5 text-sm text-red-600">{profileErrors.fullName.message}</p>
              )}
            </div>

            {/* Email (Read Only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...registerProfile('email')}
                  type="email"
                  id="email"
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="mt-1.5 text-sm text-gray-500">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...registerProfile('phone')}
                  type="tel"
                  id="phone"
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    profileErrors.phone ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
              {profileErrors.phone && (
                <p className="mt-1.5 text-sm text-red-600">{profileErrors.phone.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...registerProfile('location')}
                  type="text"
                  id="location"
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    profileErrors.location ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Enter your city"
                />
              </div>
              {profileErrors.location && (
                <p className="mt-1.5 text-sm text-red-600">{profileErrors.location.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProfileSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProfileSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : profileSaved ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-500">
                Update your password to keep your account secure
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...registerPassword('currentPassword')}
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="mt-1.5 text-sm text-red-600">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...registerPassword('newPassword')}
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    passwordErrors.newPassword ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="mt-1.5 text-sm text-red-600">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...registerPassword('confirmPassword')}
                  type="password"
                  id="confirmPassword"
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Confirm new password"
                />
              </div>
              {passwordErrors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPasswordSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPasswordSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}



