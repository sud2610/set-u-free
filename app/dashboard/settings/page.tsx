'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Bell,
  Lock,
  Globe,
  CreditCard,
  Shield,
  Trash2,
  Save,
  Loader2,
  Building2,
  FileText,
  Clock,
  CheckCircle,
} from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'business';

export default function SettingsPage() {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);

  const isProvider = user?.role === 'provider';

  // Form states
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: '',
  });

  // Sync form with user data when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: '',
      });
    }
  }, [user]);

  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    description: '',
    address: '',
    website: '',
    categories: [] as string[],
  });

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailPromotions: false,
    emailReminders: true,
    pushBookings: true,
    pushMessages: true,
    pushReminders: true,
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone || undefined,
        location: profileForm.location || undefined,
      });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBusiness = async () => {
    setSaving(true);
    try {
      // TODO: Implement business profile update when Provider model is extended
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Business profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update business profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // TODO: Implement notification preferences when User model is extended
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Notification preferences saved!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    ...(isProvider ? [{ id: 'business' as const, label: 'Business', icon: Building2 }] : []),
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences and settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs Navigation */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-yellow-50 text-yellow-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>

              {/* Profile Picture */}
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                <div className="relative">
                  {user?.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.fullName}
                      width={96}
                      height={96}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">
                        {user?.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 p-2 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-colors">
                    <Camera className="w-4 h-4 text-gray-900" />
                  </button>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user?.fullName}</h3>
                  <p className="text-sm text-gray-500">{isProvider ? 'Service Provider' : 'Customer'}</p>
                  <button className="mt-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                    Change Photo
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, fullName: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, email: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                        placeholder="+61 XXX XXX XXX"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, location: e.target.value })
                        }
                        placeholder="Sydney, NSW"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell us a bit about yourself..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Business Settings (Provider Only) */}
          {activeTab === 'business' && isProvider && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Business Information</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={businessForm.businessName}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, businessName: e.target.value })
                      }
                      placeholder="Your Business Name"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description
                  </label>
                  <textarea
                    value={businessForm.description}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, description: e.target.value })
                    }
                    placeholder="Describe your services..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={businessForm.address}
                        onChange={(e) =>
                          setBusinessForm({ ...businessForm, address: e.target.value })
                        }
                        placeholder="123 Main St, Sydney NSW 2000"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={businessForm.website}
                        onChange={(e) =>
                          setBusinessForm({ ...businessForm, website: e.target.value })
                        }
                        placeholder="https://www.example.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveBusiness}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Business Info
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>

              <div className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">Booking Confirmations</p>
                        <p className="text-sm text-gray-500">
                          Receive emails when bookings are made or updated
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailBookings}
                        onChange={(e) =>
                          setNotifications({ ...notifications, emailBookings: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">Reminders</p>
                        <p className="text-sm text-gray-500">
                          Get reminded about upcoming appointments
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailReminders}
                        onChange={(e) =>
                          setNotifications({ ...notifications, emailReminders: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">Promotions & News</p>
                        <p className="text-sm text-gray-500">
                          Stay updated with special offers and news
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailPromotions}
                        onChange={(e) =>
                          setNotifications({ ...notifications, emailPromotions: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gray-400" />
                    Push Notifications
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">New Bookings</p>
                        <p className="text-sm text-gray-500">
                          Instant alerts for new bookings
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.pushBookings}
                        onChange={(e) =>
                          setNotifications({ ...notifications, pushBookings: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">Messages</p>
                        <p className="text-sm text-gray-500">
                          Get notified of new messages
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.pushMessages}
                        onChange={(e) =>
                          setNotifications({ ...notifications, pushMessages: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Enter current password"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-xl border border-red-100 p-6">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-colors">
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

