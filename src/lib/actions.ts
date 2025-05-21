"use server";

import { sketchToRender, type SketchToRenderInput, type SketchToRenderOutput } from "@/ai/flows/sketch-to-render";
import { moodboardRender, type MoodboardRenderInput, type MoodboardRenderOutput } from "@/ai/flows/moodboard-render";
import { textToRender, type TextToRenderInput, type TextToRenderOutput } from "@/ai/flows/text-to-render";
import { suggestStyle, type StyleSuggestionInput, type StyleSuggestionOutput } from "@/ai/flows/style-suggestion";

export async function handleSketchToRender(input: SketchToRenderInput): Promise<SketchToRenderOutput> {
  try {
    // Validate or sanitize input if necessary
    if (!input.sketchDataUri || !input.aspectRatio || !input.outputSize) {
        throw new Error("Missing required fields for sketch to render.");
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
     if (!input.image1DataUri || !input.image2DataUri || !input.aspectRatio || !input.outputSize || !input.architecturalStyle) {
        throw new Error("Missing required fields for moodboard render.");
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
