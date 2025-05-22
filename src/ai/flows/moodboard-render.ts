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
  aspectRatio: z.string().optional().describe('The aspect ratio of the output image.'),
  outputSize: z.string().optional().describe('The desired output size of the image.'),
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

  Merge the two images provided, applying the specified architectural style, aspect ratio, and output size.

  Image 1: {{media url=image1Url}}
  Image 2: {{media url=image2Url}}
  Architectural Style: {{{architecturalStyle}}}
  Aspect Ratio: {{{aspectRatio}}}
  Output Size: {{{outputSize}}}

  Return the merged image as a public URL.
  `,
});

const moodboardRenderFlow = ai.defineFlow(
  {
    name: 'moodboardRenderFlow',
    inputSchema: MoodboardRenderInputSchema,
    outputSchema: MoodboardRenderOutputSchema,
  },
  async input => {
    // The prompt itself is expected to return a URL if the underlying model supports it.
    // If the model used by `prompt(input)` (e.g., a specific Genkit model plugin)
    // inherently outputs image URLs when provided with media URLs, this is fine.
    // Otherwise, if it still produced a data URI, conversion would be needed here.
    // For now, assuming the AI model connected to `prompt` handles this correctly
    // and its output aligns with `MoodboardRenderOutputSchema` (i.e., returns an imageUrl).
    const {output} = await prompt(input);
    if (!output?.imageUrl) {
      // This check is a bit redundant if the output schema is enforced by Genkit,
      // but good for clarity. The actual validation against the schema is done by Genkit.
      console.error("AI did not return an image URL for moodboard.", output);
      throw new Error("AI did not return a valid image URL for the moodboard.");
    }
    return output; // output is already { imageUrl: "..." }
  }
);
