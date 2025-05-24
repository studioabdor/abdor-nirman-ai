"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form'; // Controller is not explicitly used, can be removed if not needed later
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import FileUploader from '@/components/shared/FileUploader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { handleSketchToRender } from '@/lib/actions';
import { ASPECT_RATIOS, OUTPUT_SIZES } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const sketchToRenderSchema = z.object({
  sketchDataUri: z.string().min(1, "Sketch image is required."),
  aspectRatio: z.string().min(1, "Aspect ratio is required."),
  outputSize: z.string().min(1, "Output size is required."),
});

type SketchToRenderFormValues = z.infer<typeof sketchToRenderSchema>;

export default function SketchToRenderForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  const form = useForm<SketchToRenderFormValues>({
    resolver: zodResolver(sketchToRenderSchema),
    defaultValues: {
      sketchDataUri: "",
      aspectRatio: ASPECT_RATIOS[0],
      outputSize: OUTPUT_SIZES[0],
    },
  });

  const onSubmit = async (data: SketchToRenderFormValues) => {
    if (authLoading) {
      toast({ variant: "destructive", title: "Error", description: "Authentication state is loading. Please wait." });
      return;
    }
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "Please log in to render sketches." });
      return;
    }

    setIsLoading(true);
    setRenderedImageUrl(null);
    try {
      const result = await handleSketchToRender(data, user.uid); // Pass user.uid
      // Ensure the key matches what's returned by the updated action (imageUrl)
      setRenderedImageUrl(result.imageUrl); 
      toast({ title: "Success!", description: "Your sketch has been rendered." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Error", description: errorMessage });
      console.error("Sketch rendering error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl">Rendering Options</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="sketchDataUri"
                render={({ field }) => (
                  <FormItem>
                    <FileUploader
                      id="sketchUpload"
                      label="Upload Sketch"
                      onFileUpload={(dataUri) => field.onChange(dataUri)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aspectRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aspect Ratio</FormLabel>
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
                    <FormLabel>Output Size</FormLabel>
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

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || authLoading || !user}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : (authLoading ? "Authenticating..." : (!user ? "Login to Render" : "Render Sketch"))}
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
          {renderedImageUrl && !isLoading && (
            <div className="mt-4 relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-lg">
              <Image src={renderedImageUrl} alt="Rendered Sketch" layout="fill" objectFit="contain" data-ai-hint="rendered sketch" />
            </div>
          )}
          {!isLoading && !renderedImageUrl && (
            <p className="text-center text-muted-foreground">Your rendered image will appear here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
