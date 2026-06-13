import { vi } from "vitest";

// Mock Firebase modules globally for tests
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(() => () => {}),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
  addDoc: vi.fn(() => Promise.resolve({ id: "test-id" })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 0, nanoseconds: 0 })),
    fromDate: vi.fn((date: Date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 })),
  },
}));

vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => ({})),
}));
