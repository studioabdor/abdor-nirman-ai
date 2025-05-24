"use server";

import { sketchToRender, type SketchToRenderInput, type SketchToRenderOutput } from "@/ai/flows/sketch-to-render";
import { moodboardRender, type MoodboardRenderInput, type MoodboardRenderOutput } from "@/ai/flows/moodboard-render";
import { textToRender, type TextToRenderInput, type TextToRenderOutput } from "@/ai/flows/text-to-render";
import { storage, firestore } from '@/lib/firebaseConfig'; // Import initialized storage and firestore
import { ref, uploadBytesResumable, getDownloadURL, uploadString } from 'firebase/storage'; // Import storage functions
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions

export async function handleSketchToRender(input: SketchToRenderInput, userId: string): Promise<SketchToRenderOutput> {
  try {
    if (!input.sketchDataUri || !input.aspectRatio || !input.outputSize) {
      throw new Error("Missing required fields for sketch to render.");
    }
    if (!userId) {
      throw new Error("User ID is required to save the image.");
    }

    // 1. Get the image URL from the Genkit flow (or the data URI itself)
    // For sketchToRender, the input `sketchDataUri` is the image.
    // The Genkit flow `sketchToRender` might return an external URL if it processes and hosts it.
    // Assuming `sketchToRender(input)` returns an object with `imageUrl` (potentially a Replicate URL or similar)
    const genkitOutput = await sketchToRender(input);
    let sourceImageUrl = genkitOutput.imageUrl; // This is the URL from Replicate/Genkit processing
    let imageBlob: Blob;

    if (sourceImageUrl) {
      // If Genkit returned a URL, fetch it
      const imageResponse = await fetch(sourceImageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch processed sketch image: ${imageResponse.statusText}`);
      }
      imageBlob = await imageResponse.blob();
    } else if (input.sketchDataUri.startsWith('data:')) {
      // Fallback or direct use of data URI if Genkit doesn't return a URL
      // This path might be less common if Genkit always returns a URL
      const base64Response = await fetch(input.sketchDataUri);
      imageBlob = await base64Response.blob();
      sourceImageUrl = `sketch-${Date.now()}.png`; // Create a placeholder name for extension
    } else {
      throw new Error("No valid image source provided or returned from sketch processing.");
    }

    // 2. Create a Firebase Storage reference
    const fileExtension = getFileExtension(sourceImageUrl); // Use helper for consistency
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const imageName = `${timestamp}-${randomString}.${fileExtension}`;
    const storageRef = ref(storage, `users/${userId}/images/sketch-to-render/${imageName}`);

    // 3. Upload the image blob to Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, imageBlob, { contentType: imageBlob.type });

    await new Promise<void>((resolve, reject) => {
      uploadTask.on('state_changed',
        () => {}, // Progress can be handled here
        (error) => {
          console.error("Firebase Storage upload error (sketch):", error);
          reject(new Error(`Sketch image upload failed: ${error.message}`));
        },
        () => resolve()
      );
    });

    // 4. Get the Firebase Storage download URL
    const firebaseDownloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    // 5. Save metadata to Firestore
    try {
      const metadata = {
        userId,
        imageUrl: firebaseDownloadURL,
        prompt: `Sketch input (aspect ratio: ${input.aspectRatio}, size: ${input.outputSize})`, // Summarized prompt
        flowType: "sketchToRender",
        createdAt: serverTimestamp(),
        aspectRatio: input.aspectRatio,
        outputSize: input.outputSize,
        originalFileName: input.sketchDataUri.startsWith('data:') ? 'uploaded-sketch.png' : input.sketchDataUri, // Placeholder for original file name if needed
      };
      const docRef = await addDoc(collection(firestore, "imageHistory"), metadata);
      console.log("Sketch metadata saved to Firestore with ID: ", docRef.id);
    } catch (firestoreError) {
      console.error("Error saving sketch metadata to Firestore:", firestoreError);
      // Not re-throwing, as image upload was successful. Log and continue.
    }

    // 6. Return the Firebase Storage downloadURL
    return {
      ...genkitOutput, // Spread other properties from genkitOutput
      imageUrl: firebaseDownloadURL,
    };

  } catch (error) {
    console.error("Error in handleSketchToRender:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during sketch rendering or upload.";
    throw new Error(`Sketch rendering processing failed: ${errorMessage}`);
  }
}

export async function handleMoodboardRender(input: MoodboardRenderInput, userId: string): Promise<MoodboardRenderOutput> {
  try {
    if (!input.image1DataUri || !input.image2DataUri || !input.aspectRatio || !input.outputSize || !input.architecturalStyle) {
      throw new Error("Missing required fields for moodboard render.");
    }
    if (!userId) {
      throw new Error("User ID is required to save the image.");
    }

    // 1. Get the image URL from the Genkit flow
    const genkitOutput = await moodboardRender(input);
    const replicateImageUrl = genkitOutput.imageUrl; // Assuming this is the output from Genkit

    if (!replicateImageUrl) {
      throw new Error("Failed to get image URL from moodboard-render flow.");
    }

    // 2. Fetch the image data from the Replicate URL
    const imageResponse = await fetch(replicateImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from Replicate (moodboard): ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();

    // 3. Create a Firebase Storage reference
    const fileExtension = getFileExtension(replicateImageUrl);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const imageName = `${timestamp}-${randomString}.${fileExtension}`;
    const storageRef = ref(storage, `users/${userId}/images/moodboard-render/${imageName}`);

    // 4. Upload the image blob to Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, imageBlob, { contentType: imageBlob.type });

    await new Promise<void>((resolve, reject) => {
      uploadTask.on('state_changed',
        () => {}, // Progress
        (error) => {
          console.error("Firebase Storage upload error (moodboard):", error);
          reject(new Error(`Moodboard image upload failed: ${error.message}`));
        },
        () => resolve()
      );
    });

    // 5. Get the Firebase Storage download URL
    const firebaseDownloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    // 6. Save metadata to Firestore
    try {
      const metadata = {
        userId,
        imageUrl: firebaseDownloadURL,
        prompt: `Moodboard (style: ${input.architecturalStyle}, aspect ratio: ${input.aspectRatio}, size: ${input.outputSize})`, // Summarized prompt
        flowType: "moodboardRender",
        createdAt: serverTimestamp(),
        aspectRatio: input.aspectRatio,
        outputSize: input.outputSize,
        architecturalStyle: input.architecturalStyle,
        // Potentially add URLs or names of input.image1DataUri & input.image2DataUri if they are not too long
      };
      const docRef = await addDoc(collection(firestore, "imageHistory"), metadata);
      console.log("Moodboard metadata saved to Firestore with ID: ", docRef.id);
    } catch (firestoreError) {
      console.error("Error saving moodboard metadata to Firestore:", firestoreError);
      // Not re-throwing
    }

    // 7. Return the Firebase Storage downloadURL
    return {
      ...genkitOutput,
      imageUrl: firebaseDownloadURL,
    };

  } catch (error) {
    console.error("Error in handleMoodboardRender:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during moodboard rendering or upload.";
    throw new Error(`Moodboard rendering processing failed: ${errorMessage}`);
  }
}

// Helper function to get file extension from URL or default to png
const getFileExtension = (url: string): string => {
  try {
    const path = new URL(url).pathname;
    const extension = path.split('.').pop();
    return extension || 'png';
  } catch (e) {
    return 'png'; // Default if URL parsing fails
  }
};

export async function handleTextToRender(input: TextToRenderInput, userId: string): Promise<TextToRenderOutput> {
  try {
    if (!input.textDescription) {
      throw new Error("Missing text description for text to render.");
    }
    if (!userId) {
      throw new Error("User ID is required to save the image.");
    }

    // 1. Get the image URL from the Genkit flow
    const genkitOutput = await textToRender(input);
    const replicateImageUrl = genkitOutput.imageUrl;

    if (!replicateImageUrl) {
      throw new Error("Failed to get image URL from text-to-render flow.");
    }

    // 2. Fetch the image data from the Replicate URL
    const imageResponse = await fetch(replicateImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from Replicate: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();

    // 3. Create a Firebase Storage reference
    const fileExtension = getFileExtension(replicateImageUrl);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const imageName = `${timestamp}-${randomString}.${fileExtension}`;
    const storageRef = ref(storage, `users/${userId}/images/text-to-render/${imageName}`);

    // 4. Upload the image blob to Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, imageBlob, { contentType: imageBlob.type });

    // Wait for the upload to complete
    await new Promise<void>((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Optional: Observe state change events such as progress, pause, and resume
          // const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error("Firebase Storage upload error:", error);
          reject(new Error(`Image upload failed: ${error.message}`));
        },
        () => {
          // Handle successful uploads on complete
          resolve();
        }
      );
    });

    // 5. Get the Firebase Storage download URL
    const firebaseDownloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    // 6. Save metadata to Firestore
    try {
      const metadata = {
        userId,
        imageUrl: firebaseDownloadURL,
        prompt: input.textDescription,
        flowType: "textToRender",
        createdAt: serverTimestamp(),
        aspectRatio: input.aspectRatio, // Assuming these are passed in input
        outputSize: input.outputSize,   // Assuming these are passed in input
        architecturalStyle: input.architecturalStyle, // Assuming these are passed in input
      };
      const docRef = await addDoc(collection(firestore, "imageHistory"), metadata);
      console.log("TextToRender metadata saved to Firestore with ID: ", docRef.id);
    } catch (firestoreError) {
      console.error("Error saving textToRender metadata to Firestore:", firestoreError);
      // Not re-throwing
    }

    // 7. Return the Firebase Storage downloadURL
    return {
      ...genkitOutput, // Spread other properties from genkitOutput if any
      imageUrl: firebaseDownloadURL, // Override with Firebase URL
    };

  } catch (error) {
    console.error("Error in handleTextToRender:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during text to image generation or upload.";
    throw new Error(`Text to image processing failed: ${errorMessage}`);
  }
}