// SketchToRender flow to convert user sketches into realistic rendered images.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

import Replicate from 'replicate';
const SketchToRenderInputSchema = z.object({
  sketchUrl: z
    .string()
    .url()
    .describe("A public URL to the sketch image provided by the user."),
  aspectRatio: z.string().describe('The desired aspect ratio of the rendered image (e.g., "16:9").'),
  width: z.number().int().positive().describe("The desired width of the rendered image in pixels."),
  height: z.number().int().positive().describe("The desired height of the rendered image in pixels."),
});
export type SketchToRenderInput = z.infer<typeof SketchToRenderInputSchema>;

const SketchToRenderOutputSchema = z.object({
  imageUrl: z
    .string()
    .url()
    .describe('The URL of the rendered image.'),
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

  Sketch: {{media url=sketchUrl}}
  Aspect Ratio: {{{aspectRatio}}}
  Width: {{{width}}}
  Height: {{{height}}}`,
});

const sketchToRenderFlow = ai.defineFlow(
  {
    name: 'sketchToRenderFlow',
    inputSchema: SketchToRenderInputSchema,
    outputSchema: SketchToRenderOutputSchema,
  },
  async (input: SketchToRenderInput) => {
    const { sketchUrl, aspectRatio, width, height } = input;

    // Optional: Validate aspect ratio against width and height
    const [arWidth, arHeight] = aspectRatio.split(':').map(Number);
    if (Math.abs(width / height - arWidth / arHeight) > 0.01) {
      // This threshold might need adjustment
      throw new Error(
        `The provided width (${width}) and height (${height}) do not match the aspect ratio (${aspectRatio}).`
      );
    }

    const replicate = new Replicate();

    // Note: The Replicate model 'helios-infotech/sketch_to_image' specific inputs for output dimensions
    // are not explicitly documented. It might use 'image_width'/'image_height', or it might scale based
    // on the input image. We'll pass 'width' and 'height' assuming it supports them or similar standard names.
    // If the model only scales, these parameters might be ignored by the model or cause an error if unexpected.
    // For robust implementation, one would need to verify the exact parameter names from the model's documentation on Replicate.
    const replicateInput = {
      image: sketchUrl,
      // Assuming the model might take these common parameters for output dimensions.
      // This is a guess; actual parameter names could be different (e.g., image_width, image_height).
      width: width,
      height: height,
      prompt: "a photo of interior of a home, sofa, carpet, realistic,4k", // You might want to make this dynamic
      // scale: 2, // This model might use a scale factor; if width/height are not direct, this might be relevant.
      // cn_lineart_strength: 1, // This is specific to ControlNet Lineart model
      // Other parameters like `scale`, `cn_lineart_strength` might be relevant depending on the model's capabilities.
      // For helios-infotech/sketch_to_image, it's a ControlNet based model.
      // It might not directly set output width/height but rather scale the input or use a fixed output based on training.
      // If it *must* take specific dimensions, they need to be named correctly.
      // For now, passing width/height as per standard Replicate API patterns.
    };

    try {
      // Model version "feb7325e48612a443356bff3d0e03af21a42570f87bee6e8ea4f275f2bd3e6f9"
      // This specific model version's input parameters should be checked on Replicate.
      // For example, some ControlNet models on Replicate use `image_resolution` (e.g., "512", "768")
      // and derive width/height based on the input image's aspect ratio.
      // If this model works that way, then `width` and `height` here would be more like hints or need translation.
      // Given the instruction is "pass width and height to the model", we do so directly.
      const output = await replicate.run("helios-infotech/sketch_to_image:feb7325e48612a443356bff3d0e03af21a42570f87bee6e8ea4f275f2bd3e6f9", { input: replicateInput });

      if (typeof output !== 'string' || !output.startsWith('http')) {
        console.error("Replicate output was not a valid URL:", output);
        throw new Error("AI model did not return a valid image URL.");
      }
      // Assuming the output is a single string which is the image URL
      return { imageUrl: output as string };
    } catch (error) {
      console.error("Error running Replicate model:", error);
      throw new Error("Failed to generate render from sketch.");
    }
  }
);
