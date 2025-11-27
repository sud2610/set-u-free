'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import type { User } from '@/types';

// ==================== TYPES ====================

/**
 * Shape of the authentication context
 * Provides user state and authentication methods
 */
interface AuthContextType {
  /** Current authenticated user data from Firestore, null if not logged in */
  user: User | null;
  /** True while checking auth state or performing auth operations */
  loading: boolean;
  /** Error message from last failed operation, null if no error */
  error: string | null;
  /** Whether Firebase is properly configured */
  isConfigured: boolean;
  /** Sign in with email and password */
  login: (email: string, password: string) => Promise<void>;
  /** Create new account with email, password and user data */
  register: (
    email: string,
    password: string,
    userData: Omit<User, 'uid' | 'email' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  /** Sign out current user */
  logout: () => Promise<void>;
  /** Sign in with Google OAuth */
  signInWithGoogle: () => Promise<void>;
  /** Clear any existing error */
  clearError: () => void;
}

// ==================== CONTEXT CREATION ====================

/**
 * Default context values
 * Used when context is accessed outside of AuthProvider
 */
const defaultContextValue: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  isConfigured: false,
  login: async () => {
    throw new Error('AuthContext not initialized');
  },
  register: async () => {
    throw new Error('AuthContext not initialized');
  },
  logout: async () => {
    throw new Error('AuthContext not initialized');
  },
  signInWithGoogle: async () => {
    throw new Error('AuthContext not initialized');
  },
  clearError: () => {},
};

/**
 * Authentication context
 * Provides user state and auth methods throughout the app
 */
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// ==================== HELPER FUNCTIONS ====================

/**
 * Fetches user document from Firestore
 * @param uid - Firebase Auth user ID
 * @returns User data or null if not found
 */
async function fetchUserFromFirestore(uid: string): Promise<User | null> {
  if (!db) {
    console.warn('Firestore is not configured');
    return null;
  }
  
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.warn(`User document not found for uid: ${uid}`);
      return null;
    }

    const data = userDoc.data();
    
    // Convert Firestore timestamps to Date objects
    return {
      ...data,
      uid: userDoc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as User;
  } catch (error) {
    console.error('Error fetching user from Firestore:', error);
    throw error;
  }
}

/**
 * Creates a new user document in Firestore
 * @param uid - Firebase Auth user ID
 * @param email - User's email address
 * @param userData - Additional user data
 */
async function createUserInFirestore(
  uid: string,
  email: string,
  userData: Omit<User, 'uid' | 'email' | 'createdAt' | 'updatedAt'>
): Promise<User> {
  if (!db) {
    throw new Error('Firestore is not configured');
  }
  
  const userDocRef = doc(db, 'users', uid);
  
  const newUser = {
    ...userData,
    email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userDocRef, newUser);

  // Return the user object with proper dates
  return {
    ...userData,
    uid,
    email,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Maps Firebase Auth error codes to user-friendly messages
 * @param errorCode - Firebase error code
 * @returns Human-readable error message
 */
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please register first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/popup-blocked': 'Pop-up was blocked. Please allow pop-ups and try again.',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
}

// ==================== AUTH PROVIDER COMPONENT ====================

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * 
 * Wraps the app and provides authentication state and methods.
 * 
 * Flow:
 * 1. On mount, sets up Firebase auth state listener
 * 2. When auth state changes (login/logout), updates local state
 * 3. If user is authenticated, fetches their profile from Firestore
 * 4. Provides auth methods (login, register, logout, Google sign-in)
 * 5. Handles loading and error states for all operations
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // ==================== STATE ====================
  
  /** Current user data from Firestore */
  const [user, setUser] = useState<User | null>(null);
  
  /** Loading state - true during auth operations */
  const [loading, setLoading] = useState<boolean>(true);
  
  /** Error message from last failed operation */
  const [error, setError] = useState<string | null>(null);
  
  /** Whether Firebase is properly configured */
  const isConfigured = isFirebaseConfigured();

  // ==================== AUTH STATE LISTENER ====================

  /**
   * Effect: Listen to Firebase Auth state changes
   * 
   * This is the core of auth persistence:
   * - Runs once on mount
   * - Firebase persists auth state in localStorage/IndexedDB
   * - onAuthStateChanged fires immediately with cached state
   * - Also fires whenever user signs in/out
   */
  useEffect(() => {
    // If Firebase is not configured, skip auth listener setup
    if (!auth) {
      console.warn('Firebase Auth is not configured. Skipping auth listener.');
      setLoading(false);
      return;
    }
    
    console.log('Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        console.log('Auth state changed:', firebaseUser?.uid || 'No user');
        
        try {
          if (firebaseUser) {
            // User is signed in - fetch their profile from Firestore
            const userData = await fetchUserFromFirestore(firebaseUser.uid);
            
            if (userData) {
              setUser(userData);
              console.log('User data loaded:', userData.fullName);
            } else {
              // Edge case: Auth exists but no Firestore doc
              // This can happen if registration failed midway
              console.warn('Auth user exists but no Firestore profile');
              setUser(null);
            }
          } else {
            // User is signed out
            setUser(null);
            console.log('User signed out');
          }
        } catch (err) {
          console.error('Error in auth state handler:', err);
          setError('Failed to load user profile');
          setUser(null);
        } finally {
          // Always set loading to false after initial check
          setLoading(false);
        }
      },
      (err) => {
        // Handle auth state listener errors
        console.error('Auth state listener error:', err);
        setError('Authentication service error');
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe when component unmounts
    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // ==================== AUTH METHODS ====================

  /**
   * Sign in with email and password
   * 
   * Flow:
   * 1. Validate inputs
   * 2. Call Firebase signInWithEmailAndPassword
   * 3. onAuthStateChanged listener handles the rest
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    console.log('Attempting login for:', email);
    
    // Clear any previous errors
    setError(null);
    setLoading(true);

    try {
      // Check if Firebase is configured
      if (!auth) {
        throw new Error('Firebase is not configured. Please check your environment variables.');
      }
      
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      
      // Note: We don't need to setUser here
      // The onAuthStateChanged listener will handle it
      console.log('Login successful');
      
    } catch (err: any) {
      console.error('Login error:', err);
      const message = getAuthErrorMessage(err.code) || err.message;
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register a new user
   * 
   * Flow:
   * 1. Validate inputs
   * 2. Create Firebase Auth account
   * 3. Create user profile in Firestore
   * 4. onAuthStateChanged listener updates state
   */
  const register = useCallback(async (
    email: string,
    password: string,
    userData: Omit<User, 'uid' | 'email' | 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    console.log('Attempting registration for:', email);
    
    setError(null);
    setLoading(true);

    try {
      // Check if Firebase is configured
      if (!auth) {
        throw new Error('Firebase is not configured. Please check your environment variables.');
      }
      
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      if (!userData.fullName) {
        throw new Error('Full name is required');
      }

      // Step 1: Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;
      console.log('Firebase Auth account created:', uid);

      // Step 2: Create user profile in Firestore
      const newUser = await createUserInFirestore(uid, email, userData);
      console.log('Firestore profile created');

      // Step 3: Update local state immediately
      // (onAuthStateChanged will also fire, but this ensures immediate UI update)
      setUser(newUser);
      
      console.log('Registration complete');
      
    } catch (err: any) {
      console.error('Registration error:', err);
      const message = getAuthErrorMessage(err.code) || err.message;
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out current user
   * 
   * Flow:
   * 1. Call Firebase signOut
   * 2. onAuthStateChanged listener clears user state
   */
  const logout = useCallback(async (): Promise<void> => {
    console.log('Attempting logout');
    
    setError(null);
    setLoading(true);

    try {
      // Check if Firebase is configured
      if (!auth) {
        throw new Error('Firebase is not configured.');
      }
      
      await firebaseSignOut(auth);
      
      // Note: onAuthStateChanged will set user to null
      console.log('Logout successful');
      
    } catch (err: any) {
      console.error('Logout error:', err);
      const message = err.message || 'Failed to sign out';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign in with Google OAuth
   * 
   * Flow:
   * 1. Open Google sign-in popup
   * 2. On success, check if user exists in Firestore
   * 3. If new user, create Firestore profile
   * 4. onAuthStateChanged listener updates state
   */
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    console.log('Attempting Google sign-in');
    
    setError(null);
    setLoading(true);

    try {
      // Check if Firebase is configured
      if (!auth) {
        throw new Error('Firebase is not configured. Please check your environment variables.');
      }
      
      const provider = new GoogleAuthProvider();
      
      // Add scopes for additional user info
      provider.addScope('profile');
      provider.addScope('email');

      // Open Google sign-in popup
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      console.log('Google sign-in successful:', firebaseUser.uid);

      // Check if user already exists in Firestore
      const existingUser = await fetchUserFromFirestore(firebaseUser.uid);

      if (!existingUser) {
        // New user - create Firestore profile
        console.log('Creating new user profile for Google user');
        
        const newUserData: Omit<User, 'uid' | 'email' | 'createdAt' | 'updatedAt'> = {
          fullName: firebaseUser.displayName || 'User',
          role: 'customer', // Default role for Google sign-in
          location: '',
          profileImage: firebaseUser.photoURL || undefined,
          phone: firebaseUser.phoneNumber || undefined,
        };

        const newUser = await createUserInFirestore(
          firebaseUser.uid,
          firebaseUser.email!,
          newUserData
        );
        
        setUser(newUser);
      }
      // If user exists, onAuthStateChanged will handle setting the user
      
      console.log('Google sign-in complete');
      
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      const message = getAuthErrorMessage(err.code) || err.message;
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear any existing error message
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // ==================== CONTEXT VALUE ====================

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    isConfigured,
    login,
    register,
    logout,
    signInWithGoogle,
    clearError,
  };

  // ==================== RENDER ====================

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ==================== CUSTOM HOOK ====================

/**
 * Custom hook to access authentication context
 * 
 * Usage:
 * ```tsx
 * const { user, login, logout, loading, error } = useAuth();
 * ```
 * 
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType with user state and auth methods
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Make sure your component is wrapped in <AuthProvider>.'
    );
  }
  
  return context;
}

// ==================== EXPORTS ====================

export { AuthContext };
export type { AuthContextType };
