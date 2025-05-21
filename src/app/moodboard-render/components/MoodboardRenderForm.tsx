"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { handleMoodboardRender } from '@/lib/actions';
import { ASPECT_RATIOS, OUTPUT_SIZES, ARCHITECTURAL_STYLES } from '@/lib/constants';

const moodboardRenderSchema = z.object({
  image1DataUri: z.string().min(1, "First image is required."),
  image2DataUri: z.string().min(1, "Second image is required."),
  aspectRatio: z.string().min(1, "Aspect ratio is required."),
  outputSize: z.string().min(1, "Output size is required."),
  architecturalStyle: z.string().min(1, "Architectural style is required."),
});

type MoodboardRenderFormValues = z.infer<typeof moodboardRenderSchema>;

export default function MoodboardRenderForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [mergedImageUrl, setMergedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<MoodboardRenderFormValues>({
    resolver: zodResolver(moodboardRenderSchema),
    defaultValues: {
      image1DataUri: "",
      image2DataUri: "",
      aspectRatio: ASPECT_RATIOS[0],
      outputSize: OUTPUT_SIZES[0],
      architecturalStyle: ARCHITECTURAL_STYLES[0],
    },
  });

  const onSubmit = async (data: MoodboardRenderFormValues) => {
    setIsLoading(true);
    setMergedImageUrl(null);
    try {
      const result = await handleMoodboardRender(data);
      setMergedImageUrl(result.mergedImageDataUri);
      toast({ title: "Success!", description: "Images merged successfully." });
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
          <CardTitle className="text-xl">Moodboard Options</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="image1DataUri"
                render={({ field }) => (
                  <FormItem>
                    <FileUploader
                      id="image1Upload"
                      label="Upload First Image"
                      onFileUpload={(dataUri) => field.onChange(dataUri)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image2DataUri"
                render={({ field }) => (
                  <FormItem>
                    <FileUploader
                      id="image2Upload"
                      label="Upload Second Image"
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

              <FormField
                control={form.control}
                name="architecturalStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Architectural Style</FormLabel>
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : "Merge Images"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-card/80 min-h-[300px] flex items-center justify-center">
        <CardHeader>
          <CardTitle className="text-xl text-center">Merged Image</CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          {isLoading && <LoadingSpinner />}
          {mergedImageUrl && !isLoading && (
            <div className="mt-4 relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-lg">
              <Image src={mergedImageUrl} alt="Merged Moodboard" layout="fill" objectFit="contain" data-ai-hint="merged image architecture" />
            </div>
          )}
          {!isLoading && !mergedImageUrl && (
            <p className="text-center text-muted-foreground">Your merged image will appear here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
