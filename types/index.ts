// ==================== USER ====================
export interface User {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'provider' | 'admin';
  location: string;
  profileImage?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== PROVIDER ====================
export interface Provider {
  uid: string;
  businessName: string;
  description: string;
  categories: string[];
  location: string;
  city: string;
  bio: string;
  profileImage?: string;
  rating: number; // 0-5
  reviewCount: number;
  verified: boolean;
  consultationSlots: TimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== SERVICE ====================
export interface Service {
  id: string;
  providerId: string;
  category: string;
  title: string;
  description: string;
  duration: number; // in minutes
  images: string[];
  createdAt: Date;
}

// ==================== BOOKING ====================
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  providerId: string;
  serviceId: string;
  status: BookingStatus;
  dateTime: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== REVIEW ====================
export interface Review {
  id: string;
  userId: string;
  providerId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

// ==================== TIME SLOT ====================
export interface TimeSlot {
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  available: boolean;
}

// ==================== SEARCH FILTER ====================
export interface SearchFilter {
  category?: string;
  city?: string;
  searchQuery?: string;
  rating?: number;
}

// ==================== EXTENDED TYPES ====================
// These are helper types for combining data from multiple collections

export interface ProviderWithUser extends Provider {
  user: User;
}

export interface BookingWithDetails extends Booking {
  user: User;
  provider: Provider;
  service: Service;
}

export interface ReviewWithUser extends Review {
  user: User;
}

export interface ServiceWithProvider extends Service {
  provider: Provider;
}

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==================== FORM DATA TYPES ====================
export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'customer' | 'provider';
  location: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface BookingFormData {
  serviceId: string;
  providerId: string;
  dateTime: Date;
  notes?: string;
}

export interface ReviewFormData {
  providerId: string;
  rating: number;
  comment: string;
}

export interface ServiceFormData {
  category: string;
  title: string;
  description: string;
  duration: number;
  images: string[];
}

// ==================== CATEGORY TYPE ====================
export type ServiceCategory =
  | 'recruitment-agencies'
  | 'migration-visa'
  | 'beauty'
  | 'dentist'
  | 'eye-care'
  | 'doctors'
  | 'mental-health'
  | 'nutrition'
  | 'physiotherapy'
  | 'legal-services';

export interface CategoryInfo {
  id: ServiceCategory;
  name: string;
  description: string;
  icon: string;
  image: string;
}

// ==================== DASHBOARD STATS ====================
export interface UserDashboardStats {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalReviews: number;
}

export interface ProviderDashboardStats {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
}

// ==================== ADMIN DASHBOARD STATS ====================
export interface AdminDashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalCustomers: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingVerifications: number;
  verifiedProviders: number;
  totalServices: number;
  totalReviews: number;
  recentUsers: User[];
  recentBookings: BookingWithDetails[];
}
