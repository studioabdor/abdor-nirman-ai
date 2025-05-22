import { storage } from "./firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

/**
 * Uploads a file to Firebase Storage.
 * @param userId The UID of the user.
 * @param file The file to upload.
 * @param pathPrefix The prefix for the storage path (e.g., 'sketches').
 * @returns A promise that resolves with the download URL and file path.
 */
export async function uploadFile(
  userId: string,
  file: File,
  pathPrefix: "sketches" | "moodboard_inputs" | "enhancement_inputs"
): Promise<{ downloadURL: string; filePath: string }> {
  // Generate a unique filename using a timestamp and the original file name
  const uniqueFileName = `${new Date().getTime()}-${file.name}`;
  const filePath = `users/${userId}/${pathPrefix}/${uniqueFileName}`;
  const storageRef = ref(storage, filePath);

  try {
    // Use uploadBytesResumable for the upload
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error("Upload failed:", error);
          reject(error);
        },
        async () => {
          // Handle successful uploads on complete
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("File available at", downloadURL);
            resolve({ downloadURL, filePath });
          } catch (error) {
            console.error("Failed to get download URL:", error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error setting up file upload:", error);
    throw error; // Re-throw for external handling if necessary
  }
}

/**
 * Deletes a file from Firebase Storage using its storage path.
 * @param filePath The full path to the file in Firebase Storage.
 * @returns A promise that resolves when the file is deleted.
 */
export async function deleteFileByPath(filePath: string): Promise<void> {
  const storageRef = ref(storage, filePath);
  try {
    await deleteObject(storageRef);
    console.log("File deleted successfully:", filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error; // Re-throw for external handling
  }
}
