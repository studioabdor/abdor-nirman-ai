import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  createdAt: Date | Timestamp; // Firestore Server Timestamps are ideal
}

export interface GeneratedImage {
  id?: string; // Document ID
  userId: string;
  createdAt: Date | Timestamp; // Firestore Server Timestamps are ideal
  prompt?: string; // For text-to-image
  originalImageUrl?: string; // For sketch or enhance
  generatedImageUrl: string;
  type: "text-to-image" | "sketch-to-image" | "moodboard" | "enhanced-detail";
  parameters?: Record<string, any>;
}

export interface MoodboardProject {
  id?: string; // Document ID
  userId: string;
  name: string;
  createdAt: Date | Timestamp; // Firestore Server Timestamps are ideal
  description?: string;
  inputImageUrls: string[];
  generatedImageUrl?: string;
  parameters?: Record<string, any>;
}
