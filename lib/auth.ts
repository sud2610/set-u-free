import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User } from '@/types';

// Helper to check Firebase is initialized
function assertFirebaseInitialized(): void {
  if (!auth) {
    throw new Error('Firebase auth is not initialized');
  }
  if (!db) {
    throw new Error('Firebase Firestore is not initialized');
  }
}

// Register new user
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  role: 'customer' | 'provider' = 'customer'
): Promise<User> {
  assertFirebaseInitialized();
  
  const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
  const firebaseUser = userCredential.user;

  // Update display name
  await updateProfile(firebaseUser, { displayName: fullName });

  // Create user document in Firestore (avoid undefined values - Firestore doesn't accept them)
  const userData: Omit<User, 'uid'> = {
    fullName,
    email: firebaseUser.email!,
    role,
    location: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Only add profileImage if it exists
  if (firebaseUser.photoURL) {
    userData.profileImage = firebaseUser.photoURL;
  }

  await setDoc(doc(db!, 'users', firebaseUser.uid), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { uid: firebaseUser.uid, ...userData };
}

// Sign in existing user
export async function signIn(email: string, password: string): Promise<User> {
  assertFirebaseInitialized();
  
  const userCredential = await signInWithEmailAndPassword(auth!, email, password);
  const userDoc = await getDoc(doc(db!, 'users', userCredential.user.uid));

  if (!userDoc.exists()) {
    throw new Error('User profile not found');
  }

  return { uid: userDoc.id, ...userDoc.data() } as User;
}

// Sign in with Google
export async function signInWithGoogle(): Promise<User> {
  assertFirebaseInitialized();
  
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth!, provider);
  const firebaseUser = userCredential.user;

  // Check if user exists in Firestore
  const userDocRef = doc(db!, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // Create new user document (avoid undefined values - Firestore doesn't accept them)
    const userData: Omit<User, 'uid'> = {
      fullName: firebaseUser.displayName || 'User',
      email: firebaseUser.email!,
      role: 'customer',
      location: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Only add profileImage if it exists
    if (firebaseUser.photoURL) {
      userData.profileImage = firebaseUser.photoURL;
    }

    await setDoc(userDocRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { uid: firebaseUser.uid, ...userData };
  }

  return { uid: userDoc.id, ...userDoc.data() } as User;
}

// Sign out
export async function signOut(): Promise<void> {
  if (auth) {
    await firebaseSignOut(auth);
  }
}

// Send password reset email
export async function resetPassword(email: string): Promise<void> {
  assertFirebaseInitialized();
  await sendPasswordResetEmail(auth!, email);
}

// Get current user data from Firestore
export async function getCurrentUserData(): Promise<User | null> {
  if (!auth || !db) return null;
  
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!userDoc.exists()) return null;

  return { uid: userDoc.id, ...userDoc.data() } as User;
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  data: Partial<Omit<User, 'uid' | 'createdAt'>>
): Promise<void> {
  assertFirebaseInitialized();
  
  await setDoc(
    doc(db!, 'users', userId),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Update Firebase Auth profile if fullName or profileImage changed
  if (auth!.currentUser && (data.fullName || data.profileImage)) {
    await updateProfile(auth!.currentUser, {
      displayName: data.fullName,
      photoURL: data.profileImage,
    });
  }
}

// Auth state listener
export function onAuthStateChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  if (!auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Get Firebase ID token for API calls
export async function getIdToken(): Promise<string | null> {
  if (!auth) return null;
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
