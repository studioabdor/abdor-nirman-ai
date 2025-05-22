"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; // For displaying JSON history
import { getUserGeneratedImages, getUserMoodboardProjects } from "@/lib/firestoreService";
import { handleStyleSuggestion } from "@/lib/actions";
import type { StyleSuggestionOutput } from "@/ai/flows/style-suggestion"; // Assuming this type exists
import type { GeneratedImage, MoodboardProject } from "@/lib/firestore-types";
import LoadingSpinner from "@/components/shared/LoadingSpinner"; // Import the shared component

// Placeholder for LoadingSpinner - REMOVED
// const LoadingSpinner: React.FC = () => <div className="flex justify-center items-center my-4"><p className="text-lg">Loading...</p></div>;

interface StyleSuggestionWidgetProps {
  currentTextPrompt?: string;
  currentImageUrl?: string; // Not used in this iteration, but good for future
  onApplySuggestion: (suggestion: { style?: string; enhancements?: string; parameters?: Record<string, any> }) => void;
}

const StyleSuggestionWidget: React.FC<StyleSuggestionWidgetProps> = ({
  currentTextPrompt,
  onApplySuggestion,
}) => {
  const [suggestions, setSuggestions] = useState<StyleSuggestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userHistorySummary, setUserHistorySummary] = useState<string>("");

  const userId = "test-user-style-suggestion"; // Placeholder

  const fetchUserHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    setError(null);
    try {
      const imagesData: GeneratedImage[] = await getUserGeneratedImages(userId);
      const moodboardsData: MoodboardProject[] = await getUserMoodboardProjects(userId);

      const relevantImageData = imagesData.map(img => ({
        type: img.type,
        prompt: img.prompt,
        originalImageUrl: img.originalImageUrl,
        parameters: {
          aspectRatio: img.parameters?.aspectRatio,
          outputSize: img.parameters?.outputSize,
          architecturalStyle: img.parameters?.architecturalStyle,
        }
      }));

      const relevantMoodboardData = moodboardsData.map(mb => ({
        type: "moodboard",
        name: mb.name,
        inputImageUrls: mb.inputImageUrls,
        parameters: {
          aspectRatio: mb.parameters?.aspectRatio,
          outputSize: mb.parameters?.outputSize,
          architecturalStyle: mb.parameters?.architecturalStyle,
        }
      }));
      
      const combinedHistory = [...relevantImageData, ...relevantMoodboardData];
      // Sort by a 'createdAt' field if available and consistently named, or just take latest.
      // For simplicity, we'll just combine and take the last N items.
      // Assuming 'createdAt' is present on both types from firestoreService (it is)
      // For now, we don't sort, just slice. Firestore queries usually return sorted.
      
      const summaryArray = combinedHistory.slice(0, 10); // Limit to last 10 projects overall
      
      if (summaryArray.length === 0) {
        setUserHistorySummary(""); // Explicitly set to empty if no history
        // setError("No user history found to base suggestions on."); // Optional: make it an error or allow suggestions without history
      } else {
        setUserHistorySummary(JSON.stringify(summaryArray, null, 2));
      }

    } catch (err: any) {
      console.error("Error fetching user history:", err);
      setError(`Failed to load user history: ${err.message}`);
      setUserHistorySummary("");
    } finally {
      setIsHistoryLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserHistory();
  }, [fetchUserHistory]);

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    if (!userHistorySummary && false) { // Disabled history check for now to allow suggestions without it
      setError("User history not loaded or empty. Suggestions require past project data.");
      setIsLoading(false);
      return;
    }

    const currentInputString = currentTextPrompt || "current design idea";

    try {
      const result = await handleStyleSuggestion({
        pastProjects: userHistorySummary || "[]", // Send empty array string if no history
        currentInput: currentInputString,
      });
      setSuggestions(result);
    } catch (err: any) {
      console.error("Error getting style suggestions:", err);
      setError(`Failed to get suggestions: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestions) {
      // Basic parsing attempt. This is highly dependent on the AI's output format.
      // For a first pass, we send them as is.
      // A more robust solution would involve the AI returning structured JSON for parameters.
      onApplySuggestion({
        style: suggestions.suggestedStyle,
        enhancements: suggestions.suggestedEnhancements,
        // parameters: suggestions.suggestedParameters // If AI provides structured params
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>AI Style Advisor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isHistoryLoading && <LoadingSpinner size="md" />} {/* Use imported spinner, adjust size as needed */}
        {userHistorySummary && (
          <div>
            <Label htmlFor="user-history">User History (Summary for AI):</Label>
            <Textarea id="user-history" value={userHistorySummary} readOnly rows={5} className="text-xs bg-muted/50" />
            <p className="text-xs text-muted-foreground mt-1">This summary of your recent projects is sent to the AI.</p>
          </div>
        )}

        <Button onClick={handleGetSuggestions} disabled={isLoading || isHistoryLoading} className="w-full">
          {isLoading ? "Getting Suggestions..." : "Get Style Suggestions"}
        </Button>

        {error && <p className="text-red-500 text-sm">Error: {error}</p>}

        {suggestions && !isLoading && (
          <div className="mt-4 p-4 border rounded-md bg-secondary/30 space-y-3">
            <h4 className="font-semibold text-lg">Suggestion:</h4>
            {suggestions.suggestedStyle && (
              <p><strong>Style:</strong> {suggestions.suggestedStyle}</p>
            )}
            {suggestions.suggestedEnhancements && (
              <div>
                <p><strong>Enhancements/Parameters:</strong></p>
                <p className="text-sm whitespace-pre-wrap">{suggestions.suggestedEnhancements}</p>
              </div>
            )}
             {suggestions.reasoning && (
              <div>
                <p><strong>Reasoning:</strong></p>
                <p className="text-sm italic">{suggestions.reasoning}</p>
              </div>
            )}
            <Button onClick={handleApply} className="w-full mt-2">
              Apply Suggestion
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
            This widget suggests styles based on your recent projects and current input.
        </p>
      </CardFooter>
    </Card>
  );
};

export default StyleSuggestionWidget;

// Helper Label component if not using shadcn/ui Label for some reason
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, ...props }) => (
  <label className="block text-sm font-medium text-foreground mb-1" {...props}>
    {children}
  </label>
);
