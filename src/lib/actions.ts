"use server";

import { sketchToRender, type SketchToRenderInput, type SketchToRenderOutput } from "@/ai/flows/sketch-to-render";
import { moodboardRender, type MoodboardRenderInput, type MoodboardRenderOutput } from "@/ai/flows/moodboard-render";
import { textToRender, type TextToRenderInput, type TextToRenderOutput } from "@/ai/flows/text-to-render";
import { suggestStyle, type StyleSuggestionInput, type StyleSuggestionOutput } from "@/ai/flows/style-suggestion";
import { enhanceDetailsFlow, type EnhanceDetailsInput, type EnhanceDetailsOutput } from "@/ai/flows/enhance-details";

export async function handleSketchToRender(input: SketchToRenderInput): Promise<SketchToRenderOutput> {
  try {
    // Validate or sanitize input if necessary
    if (!input.sketchUrl || !input.aspectRatio || !input.outputSize) { // Changed sketchDataUri to sketchUrl
        throw new Error("Missing required fields for sketch to render. Ensure sketchUrl, aspectRatio, and outputSize are provided.");
    }
    // Ensure sketchUrl is a valid URL (basic check)
    try {
      new URL(input.sketchUrl);
    } catch (_) {
      throw new Error("Invalid sketchUrl provided.");
    }
    
    return await sketchToRender(input);
  } catch (error) {
    console.error("Error in handleSketchToRender:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during sketch rendering.";
    // It's better to throw a new error or return a structured error response
    // For now, re-throwing to be caught by the client.
    throw new Error(`Sketch rendering failed: ${errorMessage}`);
  }
}

export async function handleMoodboardRender(input: MoodboardRenderInput): Promise<MoodboardRenderOutput> {
  try {
    // Validate or sanitize input if necessary
    // Optional fields like aspectRatio, outputSize, architecturalStyle are not strictly required here,
    // but the AI flow might have its own defaults or requirements.
    if (!input.image1Url || !input.image2Url) {
        throw new Error("Missing required fields for moodboard render. Ensure image1Url and image2Url are provided.");
    }
    // Ensure URLs are valid (basic check)
    try {
      new URL(input.image1Url);
      new URL(input.image2Url);
    } catch (_) {
      throw new Error("Invalid URL provided for one or both images.");
    }

    return await moodboardRender(input);
  } catch (error) {
    console.error("Error in handleMoodboardRender:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during moodboard rendering.";
    throw new Error(`Moodboard rendering failed: ${errorMessage}`);
  }
}

export async function handleTextToRender(input: TextToRenderInput): Promise<TextToRenderOutput> {
  try {
    if (!input.textDescription) {
        throw new Error("Missing text description for text to render.");
    }
    return await textToRender(input);
  } catch (error) {
    console.error("Error in handleTextToRender:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during text to image generation.";
    throw new Error(`Text to image generation failed: ${errorMessage}`);
  }
}

export async function handleStyleSuggestion(input: StyleSuggestionInput): Promise<StyleSuggestionOutput> {
  try {
    if (!input.currentInput || !input.pastProjects) {
        throw new Error("Missing required fields for style suggestion.");
    }
    return await suggestStyle(input);
  } catch (error) {
    console.error("Error in handleStyleSuggestion:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while suggesting styles.";
    throw new Error(`Style suggestion failed: ${errorMessage}`);
  }
}

export async function handleEnhanceDetails(input: EnhanceDetailsInput): Promise<EnhanceDetailsOutput> {
  try {
    // Validate or sanitize input if necessary.
    // The input object should conform to EnhanceDetailsInput type which is inferred from Zod schema.
    // Zod parsing/validation can be done here explicitly if desired,
    // but Genkit flows also validate inputs against their schema.
    if (!input.imageUrl) {
      throw new Error("Missing required 'imageUrl' field for enhancing details.");
    }
    try {
      new URL(input.imageUrl);
    } catch (_) {
      throw new Error("Invalid imageUrl provided for enhancement.");
    }
    // Optional: Validate scaleFactor if it's part of the input and has specific constraints
    // not covered by the Zod schema's default/optional settings (e.g. if it was not optional).
    if (input.scaleFactor !== undefined && (input.scaleFactor < 1 || input.scaleFactor > 10)) {
        throw new Error("scaleFactor must be between 1 and 10.");
    }


    return await enhanceDetailsFlow(input);
  } catch (error: any) {
    console.error("Error in handleEnhanceDetails:", error);
    // Use the error message from the flow if it's a custom error, otherwise provide a generic one.
    const errorMessage = error.message || "An unknown error occurred during image enhancement.";
    // Re-throw the error to be caught by the client-side calling function.
    // It's important that the client can receive this error.
    throw new Error(`${errorMessage}`); // Removed "Image enhancement failed: " prefix as flow should provide good error.
  }
}
