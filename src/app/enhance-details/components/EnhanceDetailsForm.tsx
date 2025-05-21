"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Download, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import FileUploader from '@/components/shared/FileUploader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { ASPECT_RATIOS, OUTPUT_SIZES } from '@/lib/constants';

const enhanceDetailsSchema = z.object({
  imageDataUri: z.string().min(1, "Image is required."),
  aspectRatio: z.string().min(1, "Aspect ratio is required."),
  outputSize: z.string().min(1, "Output size is required."),
});

type EnhanceDetailsFormValues = z.infer<typeof enhanceDetailsSchema>;

export default function EnhanceDetailsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<EnhanceDetailsFormValues>({
    resolver: zodResolver(enhanceDetailsSchema),
    defaultValues: {
      imageDataUri: "",
      aspectRatio: ASPECT_RATIOS[0],
      outputSize: OUTPUT_SIZES[0],
    },
  });

  const handleFileUpload = (dataUri: string) => {
    form.setValue("imageDataUri", dataUri);
    setOriginalImageUrl(dataUri);
    setEnhancedImageUrl(null); // Clear previous enhanced image
  };
  
  // Mock enhancement function
  const mockEnhanceImage = async (data: EnhanceDetailsFormValues): Promise<{ enhancedUrl: string }> => {
    return new Promise(resolve => {
      setTimeout(() => {
        // For mocking, we just return the original image URL or a placeholder
        // In a real scenario, this would call an AI service
        resolve({ enhancedUrl: data.imageDataUri }); 
      }, 1500); // Simulate network delay
    });
  };

  const onSubmit = async (data: EnhanceDetailsFormValues) => {
    setIsLoading(true);
    setEnhancedImageUrl(null);
    try {
      // Mock enhancement:
      const result = await mockEnhanceImage(data);
      setEnhancedImageUrl(result.enhancedUrl);
      toast({ title: "Success!", description: "Image enhancement simulated." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Error", description: `Enhancement failed: ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl">Enhancement Options</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                control={form.control}
                name="imageDataUri"
                render={({ field }) => ( // field is not directly used for value, handleFileUpload does
                  <FormItem>
                    <FileUploader
                      id="imageEnhanceUpload"
                      label="Upload Image to Enhance"
                      onFileUpload={handleFileUpload}
                    />
                    <FormMessage>{form.formState.errors.imageDataUri?.message}</FormMessage>
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

              <Button type="submit" className="w-full" disabled={isLoading || !originalImageUrl}>
                {isLoading ? <LoadingSpinner size="sm" /> : "Enhance Image"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {originalImageUrl && (
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl text-center">Before</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-md">
                <Image src={originalImageUrl} alt="Original" layout="fill" objectFit="contain" data-ai-hint="original image" />
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && !enhancedImageUrl && <div className="flex justify-center py-10"><LoadingSpinner /></div>}
        
        {enhancedImageUrl && !isLoading && (
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl text-center">After (Enhanced)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-md">
                <Image src={enhancedImageUrl} alt="Enhanced" layout="fill" objectFit="contain" data-ai-hint="enhanced image detail" />
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <a href={enhancedImageUrl} download={`enhanced_image_${Date.now()}.png`}>
                  <Button>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </a>
                <a href={enhancedImageUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" /> View Full Size
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}
        {!isLoading && !originalImageUrl && !enhancedImageUrl && (
           <Card className="bg-card/80 min-h-[200px] flex items-center justify-center">
             <CardContent>
               <p className="text-center text-muted-foreground">Upload an image to see the comparison.</p>
             </CardContent>
           </Card>
        )}
      </div>
    </div>
  );
}
