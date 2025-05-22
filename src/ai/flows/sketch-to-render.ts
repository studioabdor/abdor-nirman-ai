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
      prompt: `Render a realistic image based on this sketch. Consider the aspect ratio: ${input.aspectRatio} and output size: ${input.outputSize}.`,
      // Add other relevant parameters for the 'ai-forever/kandinsky-2.2' model as needed
    };
    try {
      const output = await replicate.run(
        'ai-forever/kandinsky-2.2:ea1abb9c2e24a7f52bb852a826a7e8f43f80c57e379118893a3f82a34e1a3b11',
        { input: replicateInput }
      );
      // The output of kandinsky-2.2 is an array of strings (image URLs). We'll take the first one.
      if (Array.isArray(output) && output.length > 0) {
        return { renderDataUri: output[0] as string };
      } else {
        throw new Error('Replicate model did not return a valid image.');
      }
    } catch (error) {
      console.error('Error running Replicate model:', error);
      throw new Error('Failed to generate render from sketch.');
    }
  }
);