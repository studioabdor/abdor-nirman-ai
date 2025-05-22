"use client";

import React, { useState } from "react";
import FileUploader from "@/components/shared/FileUploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { uploadFile, deleteFileByPath } from "@/lib/storageService";
import { addGeneratedImage } from "@/lib/firestoreService";
// import { handleSketchToRender } from "@/lib/actions"; // This will be used when actions.ts is updated

// Placeholder for LoadingSpinner, replace with actual component if available
// For now, using a simple text loading indicator.
// import LoadingSpinner from "@/components/shared/LoadingSpinner"; // Original comment
import LoadingSpinner from "@/components/shared/LoadingSpinner"; // Correctly import the shared component
import React, { useState, useEffect } from "react"; // Ensure useEffect is imported

// --- Define Size Options Data Structure ---
const aspectRatioOptions = [
  { value: "16:9", label: "16:9 (Widescreen)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "4:3", label: "4:3 (Standard)" },
  { value: "3:4", label: "3:4 (Tall)" },
];

const outputSizesByAspect: Record<string, Array<{ label: string, width: number, height: number }>> = {
  "16:9": [
    { label: "1024x576", width: 1024, height: 576 },
    { label: "1280x720 (HD)", width: 1280, height: 720 },
    { label: "1920x1080 (Full HD)", width: 1920, height: 1080 },
    { label: "2048x1152 (2K)", width: 2048, height: 1152},
  ],
  "1:1": [
    { label: "1024x1024", width: 1024, height: 1024 },
    { label: "512x512", width: 512, height: 512 },
    { label: "2048x2048 (2K)", width: 2048, height: 2048},
  ],
  "9:16": [
    { label: "576x1024", width: 576, height: 1024 },
    { label: "720x1280 (HD Portrait)", width: 720, height: 1280 },
    { label: "1080x1920 (Full HD Portrait)", width: 1080, height: 1920 },
  ],
  "4:3": [
    { label: "1024x768", width: 1024, height: 768 },
    { label: "800x600", width: 800, height: 600 },
  ],
  "3:4": [
    { label: "768x1024", width: 768, height: 1024 },
    { label: "600x800", width: 600, height: 800 },
  ],
};
// --- End Size Options Data Structure ---


const SketchToRenderForm: React.FC = () => {
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sketchPreviewDataUri, setSketchPreviewDataUri] = useState<string | null>(null);

  // --- Updated State Variables ---
  const defaultAspectRatio = aspectRatioOptions[0].value; // "16:9"
  const defaultSizesForAspectRatio = outputSizesByAspect[defaultAspectRatio];
  const defaultOutputSizeString = defaultSizesForAspectRatio[0].label; // e.g., "1024x576"

  const [aspectRatio, setAspectRatio] = useState<string>(defaultAspectRatio);
  const [availableOutputSizes, setAvailableOutputSizes] = useState(defaultSizesForAspectRatio);
  const [selectedOutputSize, setSelectedOutputSize] = useState<string>(defaultOutputSizeString); // Stores the label string like "1024x576"
  // --- End Updated State Variables ---
  
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- useEffect for Dynamic Updates ---
  useEffect(() => {
    const newAvailableSizes = outputSizesByAspect[aspectRatio];
    setAvailableOutputSizes(newAvailableSizes);
    if (newAvailableSizes.length > 0) {
      // Check if the current selectedOutputSize is valid for the new aspect ratio
      const currentSelectionIsValid = newAvailableSizes.some(size => size.label === selectedOutputSize);
      if (!currentSelectionIsValid) {
        setSelectedOutputSize(newAvailableSizes[0].label); // Set to the first available size
      }
      // If it is valid, keep the current selection, unless it's preferred to always reset.
      // For now, only reset if invalid.
    } else {
      setSelectedOutputSize(""); // No sizes available
    }
  }, [aspectRatio, selectedOutputSize]); // Added selectedOutputSize to dependencies to re-validate if it changes externally
  // --- End useEffect for Dynamic Updates ---

  const handleFileUpdate = (file: File | null, dataUri: string | null) => {
    setSketchFile(file);
    setSketchPreviewDataUri(dataUri); // Store data URI if needed for other previews, though FileUploader handles its own
    setGeneratedImageUrl(null); // Clear previous image if a new file is uploaded
    setError(null); // Clear previous errors
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null); // Clear previous image

    if (!sketchFile) {
      setError("Please upload a sketch.");
      setIsLoading(false);
      return;
    }

    const userId = "test-user-sketch-to-render"; // Placeholder for actual user ID
    let uploadedSketchPath: string | null = null;

    try {
      // 1. Upload sketch to Firebase Storage
      const { downloadURL: uploadedSketchUrl, filePath } = await uploadFile(
        userId,
        sketchFile,
        "sketches"
      );
      uploadedSketchPath = filePath;

      // 2. Call AI Flow (Action)
      //    This section assumes `handleSketchToRender` in `src/lib/actions.ts`
      //    has been updated to accept `sketchUrl`, `width`, and `height`.
      const selectedSizeObject = availableOutputSizes.find(size => size.label === selectedOutputSize);
      if (!selectedSizeObject) {
        throw new Error("Selected output size is not valid.");
      }

      const { width, height } = selectedSizeObject;
      
      const aiInput = {
        sketchUrl: uploadedSketchUrl,
        aspectRatio,
        width,
        height,
      };
      console.log("Calling AI flow with input:", aiInput);

      // MOCK AI RESULT (replace with actual call to handleSketchToRender)
      // const aiResult = await handleSketchToRender(aiInput);
      await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate AI processing time
      const mockGeneratedImage = `https://picsum.photos/seed/${Math.random()}/${width}/${height}`;
      const aiResult = { imageUrl: mockGeneratedImage, error: null }; // Mock success
      // const aiResult = { imageUrl: null, error: "Mock AI processing failed." }; // Mock failure
      // MOCK END

      if (aiResult.error || !aiResult.imageUrl) {
        throw new Error(aiResult.error || "AI processing failed to return an image URL.");
      }
      
      const aiGeneratedImageUrl = aiResult.imageUrl;

      // 3. Save image metadata to Firestore
      try {
        await addGeneratedImage(userId, {
          type: "sketch-to-image",
          originalImageUrl: uploadedSketchUrl, 
          generatedImageUrl: aiGeneratedImageUrl, 
          parameters: {
            aspectRatio,
            width, // Save numerical width
            height, // Save numerical height
            outputSizeLabel: selectedOutputSize, // Optionally save the label for display
            originalSketchPath: uploadedSketchPath, 
          },
        });
      } catch (firestoreError) {
        console.error("Error saving to Firestore:", firestoreError);
        // Non-critical error, image was generated. Set error to inform user.
        setError(
          "Image generated successfully, but failed to save to your gallery. Please try saving it manually."
        );
      }

      setGeneratedImageUrl(aiGeneratedImageUrl);

    } catch (err: any) {
      console.error("Sketch to Render process error:", err);
      setError(err.message || "An unexpected error occurred during the sketch to render process.");
      // If an error occurred after uploading the sketch, attempt to clean it up
      if (uploadedSketchPath) {
        try {
          await deleteFileByPath(uploadedSketchPath);
          console.log("Cleaned up uploaded sketch due to error:", uploadedSketchPath);
        } catch (cleanupError)_ {
          console.error("Failed to clean up sketch after error:", cleanupError);
          // Add to error or log, but primary error is already set
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamically parse width and height for the Image component from selectedOutputSize
  const currentOutputDimensions = availableOutputSizes.find(s => s.label === selectedOutputSize) || { width: 1024, height: 576};
  const imgWidth = currentOutputDimensions.width;
  const imgHeight = currentOutputDimensions.height;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">Sketch to Render</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg shadow">
        <FileUploader
          onFileUpload={handleFileUpdate}
          id="sketch-image-upload"
          label="Upload Your Sketch"
          accept="image/*"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="aspect-ratio" className="block text-sm font-medium mb-1">Aspect Ratio:</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isLoading}>
              <SelectTrigger id="aspect-ratio">
                <SelectValue placeholder="Select aspect ratio" />
              </SelectTrigger>
              <SelectContent>
                {aspectRatioOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="output-size" className="block text-sm font-medium mb-1">Output Size:</Label>
            <Select value={selectedOutputSize} onValueChange={setSelectedOutputSize} disabled={isLoading || availableOutputSizes.length === 0}>
              <SelectTrigger id="output-size">
                <SelectValue placeholder="Select output size" />
              </SelectTrigger>
              <SelectContent>
                {availableOutputSizes.map((size) => (
                  <SelectItem key={size.label} value={size.label}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || !sketchFile || !selectedOutputSize}>
          {isLoading ? "Generating Your Image..." : "Render Sketch"}
        </Button>
      </form>

      {isLoading && (
        <div className="text-center py-4">
          <LoadingSpinner size="lg" /> {/* Use the imported graphical spinner, optionally specify size */}
          <p className="text-muted-foreground mt-2">Please wait, this may take a moment.</p>
        </div>
      )}
      
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {generatedImageUrl && !isLoading && (
        <div className="mt-8 p-4 border rounded-lg shadow bg-card">
          <h3 className="text-2xl font-semibold mb-4 text-center">Your Generated Image:</h3>
          <div className="flex justify-center">
            <Image
              src={generatedImageUrl}
              alt="Generated from sketch"
              width={imgWidth || 1024} 
              height={imgHeight || 576}
              className="rounded-md border-2 border-muted"
              priority // Prioritize loading of the generated image
            />
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => window.open(generatedImageUrl, '_blank')}>
              Open Full Size
            </Button>
            {/* Add download button or other actions if needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default SketchToRenderForm;
