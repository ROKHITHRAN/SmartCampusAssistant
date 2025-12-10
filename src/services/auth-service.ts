// src/lib/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { saveUserRecord } from "./user-service";

const googleProvider = new GoogleAuthProvider();
// Optional: always show account chooser
googleProvider.setCustomParameters({ prompt: "select_account" });

export const registerWithEmail = async (
  name: string,
  email: string,
  password: string
): Promise<User> => {
  if (!email || !password) {
    // helps catch the bug before calling Firebase
    throw new Error("Email or password missing before Firebase call");
  }
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name });
  }
  const user = cred.user;
  await saveUserRecord(user.uid, user.email!);

  return cred.user;
};

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const loginWithGoogle = async (): Promise<User> => {
  const cred = await signInWithPopup(auth, googleProvider);
  if (cred.user.email) {
    await saveUserRecord(cred.user.uid, cred.user.email);
  }
  return cred.user;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// For global auth state (used in context)
export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};
