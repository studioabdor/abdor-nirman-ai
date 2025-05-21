// SketchToRender flow to convert user sketches into realistic rendered images.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

import Replicate from 'replicate';
const SketchToRenderInputSchema = z.object({
  sketchDataUri: z
    .string()
    .describe(
      "A sketch drawn by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  aspectRatio: z.string().describe('The desired aspect ratio of the rendered image.'),
  outputSize: z.string().describe('The desired output size of the rendered image.'),
});
export type SketchToRenderInput = z.infer<typeof SketchToRenderInputSchema>;

const SketchToRenderOutputSchema = z.object({
  renderDataUri: z
    .string()
    .describe(
      'The rendered image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type SketchToRenderOutput = z.infer<typeof SketchToRenderOutputSchema>;

export async function sketchToRender(input: SketchToRenderInput): Promise<SketchToRenderOutput> {
  return sketchToRenderFlow(input);
}

const sketchToRenderPrompt = ai.definePrompt({
  name: 'sketchToRenderPrompt',
  input: {schema: SketchToRenderInputSchema},
  output: {schema: SketchToRenderOutputSchema},
  prompt: `You are an AI that converts sketches into realistic rendered images.

  Use the provided sketch and follow the instructions to create a realistic render.

  Sketch: {{media url=sketchDataUri}}
  Aspect Ratio: {{{aspectRatio}}}
  Output Size: {{{outputSize}}}`,
});

const sketchToRenderFlow = ai.defineFlow(
  {
    name: 'sketchToRenderFlow',
    inputSchema: SketchToRenderInputSchema,
    outputSchema: SketchToRenderOutputSchema,
  },
  async input => {
    const replicate = new Replicate();

    const replicateInput = {
      image: input.sketchDataUri,
      scale: 2,
      prompt: "a photo of interior of a home, sofa, carpet, realistic,4k", // You might want to make this dynamic based on user input later
      cn_lineart_strength: 1,
    };

    try {
      const output = await replicate.run("helios-infotech/sketch_to_image:feb7325e48612a443356bff3d0e03af21a42570f87bee6e8ea4f275f2bd3e6f9", { input: replicateInput });

      // Assuming the output is a single string which is the image URL
      return { renderDataUri: output as string };
    } catch (error) {
      console.error("Error running Replicate model:", error);
      throw new Error("Failed to generate render from sketch.");
    }
  }
);
