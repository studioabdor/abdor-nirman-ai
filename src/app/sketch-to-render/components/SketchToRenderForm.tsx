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


const SketchToRenderForm: React.FC = () => {
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sketchPreviewDataUri, setSketchPreviewDataUri] = useState<string | null>(null); // Kept for potential UI preview if needed, though FileUploader handles its own.
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [outputSize, setOutputSize] = useState<string>("1024x576"); // Default to a 16:9 size
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      //    has been updated to accept `sketchUrl` instead of `sketchDataUri`.
      //    And that it can be called client-side, or is wrapped appropriately.
      const aiInput = {
        sketchUrl: uploadedSketchUrl,
        aspectRatio,
        outputSize,
      };
      console.log("Calling AI flow with input:", aiInput);

      // MOCK AI RESULT (replace with actual call to handleSketchToRender)
      // const aiResult = await handleSketchToRender(aiInput);
      await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate AI processing time
      const mockGeneratedImage = `https://picsum.photos/seed/${Math.random()}/${outputSize.split('x')[0]}/${outputSize.split('x')[1]}`;
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
          originalImageUrl: uploadedSketchUrl, // URL of the uploaded sketch
          generatedImageUrl: aiGeneratedImageUrl, // URL of the AI-generated image
          parameters: {
            aspectRatio,
            outputSize,
            originalSketchPath: uploadedSketchPath, // Path in storage for reference/cleanup
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

  // Dynamically parse width and height for the Image component
  const [imgWidth, imgHeight] = outputSize.split("x").map(Number);

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
                <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                <SelectItem value="3:4">3:4 (Tall)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="output-size" className="block text-sm font-medium mb-1">Output Size:</Label>
            <Select value={outputSize} onValueChange={setOutputSize} disabled={isLoading}>
              <SelectTrigger id="output-size">
                <SelectValue placeholder="Select output size" />
              </SelectTrigger>
              <SelectContent>
                {/* These should ideally be filtered/updated based on aspect ratio */}
                <SelectItem value="1024x576">1024x576 (16:9)</SelectItem>
                <SelectItem value="1024x1024">1024x1024 (1:1)</SelectItem>
                <SelectItem value="576x1024">576x1024 (9:16)</SelectItem>
                <SelectItem value="1024x768">1024x768 (4:3)</SelectItem>
                <SelectItem value="768x1024">768x1024 (3:4)</SelectItem>
                <SelectItem value="2048x1152">2048x1152 (16:9 HD)</SelectItem>
                <SelectItem value="2048x2048">2048x2048 (1:1 HD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || !sketchFile}>
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
