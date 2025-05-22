// Define types and implement the Genkit flow for merging two images using AI.

'use server';

/**
 * @fileOverview An AI agent that merges two images into a new realistic image, exploring different architectural styles and combinations.
 *
 * - moodboardRender - A function that handles the image merging process.
 * - MoodboardRenderInput - The input type for the moodboardRender function.
 * - MoodboardRenderOutput - The return type for the moodboardRender function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoodboardRenderInputSchema = z.object({
  image1Url: z
    .string()
    .url()
    .describe("The public URL of the first image to merge."),
  image2Url: z
    .string()
    .url()
    .describe("The public URL of the second image to merge."),
  aspectRatio: z.string().optional().describe('The aspect ratio of the output image (e.g., "16:9").'),
  width: z.number().int().positive().optional().describe("The desired width of the merged image in pixels."),
  height: z.number().int().positive().optional().describe("The desired height of the merged image in pixels."),
  architecturalStyle: z.string().optional().describe('The architectural style to apply to the merged image.'),
});

export type MoodboardRenderInput = z.infer<typeof MoodboardRenderInputSchema>;

const MoodboardRenderOutputSchema = z.object({
  imageUrl: z
    .string()
    .url()
    .describe("The URL of the merged image."),
});

export type MoodboardRenderOutput = z.infer<typeof MoodboardRenderOutputSchema>;

export async function moodboardRender(input: MoodboardRenderInput): Promise<MoodboardRenderOutput> {
  return moodboardRenderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moodboardRenderPrompt',
  input: {schema: MoodboardRenderInputSchema},
  output: {schema: MoodboardRenderOutputSchema},
  prompt: `You are an AI that merges two images into a new realistic image, considering architectural styles and combinations.

  Merge the two images provided, applying the specified architectural style, aspect ratio, width, and height.

  Image 1: {{media url=image1Url}}
  Image 2: {{media url=image2Url}}
  Architectural Style: {{{architecturalStyle}}}
  Aspect Ratio: {{{aspectRatio}}}
  Width: {{{width}}}
  Height: {{{height}}}

  Return the merged image as a public URL.
  `,
});

const moodboardRenderFlow = ai.defineFlow(
  {
    name: 'moodboardRenderFlow',
    inputSchema: MoodboardRenderInputSchema,
    outputSchema: MoodboardRenderOutputSchema,
  },
  async (input: MoodboardRenderInput) => {
    const { image1Url, image2Url, aspectRatio, width, height, architecturalStyle } = input;

    if (aspectRatio && width && height) {
      const [arWidth, arHeight] = aspectRatio.split(':').map(Number);
      if (Math.abs(width / height - arWidth / arHeight) > 0.01) {
        throw new Error(
          `The provided width (${width}) and height (${height}) do not match the aspect ratio (${aspectRatio}).`
        );
      }
    }

    // The current moodboardRenderFlow uses a Genkit prompt.
    // The prompt is updated to include width and height.
    // We assume the underlying model called by `ai.definePrompt` can interpret these
    // parameters from the prompt context.
    // If this flow were directly calling Replicate, we'd pass width/height to Replicate input.
    // Since it's a generic prompt, we ensure the input to the prompt includes width and height.
    
    const promptInput = {
        image1Url,
        image2Url,
        aspectRatio,
        width, // Pass width to the prompt
        height, // Pass height to the prompt
        architecturalStyle,
    };

    try {
        const { output } = await prompt(promptInput); // Pass validated and structured input
        if (!output?.imageUrl) {
            console.error("AI (moodboard prompt) did not return an image URL.", output);
            throw new Error("AI (moodboard prompt) did not return a valid image URL.");
        }
        return output; // output is already { imageUrl: "..." }
    } catch (error: any) {
        console.error("Error in moodboardRenderFlow calling prompt:", error);
        const errorMessage = error.message || "Failed to generate moodboard image via AI prompt.";
        throw new Error(`Moodboard generation failed: ${errorMessage}`);
    }
  }
);
