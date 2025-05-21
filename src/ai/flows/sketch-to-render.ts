// SketchToRender flow to convert user sketches into realistic rendered images.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-exp model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-exp',

      prompt: [
        {media: {url: input.sketchDataUri}},
        {
          text: `Generate a realistic rendered image from this sketch, with aspect ratio ${input.aspectRatio} and output size ${input.outputSize}.`,
        },
      ],

      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    return {renderDataUri: media.url!};
  }
);
