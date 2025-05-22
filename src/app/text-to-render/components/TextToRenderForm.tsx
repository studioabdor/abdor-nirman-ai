"use client";

import React, { useState, useEffect } from "react"; // Ensure useEffect is imported
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

// --- Define Size Options Data Structure (same as SketchToRenderForm) ---
const aspectRatioOptions = [
  { value: "16:9", label: "16:9 (Widescreen)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "4:3", label: "4:3 (Standard)" },
  { value: "3:2", label: "3:2 (Photography)" }, // Added 3:2 as it was in original options
  { value: "3:4", label: "3:4 (Tall)" },
];

const outputSizesByAspect: Record<string, Array<{ label: string, width: number, height: number }>> = {
  "16:9": [
    { label: "1024x576", width: 1024, height: 576 },
    { label: "1280x720 (HD)", width: 1280, height: 720 },
    { label: "1920x1080 (Full HD)", width: 1920, height: 1080 },
    { label: "2048x1152 (2K)", width: 2048, height: 1152 },
  ],
  "1:1": [
    { label: "1024x1024", width: 1024, height: 1024 },
    { label: "512x512", width: 512, height: 512 },
    { label: "2048x2048 (2K)", width: 2048, height: 2048 },
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
   "3:2": [ // Added sizes for 3:2
    { label: "1024x680", width: 1024, height: 680 },
    { label: "1280x854", width: 1280, height: 854 },
  ],
  "3:4": [
    { label: "768x1024", width: 768, height: 1024 },
    { label: "600x800", width: 600, height: 800 },
  ],
};
// --- End Size Options Data Structure ---

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
  
  // --- Updated State Variables for Aspect Ratio and Output Size ---
  const defaultAspectRatio = aspectRatioOptions[0].value; // "16:9"
  const defaultSizesForAspectRatio = outputSizesByAspect[defaultAspectRatio];
  const defaultOutputSizeString = defaultSizesForAspectRatio[0].label; // e.g., "1024x576"

  const [aspectRatio, setAspectRatio] = useState<string>(defaultAspectRatio);
  const [availableOutputSizes, setAvailableOutputSizes] = useState(defaultSizesForAspectRatio);
  const [selectedOutputSize, setSelectedOutputSize] = useState<string>(defaultOutputSizeString);
  // --- End Updated State Variables ---

  const [architecturalStyle, setArchitecturalStyle] = useState<string>(architecturalStyleOptions[0]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- useEffect for Dynamic Updates ---
  useEffect(() => {
    const newAvailableSizes = outputSizesByAspect[aspectRatio];
    setAvailableOutputSizes(newAvailableSizes);
    if (newAvailableSizes && newAvailableSizes.length > 0) {
      // Check if the current selectedOutputSize is valid for the new aspect ratio
      const currentSelectionIsValid = newAvailableSizes.some(size => size.label === selectedOutputSize);
      if (!currentSelectionIsValid) {
        setSelectedOutputSize(newAvailableSizes[0].label); // Set to the first available size
      }
    } else {
      setSelectedOutputSize(""); // No sizes available
    }
  }, [aspectRatio, selectedOutputSize]); // selectedOutputSize in deps to re-validate if changed externally
  // --- End useEffect for Dynamic Updates ---

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
      // Ensure aspectRatioOptions has the value before setting
      if (suggestion.parameters.aspectRatio && 
          typeof suggestion.parameters.aspectRatio === 'string' &&
          aspectRatioOptions.some(opt => opt.value === suggestion.parameters.aspectRatio)) {
        setAspectRatio(suggestion.parameters.aspectRatio);
      }
      // Add more parameter handling as needed for width/height if AI suggests specific pixel values
      // For example, if AI returns parameters.width and parameters.height:
      // We would need to find a matching label in outputSizesByAspect or handle custom sizes.
      // This is more complex and for now, we'll stick to AR and let useEffect handle size selection.
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

    const selectedSizeObject = availableOutputSizes.find(size => size.label === selectedOutputSize);
    if (!selectedSizeObject) {
      setError("Please select a valid output size.");
      setIsLoading(false);
      return;
    }
    const { width, height } = selectedSizeObject;

    const aiInput = {
      textDescription,
      aspectRatio,
      width, // Pass numerical width
      height, // Pass numerical height
      architecturalStyle,
    };

    try {
      console.log("Calling AI flow (handleTextToRender) with input:", aiInput);
      const aiResult = await handleTextToRender(aiInput);

      // MOCK AI RESULT - Remove this block when `handleTextToRender` is fully implemented
      // await new Promise(resolve => setTimeout(resolve, 2500)); 
      // const mockGeneratedImage = `https://picsum.photos/seed/${Math.random()}/${width}/${height}?random&description=${encodeURIComponent(textDescription)}`;
      // const aiResult = { imageUrl: mockGeneratedImage, error: null }; 
      // MOCK END

      if (aiResult.error || !aiResult.imageUrl) {
        throw new Error(aiResult.error || "AI processing failed to return an image URL.");
      }
      
      const aiGeneratedImageUrl = aiResult.imageUrl;

      try {
        await addGeneratedImage(userId, {
          type: "text-to-image",
          prompt: textDescription, 
          generatedImageUrl: aiGeneratedImageUrl,
          parameters: {
            aspectRatio,
            width, // Save numerical width
            height, // Save numerical height
            outputSizeLabel: selectedOutputSize, // Optionally save the label
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
  const currentOutputDimensions = availableOutputSizes.find(s => s.label === selectedOutputSize) || { width: 1024, height: 576 };
  const imgWidth = currentOutputDimensions.width;
  const imgHeight = currentOutputDimensions.height;

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
                {aspectRatioOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
            <Label htmlFor="output-size" className="block text-sm font-medium mb-1">Output Size:</Label>
            <Select 
              value={selectedOutputSize} 
              onValueChange={setSelectedOutputSize} 
              disabled={isLoading || (availableOutputSizes && availableOutputSizes.length === 0)}
            >
              <SelectTrigger id="output-size">
                <SelectValue placeholder="Select output size" />
              </SelectTrigger>
              <SelectContent>
                {availableOutputSizes && availableOutputSizes.map((size) => (
                  <SelectItem key={size.label} value={size.label}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !textDescription.trim() || !selectedOutputSize}>
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
