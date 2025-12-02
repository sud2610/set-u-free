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

// Register new user
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  role: 'user' | 'provider' = 'user'
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Update display name
  await updateProfile(firebaseUser, { displayName });

  // Create user document in Firestore
  const userData: Omit<User, 'id'> = {
    email: firebaseUser.email!,
    displayName,
    photoURL: firebaseUser.photoURL || undefined,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: firebaseUser.uid, ...userData };
}

// Sign in existing user
export async function signIn(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

  if (!userDoc.exists()) {
    throw new Error('User profile not found');
  }

  return { id: userDoc.id, ...userDoc.data() } as User;
}

// Sign in with Google
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const firebaseUser = userCredential.user;

  // Check if user exists in Firestore
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // Create new user document
    const userData: Omit<User, 'id'> = {
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || 'User',
      photoURL: firebaseUser.photoURL || undefined,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(userDocRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: firebaseUser.uid, ...userData };
  }

  return { id: userDoc.id, ...userDoc.data() } as User;
}

// Sign out
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// Send password reset email
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// Get current user data from Firestore
export async function getCurrentUserData(): Promise<User | null> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!userDoc.exists()) return null;

  return { id: userDoc.id, ...userDoc.data() } as User;
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  data: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<void> {
  await setDoc(
    doc(db, 'users', userId),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Update Firebase Auth profile if display name or photo changed
  if (auth.currentUser && (data.displayName || data.photoURL)) {
    await updateProfile(auth.currentUser, {
      displayName: data.displayName,
      photoURL: data.photoURL,
    });
  }
}

// Auth state listener
export function onAuthStateChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

// Get Firebase ID token for API calls
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}



