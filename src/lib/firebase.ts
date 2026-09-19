import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyD45cxqrCo05Y7q8ti4FNbmtufpCSHN_fU",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "firstproject-3ec92.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "firstproject-3ec92",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "firstproject-3ec92.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "931684474459",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:931684474459:web:5f1c4702d1cf97c264297e",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-7LD4T1BTQ8",
};

// Initialize Firebase safely (avoid duplicate instances in SSR / Fast Refresh)
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let analytics: Analytics | undefined;

if (typeof window !== "undefined") {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Initialize analytics only if supported by browser environment
  isSupported().then((supported) => {
    if (supported && app) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  if (!auth) throw new Error("Firebase Auth is only available on client side.");
  return signInWithPopup(auth, googleProvider);
}

// Setup invisible reCAPTCHA for Phone OTP
export function setupRecaptcha(
  containerId: string,
  onSuccess?: () => void,
): RecaptchaVerifier {
  if (!auth) throw new Error("Firebase Auth is only available on client side.");

  // Clear existing verifier if any
  if (typeof window !== "undefined" && (window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch {
      // ignore
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      if (onSuccess) onSuccess();
    },
  });

  if (typeof window !== "undefined") {
    (window as any).recaptchaVerifier = verifier;
  }

  return verifier;
}

// Send Phone OTP via Firebase
export async function sendFirebasePhoneOtp(
  phoneNumberWithCountryCode: string,
  verifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  if (!auth) throw new Error("Firebase Auth is only available on client side.");
  return signInWithPhoneNumber(auth, phoneNumberWithCountryCode, verifier);
}
