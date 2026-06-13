import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";

let _app: App | undefined;
let _db: Firestore | undefined;
let _auth: Auth | undefined;
let _storage: Storage | undefined;

function getAdminApp(): App {
  if (_app) return _app;

  const existing = getApps();
  if (existing.length > 0) {
    _app = existing[0];
    return _app;
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PROJECT_ID) {
    throw new Error("Firebase Admin SDK credentials are not configured");
  }

  _app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return _app;
}

export function getAdminDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getAdminApp());
  return _db;
}

export function getAdminAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getAdminApp());
  return _auth;
}

export function getAdminStorage(): Storage {
  if (_storage) return _storage;
  _storage = getStorage(getAdminApp());
  return _storage;
}

// Backward-compatible exports (lazy)
// These proxies defer Firebase Admin initialization until runtime,
// preventing build failures when env vars are not present at build time.
export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    const db = getAdminDb();
    const value = (db as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(db);
    }
    return value;
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const auth = getAdminAuth();
    const value = (auth as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(auth);
    }
    return value;
  },
});

export const adminStorage = new Proxy({} as Storage, {
  get(_target, prop) {
    const storage = getAdminStorage();
    const value = (storage as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(storage);
    }
    return value;
  },
});

export default function getAdminAppDefault(): App {
  return getAdminApp();
}
