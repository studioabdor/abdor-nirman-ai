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
  image1DataUri: z
    .string()
    .describe(
      "The first image to merge, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  image2DataUri: z
    .string()
    .describe(
      "The second image to merge, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  aspectRatio: z.string().optional().describe('The aspect ratio of the output image.'),
  outputSize: z.string().optional().describe('The desired output size of the image.'),
  architecturalStyle: z.string().optional().describe('The architectural style to apply to the merged image.'),
});

export type MoodboardRenderInput = z.infer<typeof MoodboardRenderInputSchema>;

const MoodboardRenderOutputSchema = z.object({
  mergedImageDataUri: z
    .string()
    .describe("The merged image, as a data URI with MIME type and Base64 encoding."),
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

  Image 1: {{media url=image1DataUri}}
  Image 2: {{media url=image2DataUri}}
  Architectural Style: {{{architecturalStyle}}}
  Aspect Ratio: {{{aspectRatio}}}
  Output Size: {{{outputSize}}}

  Return the merged image as a data URI.
  `,
});

const moodboardRenderFlow = ai.defineFlow(
  {
    name: 'moodboardRenderFlow',
    inputSchema: MoodboardRenderInputSchema,
    outputSchema: MoodboardRenderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
