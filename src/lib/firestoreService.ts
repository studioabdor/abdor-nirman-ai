import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type {
  UserProfile,
  GeneratedImage,
  MoodboardProject,
} from "./firestore-types";

// --- UserProfile Functions ---

/**
 * Creates a new user profile document in Firestore.
 * @param userId The UID of the user.
 * @param data Data for the user profile (excluding uid and createdAt).
 */
export async function createUserProfile(
  userId: string,
  data: Omit<UserProfile, "uid" | "createdAt">
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      ...data,
      uid: userId,
      createdAt: serverTimestamp(), // Or new Date() if serverTimestamp causes issues
    });
    console.log("User profile created for UID:", userId);
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

/**
 * Retrieves a user profile from Firestore.
 * @param userId The UID of the user.
 * @returns The UserProfile object or null if not found.
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      // Need to handle Timestamp conversion for createdAt
      const data = docSnap.data();
      return {
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(), // Convert Timestamp to Date
      } as UserProfile;
    } else {
      console.log("No such user profile:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

// --- GeneratedImage Functions ---

/**
 * Adds a new generated image record to a user's subcollection.
 * @param userId The UID of the user.
 * @param imageData Data for the generated image.
 * @returns The ID of the newly created image document.
 */
export async function addGeneratedImage(
  userId: string,
  imageData: Omit<GeneratedImage, "id" | "userId" | "createdAt">
): Promise<string> {
  try {
    const imagesCollectionRef = collection(db, "users", userId, "generatedImages");
    const docRef = await addDoc(imagesCollectionRef, {
      ...imageData,
      userId: userId,
      createdAt: serverTimestamp(), // Or new Date()
    });
    console.log("Generated image added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding generated image:", error);
    throw error;
  }
}

/**
 * Retrieves all generated images for a user, ordered by creation date.
 * @param userId The UID of the user.
 * @returns An array of GeneratedImage objects.
 */
export async function getUserGeneratedImages(
  userId: string
): Promise<GeneratedImage[]> {
  try {
    const imagesCollectionRef = collection(db, "users", userId, "generatedImages");
    const q = query(imagesCollectionRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(), // Convert Timestamp to Date
      } as GeneratedImage;
    });
  } catch (error) {
    console.error("Error getting user generated images:", error);
    throw error;
  }
}

// --- MoodboardProject Functions ---

/**
 * Adds a new moodboard project to a user's subcollection.
 * @param userId The UID of the user.
 * @param projectData Data for the moodboard project.
 * @returns The ID of the newly created project document.
 */
export async function addMoodboardProject(
  userId: string,
  projectData: Omit<MoodboardProject, "id" | "userId" | "createdAt">
): Promise<string> {
  try {
    const projectsCollectionRef = collection(db, "users", userId, "moodboardProjects");
    const docRef = await addDoc(projectsCollectionRef, {
      ...projectData,
      userId: userId,
      createdAt: serverTimestamp(), // Or new Date()
    });
    console.log("Moodboard project added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding moodboard project:", error);
    throw error;
  }
}

/**
 * Retrieves all moodboard projects for a user, ordered by creation date.
 * @param userId The UID of the user.
 * @returns An array of MoodboardProject objects.
 */
export async function getUserMoodboardProjects(
  userId: string
): Promise<MoodboardProject[]> {
  try {
    const projectsCollectionRef = collection(db, "users", userId, "moodboardProjects");
    const q = query(projectsCollectionRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(), // Convert Timestamp to Date
      } as MoodboardProject;
    });
  } catch (error) {
    console.error("Error getting user moodboard projects:", error);
    throw error;
  }
}
