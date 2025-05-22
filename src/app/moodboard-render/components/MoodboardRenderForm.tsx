"use client";

import React, { useState } from "react";
import FileUploader from "@/components/shared/FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { addMoodboardProject } from "@/lib/firestoreService";
import { handleMoodboardRender } from "@/lib/actions"; // Assumed to be updated for URLs
import LoadingSpinner from "@/components/shared/LoadingSpinner"; // Import the shared component

// Placeholder for LoadingSpinner - REMOVED
// const LoadingSpinner: React.FC = () => <div className="flex justify-center items-center"><p className="text-lg">Generating your moodboard...</p></div>;

const architecturalStyleOptions = [
  "Modern", "Minimalist", "Brutalist", "Classical", "Art Deco", 
  "Contemporary", "Futuristic", "Industrial", "Scandinavian", "Bohemian",
  "Coastal", "Farmhouse", "Mid-Century Modern", "Rustic"
];

const MoodboardRenderForm: React.FC = () => {
  const [image1File, setImage1File] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [image1PreviewDataUri, setImage1PreviewDataUri] = useState<string | null>(null);
  const [image2File, setImage2File] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [image2PreviewDataUri, setImage2PreviewDataUri] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [outputSize, setOutputSize] = useState<string>("1024x576");
  const [architecturalStyle, setArchitecturalStyle] = useState<string>(architecturalStyleOptions[0]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImage1Upload = (file: File | null, dataUri: string | null) => {
    setImage1File(file);
    setImage1PreviewDataUri(dataUri); // Keep for potential direct preview if needed
    setGeneratedImageUrl(null); // Clear previous results
    setError(null);
  };

  const handleImage2Upload = (file: File | null, dataUri: string | null) => {
    setImage2File(file);
    setImage2PreviewDataUri(dataUri); // Keep for potential direct preview if needed
    setGeneratedImageUrl(null); // Clear previous results
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    if (!image1File) {
      setError("Please upload the first inspiration image.");
      setIsLoading(false);
      return;
    }
    if (!image2File) {
      setError("Please upload the second inspiration image.");
      setIsLoading(false);
      return;
    }
    if (!projectName.trim()) {
      setError("Please enter a project name for your moodboard.");
      setIsLoading(false);
      return;
    }

    const userId = "test-user-moodboard-render"; // Placeholder for actual user ID
    let uploadedImage1Path: string | null = null;
    let uploadedImage1Url: string | null = null;
    let uploadedImage2Path: string | null = null;
    let uploadedImage2Url: string | null = null;

    try {
      // 1. Upload Image 1
      const upload1Result = await uploadFile(userId, image1File, "moodboard_inputs");
      uploadedImage1Url = upload1Result.downloadURL;
      uploadedImage1Path = upload1Result.filePath;

      // 2. Upload Image 2
      try {
        const upload2Result = await uploadFile(userId, image2File, "moodboard_inputs");
        uploadedImage2Url = upload2Result.downloadURL;
        uploadedImage2Path = upload2Result.filePath;
      } catch (upload2Error: any) {
        // If image 2 upload fails, delete image 1 from storage
        if (uploadedImage1Path) {
          await deleteFileByPath(uploadedImage1Path);
          console.log("Cleaned up image 1 (path: " + uploadedImage1Path + ") due to image 2 upload failure.");
        }
        throw new Error(`Failed to upload the second image: ${upload2Error.message}`);
      }
      
      // 3. Call AI Flow (Action)
      // This assumes `handleMoodboardRender` in `src/lib/actions.ts`
      // has been updated to accept `image1Url` and `image2Url`.
      const aiInput = {
        image1Url: uploadedImage1Url, // Pass URL
        image2Url: uploadedImage2Url, // Pass URL
        aspectRatio,
        outputSize,
        architecturalStyle,
      };
      console.log("Calling AI flow (handleMoodboardRender) with input:", aiInput);
      
      const aiResult = await handleMoodboardRender(aiInput);
      // MOCK AI RESULT - Remove this block when `handleMoodboardRender` is fully implemented
      // await new Promise(resolve => setTimeout(resolve, 3000));
      // const mockGeneratedImage = `https://picsum.photos/seed/${Math.random()}/${outputSize.split('x')[0]}/${outputSize.split('x')[1]}?random&moodboard=${encodeURIComponent(projectName)}`;
      // const aiResult = { imageUrl: mockGeneratedImage, error: null }; // Mock success
      // const aiResult = { imageUrl: null, error: "Mock AI moodboard processing failed." }; // Mock failure for testing
      // MOCK END

      if (aiResult.error || !aiResult.imageUrl) {
        throw new Error(aiResult.error || "AI processing failed to return an image URL for the moodboard.");
      }
      const aiGeneratedImageUrl = aiResult.imageUrl;

      // 4. Save Moodboard Project to Firestore
      try {
        await addMoodboardProject(userId, {
          name: projectName,
          inputImageUrls: [uploadedImage1Url, uploadedImage2Url],
          generatedImageUrl: aiGeneratedImageUrl,
          parameters: {
            aspectRatio,
            outputSize,
            architecturalStyle,
            inputImage1Path: uploadedImage1Path, // Store paths for reference/cleanup
            inputImage2Path: uploadedImage2Path,
          },
        });
      } catch (firestoreError: any) {
        console.error("Error saving moodboard project to Firestore:", firestoreError);
        setError(
          "Moodboard generated successfully, but failed to save the project. You can try saving it manually if needed."
        );
        // Don't stop, image is generated and can be displayed.
      }

      setGeneratedImageUrl(aiGeneratedImageUrl);

    } catch (err: any) {
      console.error("Moodboard Render process error:", err);
      setError(err.message || "An unexpected error occurred during the moodboard generation process.");
      // Cleanup uploaded files if an error occurred at any step after their respective uploads
      if (uploadedImage1Path && !uploadedImage1Url?.includes("picsum.photos")) { // Don't delete mock images
        try { await deleteFileByPath(uploadedImage1Path); console.log("Cleaned up image 1 after error:", uploadedImage1Path); }
        catch (cleanupError) { console.error("Failed to clean up image 1:", cleanupError); }
      }
      if (uploadedImage2Path && !uploadedImage2Url?.includes("picsum.photos")) { // Don't delete mock images
        try { await deleteFileByPath(uploadedImage2Path); console.log("Cleaned up image 2 after error:", uploadedImage2Path); }
        catch (cleanupError) { console.error("Failed to clean up image 2:", cleanupError); }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamically parse width and height for the Image component
  const [imgWidth, imgHeight] = outputSize.split("x").map(Number);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center">Create Your Moodboard</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-lg shadow-xl">
        
        <div>
          <Label htmlFor="project-name" className="block text-sm font-medium mb-1">Project Name</Label>
          <Input
            id="project-name"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., My Dream Living Room"
            className="w-full"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUploader
            onFileUpload={handleImage1Upload}
            id="moodboard-image1-upload"
            label="Upload Inspiration Image 1"
            accept="image/*"
          />
          <FileUploader
            onFileUpload={handleImage2Upload}
            id="moodboard-image2-upload"
            label="Upload Inspiration Image 2"
            accept="image/*"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="architectural-style" className="block text-sm font-medium mb-1">Architectural Style</Label>
            <Select value={architecturalStyle} onValueChange={setArchitecturalStyle} disabled={isLoading}>
              <SelectTrigger id="architectural-style"><SelectValue placeholder="Select style" /></SelectTrigger>
              <SelectContent>
                {architecturalStyleOptions.map(style => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="aspect-ratio" className="block text-sm font-medium mb-1">Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isLoading}>
              <SelectTrigger id="aspect-ratio"><SelectValue placeholder="Select ratio" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                <SelectItem value="4:3">4:3 (Standard)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="output-size" className="block text-sm font-medium mb-1">Output Size</Label>
            <Select value={outputSize} onValueChange={setOutputSize} disabled={isLoading}>
              <SelectTrigger id="output-size"><SelectValue placeholder="Select size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1024x576">1024x576 (16:9)</SelectItem>
                <SelectItem value="1024x1024">1024x1024 (1:1)</SelectItem>
                <SelectItem value="576x1024">576x1024 (9:16)</SelectItem>
                <SelectItem value="1024x768">1024x768 (4:3)</SelectItem>
                <SelectItem value="2048x1152">2048x1152 (16:9 HD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full py-3 text-lg" 
          disabled={isLoading || !image1File || !image2File || !projectName.trim()}
        >
          {isLoading ? "Generating Moodboard..." : "Generate Moodboard"}
        </Button>
      </form>

      {isLoading && (
        <div className="text-center py-6">
          <LoadingSpinner size="lg" /> {/* Use the imported graphical spinner */}
          <p className="text-muted-foreground mt-2">Please wait, this is an intensive process.</p>
        </div>
      )}
      
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <h3 className="font-semibold">Error Generating Moodboard</h3>
          <p>{error}</p>
        </div>
      )}
      
      {generatedImageUrl && !isLoading && (
        <div className="mt-10 p-6 border rounded-lg shadow-xl bg-card">
          <h3 className="text-3xl font-semibold mb-6 text-center">Your Generated Moodboard:</h3>
          <div className="flex justify-center items-center bg-muted/30 p-4 rounded-md">
            <Image
              src={generatedImageUrl}
              alt={`Generated Moodboard for ${projectName}`}
              width={imgWidth || 1024} 
              height={imgHeight || 576}
              className="rounded-md border-2 border-primary/20 shadow-lg"
              priority
            />
          </div>
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => window.open(generatedImageUrl, '_blank')}>
              Open Full Size Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodboardRenderForm;
