"use client";

import React, { useState } from "react";
import FileUploader from "@/components/shared/FileUploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Label might not be used if no extra params
import Image from "next/image";
import { uploadFile, deleteFileByPath } from "@/lib/storageService";
import { addGeneratedImage } from "@/lib/firestoreService";
// Assuming handleEnhanceDetails will be created/updated in actions.ts and will take an imageUrl
import { handleEnhanceDetails } from "@/lib/actions"; 
import LoadingSpinner from "@/components/shared/LoadingSpinner"; // Import the shared component

// Placeholder for LoadingSpinner - REMOVED
// const LoadingSpinner: React.FC = () => <div className="flex justify-center items-center"><p className="text-lg">Enhancing your image...</p></div>;

const EnhanceDetailsForm: React.FC = () => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImagePreviewDataUri, setOriginalImagePreviewDataUri] = useState<string | null>(null);
  // enhancementParams is kept as an empty object for now, as per subtask.
  // If specific params like scaleFactor were added, they'd be managed here.
  const [enhancementParams, setEnhancementParams] = useState({}); 
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const [originalImageStoragePath, setOriginalImageStoragePath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpdate = (file: File | null, dataUri: string | null) => {
    setOriginalImageFile(file);
    setOriginalImagePreviewDataUri(dataUri);
    setEnhancedImageUrl(null); // Clear previous results
    setOriginalImageStoragePath(null); // Clear path if new file is uploaded
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setEnhancedImageUrl(null); // Clear previous enhanced image

    if (!originalImageFile) {
      setError("Please upload an image to enhance.");
      setIsLoading(false);
      return;
    }

    const userId = "test-user-enhance-details"; // Placeholder for actual user ID
    let uploadedImageUrl: string | null = null; 
    let tempUploadedImagePath: string | null = null; // Use a temporary variable for the path

    try {
      // 1. Upload Image to Storage
      const uploadResult = await uploadFile(userId, originalImageFile, "enhancement_inputs");
      uploadedImageUrl = uploadResult.downloadURL;
      tempUploadedImagePath = uploadResult.filePath;
      setOriginalImageStoragePath(tempUploadedImagePath); // Set state for Firestore record

      // 2. Call AI Flow (Action)
      const aiInput = { 
        imageUrl: uploadedImageUrl,
        // ...enhancementParams // Spread any other params here if they exist
      };
      console.log("Calling AI flow (handleEnhanceDetails) with input:", aiInput);

      const aiResult = await handleEnhanceDetails(aiInput);
      // MOCK AI RESULT - Remove this block when `handleEnhanceDetails` is fully implemented
      // await new Promise(resolve => setTimeout(resolve, 2000)); 
      // const mockEnhancedUrl = `${uploadedImageUrl}?enhanced=true&seed=${Math.random()}`; 
      // const aiResult = { imageUrl: mockEnhancedUrl, error: null }; 
      // MOCK END

      if (aiResult.error || !aiResult.imageUrl) {
        throw new Error(aiResult.error || "AI processing failed to return an enhanced image URL.");
      }
      const aiEnhancedImageUrl = aiResult.imageUrl;

      // 3. Save to Firestore
      // Ensure originalImageStoragePath from state is used, which should be set by now
      if (!originalImageStoragePath && tempUploadedImagePath) {
         // Fallback in case state update hasn't propagated, though unlikely with await
         console.warn("originalImageStoragePath state was null, using tempUploadedImagePath for Firestore.");
         setOriginalImageStoragePath(tempUploadedImagePath); // Ensure it's set for UI consistency
      }
      
      try {
        await addGeneratedImage(userId, {
          type: "enhanced-detail",
          originalImageUrl: uploadedImageUrl, 
          generatedImageUrl: aiEnhancedImageUrl,
          parameters: {
            originalImageStoragePath: tempUploadedImagePath, // Use the path from successful upload
            ...enhancementParams, 
          },
        });
      } catch (firestoreError: any) {
        console.error("Error saving enhanced image details to Firestore:", firestoreError);
        setError(
          "Image enhanced successfully, but failed to save details to your gallery. You can try saving it manually if needed."
        );
        // Don't stop, image is enhanced and can be displayed.
      }

      setEnhancedImageUrl(aiEnhancedImageUrl);

    } catch (err: any) {
      console.error("Enhance Details process error:", err);
      setError(err.message || "An unexpected error occurred during the image enhancement process.");
      // If an error occurred after uploading the original image, and we have its path, delete it.
      if (tempUploadedImagePath && !tempUploadedImagePath.includes("picsum.photos")) { 
        try {
          await deleteFileByPath(tempUploadedImagePath);
          console.log("Cleaned up uploaded original image due to error:", tempUploadedImagePath);
        } catch (cleanupError) {
          console.error("Failed to clean up original image after error:", cleanupError);
        }
      }
      setOriginalImageStoragePath(null); // Clear path if error occurred and cleanup attempted
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center">Enhance Image Details</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-lg shadow-xl">
        <FileUploader
          onFileUpload={handleFileUpdate}
          id="enhance-image-upload"
          label="Upload Image to Enhance"
          accept="image/*"
        />
        
        {/* Enhancement parameters section can be added here if needed in future */}

        <Button 
          type="submit" 
          className="w-full py-3 text-lg" 
          disabled={isLoading || !originalImageFile}
        >
          {isLoading ? "Enhancing Image..." : "Enhance Details"}
        </Button>
      </form>

      {isLoading && (
        <div className="text-center py-6">
          <LoadingSpinner size="lg" /> {/* Use the imported graphical spinner */}
          <p className="text-muted-foreground mt-2">Processing your image, please wait.</p>
        </div>
      )}
      
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <h3 className="font-semibold">Enhancement Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {enhancedImageUrl && !isLoading && (
        <div className="mt-10 p-6 border rounded-lg shadow-xl bg-card space-y-6">
          <h3 className="text-3xl font-semibold mb-6 text-center">Enhancement Result</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <h4 className="text-xl font-medium mb-2 text-center">Original Image</h4>
              {originalImagePreviewDataUri && (
                 <div className="flex justify-center items-center bg-muted/30 p-2 rounded-md">
                    <Image
                    src={originalImagePreviewDataUri}
                    alt="Original"
                    width={512} // Example fixed width for preview
                    height={512} // Example fixed height for preview
                    className="rounded-md border-2 border-muted shadow-md object-contain max-h-[512px] w-auto"
                    />
                 </div>
              )}
            </div>
            <div>
              <h4 className="text-xl font-medium mb-2 text-center">Enhanced Image</h4>
               <div className="flex justify-center items-center bg-muted/30 p-2 rounded-md">
                <Image
                    src={enhancedImageUrl}
                    alt="Enhanced"
                    width={512} // Example fixed width, or use actual dimensions if AI returns them
                    height={512} // Example fixed height
                    className="rounded-md border-2 border-primary/20 shadow-md object-contain max-h-[512px] w-auto"
                    priority
                />
               </div>
              <div className="mt-4 text-center">
                <a
                  href={enhancedImageUrl}
                  download={`enhanced_image_${originalImageFile?.name || Date.now()}.png`} // Suggest a filename
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Download Enhanced Image
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhanceDetailsForm;
