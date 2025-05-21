// src/ai/flows/style-suggestion.ts
'use server';
/**
 * @fileOverview An AI agent that suggests rendering styles and enhancements based on user history and current input.
 *
 * - suggestStyle - A function that handles the style suggestion process.
 * - StyleSuggestionInput - The input type for the suggestStyle function.
 * - StyleSuggestionOutput - The return type for the suggestStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleSuggestionInputSchema = z.object({
  pastProjects: z
    .string()
    .describe(
      'A stringified JSON array of past project details, including style and enhancement settings.'
    ),
  currentInput: z
    .string()
    .describe('Description of the current rendering task or image input.'),
});
export type StyleSuggestionInput = z.infer<typeof StyleSuggestionInputSchema>;

const StyleSuggestionOutputSchema = z.object({
  suggestedStyle: z
    .string()
    .describe('The suggested rendering style based on past projects and current input.'),
  suggestedEnhancements: z
    .string()
    .describe('Suggested enhancements to apply to the rendering.'),
  reasoning: z
    .string()
    .describe('Explanation of why these styles and enhancements are suggested.'),
});
export type StyleSuggestionOutput = z.infer<typeof StyleSuggestionOutputSchema>;

export async function suggestStyle(input: StyleSuggestionInput): Promise<StyleSuggestionOutput> {
  return suggestStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleSuggestionPrompt',
  input: {schema: StyleSuggestionInputSchema},
  output: {schema: StyleSuggestionOutputSchema},
  prompt: `You are an AI assistant that suggests rendering styles and enhancements.

  Based on the user's past projects and current input, suggest the most appropriate rendering style and enhancements.
  Explain your reasoning for the suggestions.

  Past Projects:
  {{pastProjects}}

  Current Input:
  {{currentInput}}

  Output the suggested style, enhancements, and reasoning in a JSON format.
  Follow the following schema: {{{outputSchema}}}`,
});

const suggestStyleFlow = ai.defineFlow(
  {
    name: 'suggestStyleFlow',
    inputSchema: StyleSuggestionInputSchema,
    outputSchema: StyleSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
