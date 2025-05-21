'use server';

/**
 * @fileOverview Text to Render AI Flow.
 *
 * This file defines a Genkit flow that takes a text description and generates an image based on it.
 * It includes the flow definition, input and output schemas, and a wrapper function.
 *
 * - textToRender - A function that handles the text to render process.
 * - TextToRenderInput - The input type for the textToRender function.
 * - TextToRenderOutput - The return type for the textToRender function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import Replicate from 'replicate';

const TextToRenderInputSchema = z.object({
  textDescription: z
    .string()
    .describe('A detailed text description of the image to generate.'),
  aspectRatio: z
    .string()
    .optional()
    .describe('The aspect ratio of the generated image (e.g., 16:9, 1:1).'),
  outputSize: z
    .string()
    .optional()
    .describe('The desired output size of the image (e.g., 1024x768).'),
  architecturalStyle: z
    .string()
    .optional()
    .describe('The architectural style to use for the image (e.g., modern, Victorian).'),
});

export type TextToRenderInput = z.infer<typeof TextToRenderInputSchema>;

const TextToRenderOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image.'),
});

export type TextToRenderOutput = z.infer<typeof TextToRenderOutputSchema>;

export async function textToRender(input: TextToRenderInput): Promise<TextToRenderOutput> {
  return textToRenderFlow(input);
}

const textToRenderPrompt = ai.definePrompt({
  name: 'textToRenderPrompt',
  input: {schema: TextToRenderInputSchema},
  output: {schema: TextToRenderOutputSchema},
  prompt: `Generate an image based on the following description: {{{textDescription}}}.

  {% if aspectRatio %}Aspect Ratio: {{{aspectRatio}}}.{% endif %}
  {% if outputSize %}Output Size: {{{outputSize}}}.{% endif %}
  {% if architecturalStyle %}Architectural Style: {{{architecturalStyle}}}.{% endif %}`,
});

const textToRenderFlow = ai.defineFlow(
  {
    name: 'textToRenderFlow',
    inputSchema: TextToRenderInputSchema,
    outputSchema: TextToRenderOutputSchema,
  },
  async input => {
    const replicate = new Replicate({
      // The API token is automatically picked up from the REPLICATE_API_TOKEN environment variable
      // configured in src/ai/genkit.ts
    });

    const replicateInput = {
      prompt: input.textDescription,
      num_outputs: 1, // We only need one image for this flow
      aspect_ratio: input.aspectRatio || "16:9", // Use provided aspect ratio or default
      // Assuming default values for guidance_scale and output_quality as provided
      guidance_scale: 3.5,
      output_quality: 100,
      // Include architectural style if provided
      ...(input.architecturalStyle && { architectural_style: input.architecturalStyle }),
    };

    const output = await replicate.run("davisbrown/designer-architecture:0d6f0893b05f14500ce03e45f54290cbffb907d14db49699f2823d0fd35def46", { input: replicateInput }) as string[];

    return { imageUrl: output[0] }; // Assuming the output is an array of URLs
  }
);