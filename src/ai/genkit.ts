import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {replicate} from \'@genkit-ai/replicate\';

export const ai = genkit({
  plugins: [
    googleAI(),
    replicate({
      sketchToRenderApiKey: process.env.SKETCH_TO_RENDER_REPLICATE_API_KEY,
      moodboardRenderApiKey: process.env.MOODBOARD_RENDER_REPLICATE_API_KEY,
      textToRenderApiKey: process.env.TEXT_TO_RENDER_REPLICATE_API_KEY,
      enhanceDetailsApiKey: process.env.ENHANCE_DETAILS_REPLICATE_API_KEY,
      styleSuggestionApiKey: process.env.STYLE_SUGGESTION_REPLICATE_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
