import {defineFlow, run} from 'genkit';
import {z} from 'zod';
import {replicate} from '@genkit-ai/replicate'; // Assuming replicate plugin is correctly set up

// Define input schema with Zod
export const EnhanceDetailsInputSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  scaleFactor: z.number().min(1).max(10).default(4).optional(), // Example: Default to 4x, optional
});
export type EnhanceDetailsInput = z.infer<typeof EnhanceDetailsInputSchema>;

// Define output schema with Zod
export const EnhanceDetailsOutputSchema = z.object({
  enhancedImageUrl: z.string().url('Invalid enhanced image URL'),
});
export type EnhanceDetailsOutput = z.infer<typeof EnhanceDetailsOutputSchema>;

// Replicate model for Real-ESRGAN
const enhanceDetailsModel = replicate({
  name: 'xinntao/realesrgan', // Correct model name
  version: 'dbb9243850583a41190d0c2b5b1e81c91564927f080a5f054623d4f377a412e1', // Specific version
});

// Define the Genkit flow
export const enhanceDetailsFlow = defineFlow(
  {
    name: 'enhanceDetailsFlow',
    inputSchema: EnhanceDetailsInputSchema,
    outputSchema: EnhanceDetailsOutputSchema,
  },
  async (input: EnhanceDetailsInput): Promise<EnhanceDetailsOutput> => {
    try {
      const replicateInput = {
        image: input.imageUrl,
        scale: input.scaleFactor,
        // Add other parameters specific to the model if needed
      };

      console.log('Calling Replicate Real-ESRGAN with input:', replicateInput);

      const response = await run('enhance-image-replicate', () => 
        enhanceDetailsModel.run(replicateInput)
      );
      
      // Replicate typically returns the output directly, often a URL string
      // or an object containing the URL. Adjust based on actual Replicate output structure.
      // For xinntao/realesrgan, the output is directly the image URL string.
      if (typeof response !== 'string' || !response) {
        console.error('Replicate output was not a valid URL string:', response);
        throw new Error('Failed to get enhanced image URL from Replicate.');
      }
      
      console.log('Replicate Real-ESRGAN output URL:', response);

      return { enhancedImageUrl: response };

    } catch (error) {
      console.error('Error in enhanceDetailsFlow:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to enhance details: ${error.message}`);
      }
      throw new Error('Failed to enhance details due to an unknown error.');
    }
  }
);
