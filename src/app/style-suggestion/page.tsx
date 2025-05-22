"use client";

import React, { useState } from "react";
import StyleSuggestionWidget from "./components/StyleSuggestionWidget";
import { Textarea } from "@/components/ui/textarea";
// Assuming Label is needed and correctly imported, or defined in the widget itself if not from shadcn
// If using shadcn/ui Label, ensure it's imported: import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// If Label is not from shadcn/ui, define a simple one or ensure it's in the widget
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, ...props }) => (
  <label className="block text-sm font-medium text-foreground mb-1" {...props}>
    {children}
  </label>
);


export default function StyleSuggestionPage() {
  const [currentPrompt, setCurrentPrompt] = useState<string>("");

  const handleApplySuggestion = (suggestion: {
    style?: string;
    enhancements?: string;
    parameters?: Record<string, any>;
  }) => {
    console.log("Suggestion received on standalone page:", suggestion);
    // Here, you could potentially update some state on this page
    // or trigger other actions based on the suggestion.
    // For now, just logging.
    alert(
      `Suggestion Applied (see console for details):\nStyle: ${suggestion.style || 'N/A'}\nEnhancements: ${suggestion.enhancements || 'N/A'}`
    );
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">AI Style Advisor</CardTitle>
          <CardDescription className="text-center">
            Get style and parameter suggestions from an AI based on your past projects and current ideas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="current-prompt" className="text-lg">Your Current Design Idea (Optional):</Label>
            <Textarea
              id="current-prompt"
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              placeholder="e.g., 'A cozy reading nook with a large window' or 'Modern kitchen design for a small apartment'"
              rows={3}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Provide your current design thoughts to get more tailored suggestions.
            </p>
          </div>
          
          <StyleSuggestionWidget
            currentTextPrompt={currentPrompt}
            onApplySuggestion={handleApplySuggestion}
          />
        </CardContent>
      </Card>
    </div>
  );
}
