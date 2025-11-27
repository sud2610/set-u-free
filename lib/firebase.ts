import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// ==================== FIREBASE CONFIGURATION ====================

/**
 * Firebase configuration object
 * Values are loaded from environment variables
 * 
 * Setup Instructions:
 * 1. Go to Firebase Console: https://console.firebase.google.com
 * 2. Create a new project or select existing one
 * 3. Go to Project Settings > General > Your apps
 * 4. Register a web app and copy the config
 * 5. Add values to .env.local file
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ==================== VALIDATION ====================

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}

/**
 * Validate that all required Firebase config values are present
 */
function validateConfig(): boolean {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingKeys = requiredKeys.filter(
    (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
  );

  if (missingKeys.length > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `⚠️ Missing Firebase config keys: ${missingKeys.join(', ')}\n` +
        'Please check your .env.local file and ensure all Firebase environment variables are set.\n' +
        'See .env.local.example for reference.'
      );
    }
    return false;
  }
  return true;
}

// ==================== INITIALIZATION ====================

// Track if config is valid
const isConfigValid = validateConfig();

/**
 * Initialize Firebase app
 * Uses singleton pattern to prevent multiple initializations
 * Returns null if configuration is invalid
 */
function initializeFirebaseApp(): FirebaseApp | null {
  // Don't initialize if config is invalid
  if (!isConfigValid) {
    return null;
  }

  // Check if Firebase app is already initialized
  if (getApps().length > 0) {
    return getApp();
  }

  // Initialize new Firebase app
  return initializeApp(firebaseConfig);
}

// Initialize Firebase app (may be null if not configured)
const app = initializeFirebaseApp();

// ==================== FIREBASE SERVICES ====================

/**
 * Firebase Authentication instance
 * Used for user authentication (email/password, Google, etc.)
 * Returns null if Firebase is not configured
 */
export const auth: Auth | null = app ? getAuth(app) : null;

/**
 * Firestore Database instance
 * Used for storing and querying application data
 * Returns null if Firebase is not configured
 */
export const db: Firestore | null = app ? getFirestore(app) : null;

/**
 * Firebase Storage instance
 * Used for storing files (images, documents, etc.)
 * Returns null if Firebase is not configured
 */
export const storage: FirebaseStorage | null = app ? getStorage(app) : null;

/**
 * Firebase Analytics instance
 * Only initialized on client-side (not available during SSR)
 */
let analytics: Analytics | null = null;

/**
 * Initialize Firebase Analytics (client-side only)
 */
export async function initializeAnalytics(): Promise<Analytics | null> {
  if (typeof window !== 'undefined' && !analytics && app) {
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
    }
  }
  return analytics;
}

/**
 * Get Firebase Analytics instance
 */
export function getAnalyticsInstance(): Analytics | null {
  return analytics;
}

// ==================== EXPORTS ====================

// Export Firebase app instance (may be null)
export { app };

// Export Firebase config (for debugging purposes)
export const getFirebaseConfig = () => ({
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  // Don't expose sensitive keys
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Get current Firebase project ID
 */
export function getProjectId(): string | undefined {
  return firebaseConfig.projectId;
}

/**
 * Check if Firebase services are available
 * Use this before accessing auth, db, or storage
 */
export function isFirebaseReady(): boolean {
  return app !== null && auth !== null && db !== null;
}

// ==================== TYPE EXPORTS ====================

export type { FirebaseApp, Auth, Firestore, FirebaseStorage, Analytics };
