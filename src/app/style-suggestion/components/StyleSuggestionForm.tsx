"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { handleStyleSuggestion } from '@/lib/actions';
import type { StyleSuggestionOutput } from '@/ai/flows/style-suggestion';
import { MOCK_PAST_PROJECTS_JSON } from '@/lib/constants';

const styleSuggestionSchema = z.object({
  currentInput: z.string().min(10, "Current input must be at least 10 characters."),
  // pastProjects will be a fixed string for now
});

type StyleSuggestionFormValues = z.infer<typeof styleSuggestionSchema>;

export default function StyleSuggestionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<StyleSuggestionOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<StyleSuggestionFormValues>({
    resolver: zodResolver(styleSuggestionSchema),
    defaultValues: {
      currentInput: "",
    },
  });

  const onSubmit = async (data: StyleSuggestionFormValues) => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await handleStyleSuggestion({
        currentInput: data.currentInput,
        pastProjects: MOCK_PAST_PROJECTS_JSON, // Using mocked past projects
      });
      setSuggestion(result);
      toast({ title: "Success!", description: "Style suggestions received." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (suggestion) {
      // In a real app, this would update global state or pass data to other components.
      // For now, just log it and show a toast.
      console.log("Accepted suggestion:", suggestion);
      toast({ title: "Suggestion Applied (Simulated)", description: `Style: ${suggestion.suggestedStyle}, Enhancements: ${suggestion.suggestedEnhancements}` });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl">Provide Context</CardTitle>
          <CardDescription>Describe your current project or idea for AI-powered style suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Project Input</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Designing a modern residential villa with large glass windows and a focus on natural materials."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Past Project History (Mocked)</FormLabel>
                <pre className="text-xs p-3 bg-muted rounded-md overflow-x-auto">
                  {JSON.stringify(JSON.parse(MOCK_PAST_PROJECTS_JSON), null, 2)}
                </pre>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : "Get Style Suggestions"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-card/80 min-h-[300px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl text-center">AI Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center">
          {isLoading && <LoadingSpinner />}
          {suggestion && !isLoading && (
            <div className="space-y-4 text-left w-full">
              <div>
                <h3 className="font-semibold text-primary">Suggested Style:</h3>
                <p className="text-foreground/90">{suggestion.suggestedStyle}</p>
              </div>
              <div>
                <h3 className="font-semibold text-primary">Suggested Enhancements:</h3>
                <p className="text-foreground/90">{suggestion.suggestedEnhancements}</p>
              </div>
              <div>
                <h3 className="font-semibold text-primary">Reasoning:</h3>
                <p className="text-muted-foreground text-sm">{suggestion.reasoning}</p>
              </div>
              <Button onClick={handleAcceptSuggestion} className="w-full mt-6">Accept & Apply (Simulated)</Button>
            </div>
          )}
          {!isLoading && !suggestion && (
            <p className="text-center text-muted-foreground">AI-generated style suggestions will appear here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
