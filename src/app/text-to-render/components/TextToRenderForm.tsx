"use client";

import { useState, useEffect } from 'react'; // Added useEffect
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/use-toast'; // Corrected path for useToast
import { handleTextToRender } from '@/lib/actions';
import { ASPECT_RATIOS, OUTPUT_SIZES, ARCHITECTURAL_STYLES } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const textToRenderSchema = z.object({
  textDescription: z.string().min(10, "Description must be at least 10 characters."),
  aspectRatio: z.string().optional(),
  outputSize: z.string().optional(),
  architecturalStyle: z.string().optional(),
});

type TextToRenderFormValues = z.infer<typeof textToRenderSchema>;

export default function TextToRenderForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  const form = useForm<TextToRenderFormValues>({
    resolver: zodResolver(textToRenderSchema),
    defaultValues: {
      textDescription: "",
      aspectRatio: ASPECT_RATIOS[0],
      outputSize: OUTPUT_SIZES[0],
      architecturalStyle: ARCHITECTURAL_STYLES[0],
    },
  });

  const onSubmit = async (data: TextToRenderFormValues) => {
    if (authLoading) {
      toast({ variant: "destructive", title: "Error", description: "Authentication state is loading. Please wait." });
      return;
    }
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "Please log in to generate images." });
      return;
    }

    setIsLoading(true);
    setGeneratedImageUrl(null);
    try {
      // Pass data and user.uid to the server action
      const result = await handleTextToRender(data, user.uid);
      setGeneratedImageUrl(result.imageUrl);
      toast({ title: "Success!", description: "Image generated from text." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl">Image Generation Options</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="textDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A futuristic skyscraper with flowing organic lines, at sunset..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aspectRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aspect Ratio (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select aspect ratio" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ASPECT_RATIOS.map((ratio) => (
                          <SelectItem key={ratio} value={ratio}>{ratio}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outputSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Output Size (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select output size" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OUTPUT_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="architecturalStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Architectural Style (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ARCHITECTURAL_STYLES.map((style) => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || authLoading || !user}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : (authLoading ? "Authenticating..." : (!user ? "Login to Generate" : "Generate Image"))}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-card/80 min-h-[300px] flex items-center justify-center">
        <CardHeader>
          <CardTitle className="text-xl text-center">Generated Image</CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          {isLoading && <LoadingSpinner />}
          {generatedImageUrl && !isLoading && (
             <div className="mt-4 relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-lg">
              <Image src={generatedImageUrl} alt="Generated from text" layout="fill" objectFit="contain" data-ai-hint="AI generated image" />
            </div>
          )}
          {!isLoading && !generatedImageUrl && (
            <p className="text-center text-muted-foreground">Your generated image will appear here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
