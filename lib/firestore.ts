import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  User,
  Provider,
  Service,
  Booking,
  Review,
  BookingStatus,
  SearchFilter,
} from '@/types';

// ==================== COLLECTION REFERENCES ====================

const COLLECTIONS = {
  users: 'users',
  providers: 'providers',
  services: 'services',
  bookings: 'bookings',
  reviews: 'reviews',
} as const;

// ==================== HELPER FUNCTIONS ====================

/**
 * Asserts that Firestore is initialized
 */
function assertDbInitialized(): void {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
}

/**
 * Converts Firestore Timestamp to JavaScript Date
 */
function convertTimestamp(timestamp: Timestamp | undefined): Date {
  return timestamp?.toDate() || new Date();
}

/**
 * Handles Firestore errors and throws meaningful messages
 */
function handleFirestoreError(error: unknown, operation: string): never {
  console.error(`Firestore ${operation} error:`, error);
  
  if (error instanceof Error) {
    throw new Error(`${operation} failed: ${error.message}`);
  }
  throw new Error(`${operation} failed: Unknown error occurred`);
}

// ============================================================
// USER FUNCTIONS
// ============================================================

/**
 * Creates a new user document in Firestore
 * @param uid - Firebase Auth user ID
 * @param userData - User data without uid and timestamps
 * @returns Created user object
 */
export async function createUser(
  uid: string,
  userData: Omit<User, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<User> {
  assertDbInitialized();
  try {
    const userRef = doc(db!, COLLECTIONS.users, uid);
    
    const userDoc = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, userDoc);

    console.log('User created successfully:', uid);
    
    return {
      ...userData,
      uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    handleFirestoreError(error, 'createUser');
  }
}

/**
 * Fetches a user document by UID
 * @param uid - User's UID
 * @returns User object or null if not found
 */
export async function getUser(uid: string): Promise<User | null> {
  try {
    const userRef = doc(db!, COLLECTIONS.users, uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log('User not found:', uid);
      return null;
    }

    const data = userSnap.data();
    
    return {
      ...data,
      uid: userSnap.id,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as User;
  } catch (error) {
    handleFirestoreError(error, 'getUser');
  }
}

/**
 * Updates a user's profile data
 * @param uid - User's UID
 * @param data - Partial user data to update
 */
export async function updateUser(
  uid: string,
  data: Partial<Omit<User, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const userRef = doc(db!, COLLECTIONS.users, uid);
    
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    console.log('User updated successfully:', uid);
  } catch (error) {
    handleFirestoreError(error, 'updateUser');
  }
}

/**
 * Deletes a user document
 * @param uid - User's UID
 */
export async function deleteUser(uid: string): Promise<void> {
  try {
    const userRef = doc(db!, COLLECTIONS.users, uid);
    await deleteDoc(userRef);
    
    console.log('User deleted successfully:', uid);
  } catch (error) {
    handleFirestoreError(error, 'deleteUser');
  }
}

// ============================================================
// PROVIDER FUNCTIONS
// ============================================================

/**
 * Creates a new provider profile
 * @param uid - Provider's UID (same as user UID)
 * @param providerData - Provider data without uid and timestamps
 * @returns Created provider object
 */
export async function createProvider(
  uid: string,
  providerData: Omit<Provider, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<Provider> {
  try {
    const providerRef = doc(db!, COLLECTIONS.providers, uid);
    
    const providerDoc = {
      ...providerData,
      rating: providerData.rating || 0,
      reviewCount: providerData.reviewCount || 0,
      verified: providerData.verified || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(providerRef, providerDoc);

    console.log('Provider created successfully:', uid);
    
    return {
      ...providerData,
      uid,
      rating: providerDoc.rating,
      reviewCount: providerDoc.reviewCount,
      verified: providerDoc.verified,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    handleFirestoreError(error, 'createProvider');
  }
}

/**
 * Fetches a provider document by UID
 * @param uid - Provider's UID
 * @returns Provider object or null if not found
 */
export async function getProvider(uid: string): Promise<Provider | null> {
  try {
    const providerRef = doc(db!, COLLECTIONS.providers, uid);
    const providerSnap = await getDoc(providerRef);

    if (!providerSnap.exists()) {
      console.log('Provider not found:', uid);
      return null;
    }

    const data = providerSnap.data();
    
    return {
      ...data,
      uid: providerSnap.id,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as Provider;
  } catch (error) {
    handleFirestoreError(error, 'getProvider');
  }
}

/**
 * Updates a provider's profile data
 * @param uid - Provider's UID
 * @param data - Partial provider data to update
 */
export async function updateProvider(
  uid: string,
  data: Partial<Omit<Provider, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const providerRef = doc(db!, COLLECTIONS.providers, uid);
    
    await updateDoc(providerRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    console.log('Provider updated successfully:', uid);
  } catch (error) {
    handleFirestoreError(error, 'updateProvider');
  }
}

/**
 * Fetches all providers in a specific city
 * @param city - City name to filter by
 * @returns Array of providers in the city
 */
export async function getProvidersByCity(city: string): Promise<Provider[]> {
  try {
    const providersRef = collection(db!, COLLECTIONS.providers);
    const q = query(
      providersRef,
      where('city', '==', city),
      orderBy('rating', 'desc')
    );

    const querySnap = await getDocs(q);
    
    const providers: Provider[] = querySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Provider;
    });

    console.log(`Found ${providers.length} providers in ${city}`);
    return providers;
  } catch (error) {
    handleFirestoreError(error, 'getProvidersByCity');
  }
}

/**
 * Fetches all providers in a specific category
 * @param category - Service category to filter by
 * @returns Array of providers in the category
 */
export async function getProvidersByCategory(category: string): Promise<Provider[]> {
  try {
    const providersRef = collection(db!, COLLECTIONS.providers);
    const q = query(
      providersRef,
      where('categories', 'array-contains', category),
      orderBy('rating', 'desc')
    );

    const querySnap = await getDocs(q);
    
    const providers: Provider[] = querySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Provider;
    });

    console.log(`Found ${providers.length} providers in category: ${category}`);
    return providers;
  } catch (error) {
    handleFirestoreError(error, 'getProvidersByCategory');
  }
}

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

/**
 * Creates a new service for a provider
 * @param providerId - Provider's UID
 * @param serviceData - Service data without id and createdAt
 * @returns Created service object with generated ID
 */
export async function createService(
  providerId: string,
  serviceData: Omit<Service, 'id' | 'providerId' | 'createdAt'>
): Promise<Service> {
  try {
    const servicesRef = collection(db!, COLLECTIONS.services);
    
    const serviceDoc = {
      ...serviceData,
      providerId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(servicesRef, serviceDoc);

    console.log('Service created successfully:', docRef.id);
    
    return {
      ...serviceData,
      id: docRef.id,
      providerId,
      createdAt: new Date(),
    };
  } catch (error) {
    handleFirestoreError(error, 'createService');
  }
}

/**
 * Fetches all services for a provider
 * @param providerId - Provider's UID
 * @returns Array of services
 */
export async function getServices(providerId: string): Promise<Service[]> {
  try {
    const servicesRef = collection(db!, COLLECTIONS.services);
    const q = query(
      servicesRef,
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );

    const querySnap = await getDocs(q);
    
    const services: Service[] = querySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
      } as Service;
    });

    console.log(`Found ${services.length} services for provider: ${providerId}`);
    return services;
  } catch (error) {
    handleFirestoreError(error, 'getServices');
  }
}

/**
 * Fetches a single service by ID
 * @param serviceId - Service document ID
 * @returns Service object or null if not found
 */
export async function getService(serviceId: string): Promise<Service | null> {
  try {
    const serviceRef = doc(db!, COLLECTIONS.services, serviceId);
    const serviceSnap = await getDoc(serviceRef);

    if (!serviceSnap.exists()) {
      console.log('Service not found:', serviceId);
      return null;
    }

    const data = serviceSnap.data();
    
    return {
      ...data,
      id: serviceSnap.id,
      createdAt: convertTimestamp(data.createdAt),
    } as Service;
  } catch (error) {
    handleFirestoreError(error, 'getService');
  }
}

/**
 * Updates a service's data
 * @param serviceId - Service document ID
 * @param data - Partial service data to update
 */
export async function updateService(
  serviceId: string,
  data: Partial<Omit<Service, 'id' | 'providerId' | 'createdAt'>>
): Promise<void> {
  try {
    const serviceRef = doc(db!, COLLECTIONS.services, serviceId);
    await updateDoc(serviceRef, data);

    console.log('Service updated successfully:', serviceId);
  } catch (error) {
    handleFirestoreError(error, 'updateService');
  }
}

/**
 * Deletes a service
 * @param serviceId - Service document ID
 */
export async function deleteService(serviceId: string): Promise<void> {
  try {
    const serviceRef = doc(db!, COLLECTIONS.services, serviceId);
    await deleteDoc(serviceRef);
    
    console.log('Service deleted successfully:', serviceId);
  } catch (error) {
    handleFirestoreError(error, 'deleteService');
  }
}

// ============================================================
// BOOKING FUNCTIONS
// ============================================================

/**
 * Creates a new booking
 * @param bookingData - Booking data without id and timestamps
 * @returns Created booking object with generated ID
 */
export async function createBooking(
  bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Booking> {
  try {
    const bookingsRef = collection(db!, COLLECTIONS.bookings);
    
    const bookingDoc = {
      ...bookingData,
      status: bookingData.status || 'pending',
      dateTime: Timestamp.fromDate(
        bookingData.dateTime instanceof Date 
          ? bookingData.dateTime 
          : new Date(bookingData.dateTime)
      ),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(bookingsRef, bookingDoc);

    console.log('Booking created successfully:', docRef.id);
    
    return {
      ...bookingData,
      id: docRef.id,
      status: bookingDoc.status as BookingStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    handleFirestoreError(error, 'createBooking');
  }
}

/**
 * Fetches a single booking by ID
 * @param bookingId - Booking document ID
 * @returns Booking object or null if not found
 */
export async function getBooking(bookingId: string): Promise<Booking | null> {
  try {
    const bookingRef = doc(db!, COLLECTIONS.bookings, bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      console.log('Booking not found:', bookingId);
      return null;
    }

    const data = bookingSnap.data();
    
    return {
      ...data,
      id: bookingSnap.id,
      dateTime: convertTimestamp(data.dateTime),
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as Booking;
  } catch (error) {
    handleFirestoreError(error, 'getBooking');
  }
}

/**
 * Fetches all bookings for a user (customer)
 * @param userId - User's UID
 * @returns Array of bookings sorted by date
 */
export async function getBookings(userId: string): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db!, COLLECTIONS.bookings);
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      orderBy('dateTime', 'desc')
    );

    const querySnap = await getDocs(q);
    
    const bookings: Booking[] = querySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        dateTime: convertTimestamp(data.dateTime),
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Booking;
    });

    console.log(`Found ${bookings.length} bookings for user: ${userId}`);
    return bookings;
  } catch (error) {
    handleFirestoreError(error, 'getBookings');
  }
}

/**
 * Fetches all bookings for a provider
 * @param providerId - Provider's UID
 * @returns Array of bookings sorted by date
 */
export async function getProviderBookings(providerId: string): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db!, COLLECTIONS.bookings);
    const q = query(
      bookingsRef,
      where('providerId', '==', providerId),
      orderBy('dateTime', 'desc')
    );

    const querySnap = await getDocs(q);
    
    const bookings: Booking[] = querySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        dateTime: convertTimestamp(data.dateTime),
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Booking;
    });

    console.log(`Found ${bookings.length} bookings for provider: ${providerId}`);
    return bookings;
  } catch (error) {
    handleFirestoreError(error, 'getProviderBookings');
  }
}

/**
 * Updates a booking's status
 * @param bookingId - Booking document ID
 * @param status - New booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<void> {
  try {
    const bookingRef = doc(db!, COLLECTIONS.bookings, bookingId);
    
    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    console.log(`Booking ${bookingId} status updated to: ${status}`);
  } catch (error) {
    handleFirestoreError(error, 'updateBookingStatus');
  }
}

/**
 * Cancels a booking (sets status to 'cancelled')
 * @param bookingId - Booking document ID
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  try {
    await updateBookingStatus(bookingId, 'cancelled');
    console.log('Booking cancelled successfully:', bookingId);
  } catch (error) {
    handleFirestoreError(error, 'cancelBooking');
  }
}

// ============================================================
// REVIEW FUNCTIONS
// ============================================================

/**
 * Creates a new review and updates provider's rating
 * @param reviewData - Review data without id and createdAt
 * @returns Created review object with generated ID
 */
export async function createReview(
  reviewData: Omit<Review, 'id' | 'createdAt'>
): Promise<Review> {
  try {
    const reviewsRef = collection(db!, COLLECTIONS.reviews);
    
    const reviewDoc = {
      ...reviewData,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(reviewsRef, reviewDoc);

    console.log('Review created successfully:', docRef.id);

    // Update provider's rating and review count
    await updateProviderRating(reviewData.providerId);
    
    return {
      ...reviewData,
      id: docRef.id,
      createdAt: new Date(),
    };
  } catch (error) {
    handleFirestoreError(error, 'createReview');
  }
}

/**
 * Fetches all reviews for a provider
 * @param providerId - Provider's UID
 * @returns Array of reviews sorted by date
 */
export async function getProviderReviews(providerId: string): Promise<Review[]> {
  try {
    const reviewsRef = collection(db!, COLLECTIONS.reviews);
    const q = query(
      reviewsRef,
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );

    const querySnap = await getDocs(q);
    
    const reviews: Review[] = querySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
      } as Review;
    });

    console.log(`Found ${reviews.length} reviews for provider: ${providerId}`);
    return reviews;
  } catch (error) {
    handleFirestoreError(error, 'getProviderReviews');
  }
}

/**
 * Calculates and returns the average rating for a provider
 * @param providerId - Provider's UID
 * @returns Average rating (0-5) or 0 if no reviews
 */
export async function getAverageRating(providerId: string): Promise<number> {
  try {
    const reviews = await getProviderReviews(providerId);
    
    if (reviews.length === 0) {
      return 0;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Round to 1 decimal place
    return Math.round(averageRating * 10) / 10;
  } catch (error) {
    handleFirestoreError(error, 'getAverageRating');
  }
}

/**
 * Updates a provider's rating and review count based on all reviews
 * Called internally after creating a new review
 * @param providerId - Provider's UID
 */
async function updateProviderRating(providerId: string): Promise<void> {
  try {
    const reviews = await getProviderReviews(providerId);
    const reviewCount = reviews.length;
    
    let rating = 0;
    if (reviewCount > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      rating = Math.round((totalRating / reviewCount) * 10) / 10;
    }

    await updateProvider(providerId, { rating, reviewCount });
    
    console.log(`Provider ${providerId} rating updated: ${rating} (${reviewCount} reviews)`);
  } catch (error) {
    console.error('Failed to update provider rating:', error);
    // Don't throw - this is a secondary operation
  }
}

// ============================================================
// SEARCH FUNCTIONS
// ============================================================

/**
 * Searches providers with multiple filters
 * @param filters - Search filters (category, city, searchQuery, rating)
 * @returns Array of matching providers
 */
export async function searchProviders(filters: SearchFilter): Promise<Provider[]> {
  try {
    const providersRef = collection(db!, COLLECTIONS.providers);
    const constraints: QueryConstraint[] = [];

    // Filter by city
    if (filters.city) {
      constraints.push(where('city', '==', filters.city));
    }

    // Filter by category
    if (filters.category) {
      constraints.push(where('categories', 'array-contains', filters.category));
    }

    // Filter by minimum rating
    if (filters.rating && filters.rating > 0) {
      constraints.push(where('rating', '>=', filters.rating));
    }

    // Always sort by rating
    constraints.push(orderBy('rating', 'desc'));
    
    // Limit results
    constraints.push(limit(50));

    const q = query(providersRef, ...constraints);
    const querySnap = await getDocs(q);
    
    let providers: Provider[] = querySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Provider;
    });

    // Client-side text search (Firestore doesn't support full-text search)
    // For production, consider using Algolia or Elasticsearch
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      providers = providers.filter(
        (provider) =>
          provider.businessName.toLowerCase().includes(searchLower) ||
          provider.description.toLowerCase().includes(searchLower) ||
          provider.bio.toLowerCase().includes(searchLower) ||
          provider.categories.some((cat) => cat.toLowerCase().includes(searchLower))
      );
    }

    console.log(`Search found ${providers.length} providers`);
    return providers;
  } catch (error) {
    handleFirestoreError(error, 'searchProviders');
  }
}

/**
 * Gets all unique service categories from providers
 * @returns Array of unique category strings
 */
export async function getAllCategories(): Promise<string[]> {
  try {
    const providersRef = collection(db!, COLLECTIONS.providers);
    const querySnap = await getDocs(providersRef);
    
    const categoriesSet = new Set<string>();
    
    querySnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.categories && Array.isArray(data.categories)) {
        data.categories.forEach((category: string) => {
          categoriesSet.add(category);
        });
      }
    });

    const categories = Array.from(categoriesSet).sort();
    
    console.log(`Found ${categories.length} unique categories`);
    return categories;
  } catch (error) {
    handleFirestoreError(error, 'getAllCategories');
  }
}

/**
 * Gets all unique cities where providers are located
 * @returns Array of unique city strings
 */
export async function getAllCities(): Promise<string[]> {
  try {
    const providersRef = collection(db!, COLLECTIONS.providers);
    const querySnap = await getDocs(providersRef);
    
    const citiesSet = new Set<string>();
    
    querySnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.city) {
        citiesSet.add(data.city);
      }
    });

    const cities = Array.from(citiesSet).sort();
    
    console.log(`Found ${cities.length} unique cities`);
    return cities;
  } catch (error) {
    handleFirestoreError(error, 'getAllCities');
  }
}

// ============================================================
// ADDITIONAL UTILITY FUNCTIONS
// ============================================================

/**
 * Gets featured/top-rated providers
 * @param limitCount - Maximum number of providers to return
 * @returns Array of top-rated providers
 */
export async function getFeaturedProviders(limitCount: number = 6): Promise<Provider[]> {
  try {
    const providersRef = collection(db!, COLLECTIONS.providers);
    const q = query(
      providersRef,
      where('verified', '==', true),
      orderBy('rating', 'desc'),
      limit(limitCount)
    );

    const querySnap = await getDocs(q);
    
    const providers: Provider[] = querySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Provider;
    });

    console.log(`Found ${providers.length} featured providers`);
    return providers;
  } catch (error) {
    handleFirestoreError(error, 'getFeaturedProviders');
  }
}

/**
 * Gets bookings by status for a user
 * @param userId - User's UID
 * @param status - Booking status to filter by
 * @returns Array of bookings with the specified status
 */
export async function getBookingsByStatus(
  userId: string,
  status: BookingStatus
): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db!, COLLECTIONS.bookings);
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      where('status', '==', status),
      orderBy('dateTime', 'desc')
    );

    const querySnap = await getDocs(q);
    
    const bookings: Booking[] = querySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        dateTime: convertTimestamp(data.dateTime),
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Booking;
    });

    return bookings;
  } catch (error) {
    handleFirestoreError(error, 'getBookingsByStatus');
  }
}

/**
 * Gets all services in a specific category
 * @param category - Service category
 * @returns Array of services in the category
 */
export async function getServicesByCategory(category: string): Promise<Service[]> {
  try {
    const servicesRef = collection(db!, COLLECTIONS.services);
    const q = query(
      servicesRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );

    const querySnap = await getDocs(q);
    
    const services: Service[] = querySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
      } as Service;
    });

    console.log(`Found ${services.length} services in category: ${category}`);
    return services;
  } catch (error) {
    handleFirestoreError(error, 'getServicesByCategory');
  }
}
