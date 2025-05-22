"use client";

import React, { useState } from "react";
import StyleSuggestionWidget from "@/app/style-suggestion/components/StyleSuggestionWidget";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { addGeneratedImage } from "@/lib/firestoreService";
import { handleTextToRender } from "@/lib/actions"; // Assuming this is the correct action

// Placeholder for LoadingSpinner, replace with actual component if available
// For now, using a simple text loading indicator.
// import LoadingSpinner from "@/components/shared/LoadingSpinner"; // Original comment
import LoadingSpinner from "@/components/shared/LoadingSpinner"; // Correctly import the shared component

const architecturalStyleOptions = [
  "Modern",
  "Minimalist",
  "Brutalist",
  "Classical",
  "Art Deco",
  "Contemporary",
  "Futuristic",
  "Industrial",
  "Scandinavian",
  "Bohemian",
];

const TextToRenderForm: React.FC = () => {
  const [textDescription, setTextDescription] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [outputSize, setOutputSize] = useState<string>("1024x576"); // Default to a 16:9 size
  const [architecturalStyle, setArchitecturalStyle] = useState<string>(architecturalStyleOptions[0]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Style Suggestion Integration ---
  const [showStyleAdvisor, setShowStyleAdvisor] = useState<boolean>(false);

  const handleApplySuggestionInForm = (suggestion: {
    style?: string;
    enhancements?: string;
    parameters?: Record<string, any>;
  }) => {
    console.log("Applying suggestion to TextToRenderForm:", suggestion);
    if (suggestion.style) {
      // Check if the suggested style is one of the predefined options
      const matchedStyle = architecturalStyleOptions.find(
        (opt) => opt.toLowerCase() === suggestion.style?.toLowerCase()
      );
      if (matchedStyle) {
        setArchitecturalStyle(matchedStyle);
      } else {
        // If not a direct match, prepend/append to description or handle as new style
        setTextDescription(prev => `${prev} (Suggested style: ${suggestion.style})`.trim());
      }
    }
    if (suggestion.enhancements) {
      // Append enhancements to the text description
      setTextDescription(prev => `${prev} ${suggestion.enhancements}`.trim());
    }
    if (suggestion.parameters) {
      // Example: If AI suggests specific aspect ratio
      if (suggestion.parameters.aspectRatio && typeof suggestion.parameters.aspectRatio === 'string') {
        // Basic validation, could be more robust
        if (["16:9", "1:1", "9:16", "4:3", "3:2"].includes(suggestion.parameters.aspectRatio)) {
            setAspectRatio(suggestion.parameters.aspectRatio);
        }
      }
      // Add more parameter handling as needed
    }
    setShowStyleAdvisor(false); // Close advisor after applying
    alert("Suggestion applied to form fields (style and/or description updated).");
  };
  // --- End Style Suggestion Integration ---


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null); // Clear previous image

    if (!textDescription.trim()) {
      setError("Please enter a description for your render.");
      setIsLoading(false);
      return;
    }

    const userId = "test-user-text-to-render"; // Placeholder for actual user ID

    const aiInput = {
      textDescription,
      aspectRatio,
      outputSize,
      architecturalStyle,
      // The backend `handleTextToRender` action and the `textToRender` AI flow
      // will be responsible for mapping these fields to the specific AI model's requirements.
      // For example, `textDescription` might become `prompt`.
    };

    try {
      console.log("Calling AI flow (handleTextToRender) with input:", aiInput);
      const aiResult = await handleTextToRender(aiInput);

      // MOCK AI RESULT - Remove this block when `handleTextToRender` is fully implemented
      // await new Promise(resolve => setTimeout(resolve, 2500)); 
      // const mockGeneratedImage = `https://picsum.photos/seed/${Math.random()}/${outputSize.split('x')[0]}/${outputSize.split('x')[1]}?random&description=${encodeURIComponent(textDescription)}`;
      // const aiResult = { imageUrl: mockGeneratedImage, error: null }; 
      // MOCK END

      if (aiResult.error || !aiResult.imageUrl) {
        throw new Error(aiResult.error || "AI processing failed to return an image URL.");
      }
      
      const aiGeneratedImageUrl = aiResult.imageUrl;

      try {
        await addGeneratedImage(userId, {
          type: "text-to-image",
          prompt: textDescription, // Save the original text description as prompt
          generatedImageUrl: aiGeneratedImageUrl,
          parameters: {
            aspectRatio,
            outputSize,
            architecturalStyle,
          },
        });
      } catch (firestoreError) {
        console.error("Error saving to Firestore:", firestoreError);
        setError(
          "Image generated successfully, but failed to save to your gallery. You can try saving it manually."
        );
        // Don't stop, image is generated. The user can see it.
      }

      setGeneratedImageUrl(aiGeneratedImageUrl);

    } catch (err: any) {
      console.error("Text to Render process error:", err);
      setError(err.message || "An unexpected error occurred during the text to render process.");
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamically parse width and height for the Image component
  const [imgWidth, imgHeight] = outputSize.split("x").map(Number);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6"> {/* Increased max-width for potential widget */}
      <h1 className="text-3xl font-bold text-center">Text to Render</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg shadow md:col-span-2">
          <div>
            <Label htmlFor="text-description" className="block text-sm font-medium mb-1">
              Describe Your Vision
            </Label>
          <Textarea
            id="text-description"
            value={textDescription}
            onChange={(e) => setTextDescription(e.target.value)}
            placeholder="e.g., A bright, modern living room with large windows and a view of the city skyline, featuring minimalist furniture and indoor plants."
            rows={5}
            className="w-full"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="architectural-style" className="block text-sm font-medium mb-1">Architectural Style:</Label>
            <Select value={architecturalStyle} onValueChange={setArchitecturalStyle} disabled={isLoading}>
              <SelectTrigger id="architectural-style">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {architecturalStyleOptions.map(style => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                <SelectItem value="3:2">3:2 (Photography)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
            <Label htmlFor="output-size" className="block text-sm font-medium mb-1">Output Size:</Label>
            <Select value={outputSize} onValueChange={setOutputSize} disabled={isLoading}>
              <SelectTrigger id="output-size">
                <SelectValue placeholder="Select output size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1024x576">1024x576 (16:9)</SelectItem>
                <SelectItem value="1024x1024">1024x1024 (1:1)</SelectItem>
                <SelectItem value="576x1024">576x1024 (9:16)</SelectItem>
                <SelectItem value="1024x768">1024x768 (4:3)</SelectItem>
                <SelectItem value="1024x680">1024x680 (3:2)</SelectItem>
                <SelectItem value="2048x1152">2048x1152 (16:9 HD)</SelectItem>
                <SelectItem value="2048x2048">2048x2048 (1:1 HD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !textDescription.trim()}>
            {isLoading ? "Generating Your Image..." : "Generate Image"}
          </Button>
        </form>

        {/* Style Suggestion Widget Area */}
        <div className="md:col-span-1 space-y-4">
            <Button 
                variant="outline" 
                onClick={() => setShowStyleAdvisor(!showStyleAdvisor)}
                className="w-full"
            >
                {showStyleAdvisor ? "Hide" : "Show"} AI Style Advisor
            </Button>
            {showStyleAdvisor && (
                <StyleSuggestionWidget
                    currentTextPrompt={textDescription}
                    onApplySuggestion={handleApplySuggestionInForm}
                />
            )}
        </div>
      </div>


      {/* Results Area (moved outside the form but within the main div) */}
      {isLoading && (
        <div className="text-center py-4">
          <LoadingSpinner size="lg" /> {/* Use the imported graphical spinner */}
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
              alt="Generated from text description"
              width={imgWidth || 1024} 
              height={imgHeight || 576}
              className="rounded-md border-2 border-muted"
              priority 
            />
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => window.open(generatedImageUrl, '_blank')}>
              Open Full Size
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Need to import StyleSuggestionWidget at the top of the file
// import StyleSuggestionWidget from "@/app/style-suggestion/components/StyleSuggestionWidget";
// This comment indicates where the import should be. The actual tool call will add it.

export default TextToRenderForm;
