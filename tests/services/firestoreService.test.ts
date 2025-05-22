/**
 * Test Suite for Firestore Service
 *
 * Important Setup Notes:
 * 1. Jest Configuration: These tests require a Jest setup. This typically involves:
 *    - Installing Jest and related packages (`jest`, `ts-jest`, `@types/jest`).
 *    - A `jest.config.js` (or `jest.config.ts`) file configured for your project (e.g., using `ts-jest` preset, defining `testEnvironment`).
 *    - Potentially, a `jest.setup.js` for global mocks or extensions like `@testing-library/jest-dom`.
 *
 * 2. Firebase Mocks:
 *    - To test Firestore (and other Firebase) interactions without hitting the actual backend,
 *      Firebase services need to be mocked. This can be done globally in `jest.setup.js`
 *      or on a per-suite/per-test basis as shown below.
 *    - The `firebase/firestore` module (and others like `firebase/auth`, `firebase/storage`)
 *      should be mocked.
 *
 * 3. Module Aliases:
 *    - If your project uses path aliases (e.g., `@/lib/...`), ensure Jest is configured
 *      to resolve these paths (usually via `moduleNameMapper` in `jest.config.js`).
 */

import { getUserProfile } from "@/lib/firestoreService"; // Adjust path as per your project structure
import { doc, getDoc, Timestamp } from "firebase/firestore"; // Import actual types for casting if needed

// Mock the entire 'firebase/firestore' module
jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"), // Import and retain default exports
  getFirestore: jest.fn(() => {
    // Mock Firestore instance if any functions directly on it are called in the service
    // console.log("Mock getFirestore called");
    return {};
  }),
  doc: jest.fn(),
  getDoc: jest.fn(),
  // Add other Firestore functions (setDoc, addDoc, collection, query, etc.) here if they are used in other service functions.
}));

// Mock db export from "@/lib/firebase"
// This is crucial if your firestoreService directly imports `db`
jest.mock("@/lib/firebase", () => ({
  ...jest.requireActual("@/lib/firebase"), // Retain other exports if any
  db: {}, // Mocked db object, actual instance not needed due to functions being mocked
  auth: {}, // Mock auth if needed by other services or for consistency
  storage: {}, // Mock storage if needed
}));


describe("Firestore Service - UserProfile", () => {
  const mockUserId = "testUser123";

  beforeEach(() => {
    // Clear all mock implementations and call history before each test
    (doc as jest.Mock).mockClear();
    (getDoc as jest.Mock).mockClear();
  });

  describe("getUserProfile", () => {
    test("should retrieve a user profile if it exists", async () => {
      const mockUserProfileData = {
        uid: mockUserId,
        email: "test@example.com",
        displayName: "Test User",
        createdAt: Timestamp.now(), // Use Firestore Timestamp for mock
      };

      // Configure getDoc to return a DocumentSnapshot with the data
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserProfileData,
        id: mockUserId, // Include id in the snapshot mock
      });
      
      // Configure doc to return a dummy DocumentReference (not strictly needed if not used by service)
      (doc as jest.Mock).mockReturnValue({ type: "document", path: `users/${mockUserId}` });


      const profile = await getUserProfile(mockUserId);

      expect(doc).toHaveBeenCalledWith(expect.anything(), "users", mockUserId); // expect.anything() for the db instance
      expect(getDoc).toHaveBeenCalledTimes(1);
      expect(profile).toEqual({
        ...mockUserProfileData,
        createdAt: expect.any(Date), // The service converts Timestamp to Date
      });
      // Check if Timestamp.toDate() was called (indirectly assert createdAt is a Date)
      expect(profile?.createdAt instanceof Date).toBe(true);
    });

    test("should return null if the user profile does not exist", async () => {
      // Configure getDoc to return a DocumentSnapshot indicating no document exists
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });
      (doc as jest.Mock).mockReturnValue({ type: "document", path: `users/${mockUserId}` });


      const profile = await getUserProfile(mockUserId);

      expect(doc).toHaveBeenCalledWith(expect.anything(), "users", mockUserId);
      expect(getDoc).toHaveBeenCalledTimes(1);
      expect(profile).toBeNull();
    });

    test("should throw an error if Firestore operation fails", async () => {
      const errorMessage = "Firestore operation failed";
      (getDoc as jest.Mock).mockRejectedValue(new Error(errorMessage));
      (doc as jest.Mock).mockReturnValue({ type: "document", path: `users/${mockUserId}` });


      await expect(getUserProfile(mockUserId)).rejects.toThrow(errorMessage);
      expect(doc).toHaveBeenCalledWith(expect.anything(), "users", mockUserId);
      expect(getDoc).toHaveBeenCalledTimes(1);
    });
  });

  // Add tests for other UserProfile functions (e.g., createUserProfile) here
  // Example for createUserProfile (you'd need to mock setDoc, serverTimestamp):
  /*
  jest.mock("firebase/firestore", () => ({
    // ... other mocks
    setDoc: jest.fn(),
    serverTimestamp: jest.fn(() => "mock server timestamp"), // Mock serverTimestamp
  }));

  describe("createUserProfile", () => {
    test("should create a user profile document", async () => {
      const userData = { email: "new@example.com", displayName: "New User" };
      (setDoc as jest.Mock).mockResolvedValue(undefined); // setDoc resolves to undefined on success

      await createUserProfile(mockUserId, userData);

      expect(doc).toHaveBeenCalledWith(expect.anything(), "users", mockUserId);
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(), // The DocumentReference from doc()
        {
          uid: mockUserId,
          email: userData.email,
          displayName: userData.displayName,
          createdAt: "mock server timestamp", // Or expect.any(Date) if you use new Date()
        }
      );
    });
  });
  */
});
