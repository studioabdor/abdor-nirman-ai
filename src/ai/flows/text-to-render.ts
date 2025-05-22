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
    .describe('The aspect ratio of the generated image (e.g., "16:9", "1:1").'),
  width: z.number().int().positive().describe("The desired width of the generated image in pixels."),
  height: z.number().int().positive().describe("The desired height of the generated image in pixels."),
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
  Width: {{{width}}}
  Height: {{{height}}}
  {% if architecturalStyle %}Architectural Style: {{{architecturalStyle}}}.{% endif %}`,
});

const textToRenderFlow = ai.defineFlow(
  {
    name: 'textToRenderFlow',
    inputSchema: TextToRenderInputSchema,
    outputSchema: TextToRenderOutputSchema,
  },
  async input => {
    const { textDescription, aspectRatio, width, height, architecturalStyle } = input;

    if (aspectRatio) {
      const [arWidth, arHeight] = aspectRatio.split(':').map(Number);
      if (Math.abs(width / height - arWidth / arHeight) > 0.01) {
        throw new Error(
          `The provided width (${width}) and height (${height}) do not match the aspect ratio (${aspectRatio}).`
        );
      }
    }

    const replicate = new Replicate();

    // Model ai-forever/kandinsky-2.2 accepts width and height directly.
    // It's important that width and height are multiples of 64 for this model.
    // This validation should ideally happen in the Zod schema or client-side,
    // but a runtime check can be added here if necessary.
    if (width % 64 !== 0 || height % 64 !== 0) {
        console.warn(`Kandinsky-2.2 model prefers width and height to be multiples of 64. Received: ${width}x${height}`);
        // Optionally, adjust to nearest multiple or throw error, depending on desired strictness.
        // For now, we'll pass them as is, but the model might error or adjust them.
    }

    const replicateInput: any = {
      prompt: architecturalStyle ? `${textDescription}, ${architecturalStyle} style` : textDescription,
      num_outputs: 1,
      width: width,
      height: height,
      // Other parameters for Kandinsky 2.2 if needed:
      // guidance_scale: 4,
      // h_upscale: 1, // upscale factor
      // w_upscale: 1, // upscale factor
      // num_inference_steps: 75,
    };
    
    // The model 'ai-forever/kandinsky-2.2' (version: 'ea1addaab376f4dc227f5368bbd8eff901820fd1cc14ed8cad63b29249e9d463')
    // is a common version. Let's use it.
    const modelIdentifier = "ai-forever/kandinsky-2.2:ea1addaab376f4dc227f5368bbd8eff901820fd1cc14ed8cad63b29249e9d463";

    try {
        const output = await replicate.run(modelIdentifier, { input: replicateInput }) as string[];
        if (!output || output.length === 0 || !output[0]) {
            console.error("Replicate output was empty or invalid for text-to-render:", output);
            throw new Error("AI model did not return a valid image URL.");
        }
        return { imageUrl: output[0] };
    } catch (error: any) {
        console.error("Error running Replicate Kandinsky model:", error);
        const errorMessage = error.detail || error.message || "Failed to generate image from text via Replicate.";
        throw new Error(`Text-to-image generation failed: ${errorMessage}`);
    }
  }
);