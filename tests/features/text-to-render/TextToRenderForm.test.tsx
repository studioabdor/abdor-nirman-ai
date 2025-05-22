/**
 * Test Suite for TextToRenderForm Component
 *
 * Requirements:
 * - Jest and React Testing Library setup.
 * - `@testing-library/jest-dom` for extended DOM assertions.
 * - Jest configuration for path aliases (`@/components/...`, `@/lib/...`).
 * - Mocks for server actions and services called by the form.
 * - Mocks for complex child components not central to this form's basic interaction test.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import TextToRenderForm from "@/app/text-to-render/components/TextToRenderForm";
// Mock server actions
jest.mock("@/lib/actions", () => ({
  handleTextToRender: jest.fn(),
}));

// Mock services (if directly used for things like user ID, though this form uses a placeholder)
jest.mock("@/lib/firestoreService", () => ({
  addGeneratedImage: jest.fn(),
}));

// Mock child components
// If StyleSuggestionWidget makes its own API calls or has complex internal state not relevant here,
// mocking it simplifies the TextToRenderForm test.
jest.mock("@/app/style-suggestion/components/StyleSuggestionWidget", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  return {
    __esModule: true,
    default: jest.fn(({ currentTextPrompt, onApplySuggestion }) => (
      <div data-testid="style-suggestion-widget-mock">
        Mocked StyleSuggestionWidget
        <button onClick={() => onApplySuggestion({ style: "Mock Style", enhancements: "Mock Enhancements" })}>
          Apply Mock Suggestion
        </button>
        <p>Current Prompt: {currentTextPrompt}</p>
      </div>
    )),
  };
});

// Mock FileUploader if it has complex internal logic or external dependencies not needed for this test
jest.mock("@/components/shared/FileUploader", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const React = require("react");
    return {
        __esModule: true,
        default: jest.fn(({ onFileUpload, id, label }) => (
            <div data-testid="file-uploader-mock">
                <label htmlFor={id}>{label}</label>
                <input type="file" id={id} onChange={(e) => {
                    // Simulate file upload for coverage if needed, though not directly tested here
                    // const file = e.target.files?.[0];
                    // onFileUpload(file, file ? "data:image/png;base64,mock" : null);
                }} />
            </div>
        ))
    };
});


describe("TextToRenderForm Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    (require("@/lib/actions").handleTextToRender as jest.Mock).mockClear();
    (require("@/lib/firestoreService").addGeneratedImage as jest.Mock).mockClear();
    // Clear mock for StyleSuggestionWidget if needed, though default mock might be fine
    (require("@/app/style-suggestion/components/StyleSuggestionWidget").default as jest.Mock).mockClear();

  });

  test("renders with basic elements", () => {
    render(<TextToRenderForm />);

    // Check for the main heading (optional, but good for context)
    expect(screen.getByRole("heading", { name: /text to render/i })).toBeInTheDocument();

    // Check for the text description textarea
    expect(screen.getByLabelText(/describe your vision/i)).toBeInTheDocument();

    // Check for architectural style select
    expect(screen.getByLabelText(/architectural style/i)).toBeInTheDocument();
    
    // Check for aspect ratio select
    expect(screen.getByLabelText(/aspect ratio/i)).toBeInTheDocument();

    // Check for output size select
    expect(screen.getByLabelText(/output size/i)).toBeInTheDocument();

    // Check for the submit button
    expect(screen.getByRole("button", { name: /generate image/i })).toBeInTheDocument();

    // Check if the Style Advisor toggle button is present
    expect(screen.getByRole("button", { name: /show AI Style Advisor/i })).toBeInTheDocument();
  });

  test("text description input can be changed", () => {
    render(<TextToRenderForm />);
    const textarea = screen.getByLabelText(/describe your vision/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "A beautiful modern house." } });
    expect(textarea.value).toBe("A beautiful modern house.");
  });

  test("architectural style can be changed", () => {
    render(<TextToRenderForm />);
    // Shadcn Select: The trigger is what users interact with first.
    // The label points to the trigger's underlying hidden select or similar.
    // We'll find the trigger button by its current value (default is "Modern").
    const styleSelectTrigger = screen.getByRole('combobox', { name: /architectural style/i });
    expect(styleSelectTrigger).toHaveTextContent("Modern"); // Default value

    fireEvent.mouseDown(styleSelectTrigger); // Open the select

    // Select a new option. Options are usually identified by their text content.
    // Wait for the option to appear if it's in a portal or animated
    const optionToSelect = screen.getByText("Minimalist"); // Assuming "Minimalist" is an option
    fireEvent.click(optionToSelect);

    // Verify the trigger now displays the new value
    expect(styleSelectTrigger).toHaveTextContent("Minimalist");
  });
  
  test("aspect ratio can be changed", () => {
    render(<TextToRenderForm />);
    const aspectRatioTrigger = screen.getByRole('combobox', { name: /aspect ratio/i });
    expect(aspectRatioTrigger).toHaveTextContent("16:9"); // Default

    fireEvent.mouseDown(aspectRatioTrigger);
    // Assuming options are rendered and accessible.
    // The exact text might include the description like "1:1 (Square)"
    const optionToSelect = screen.getByText("1:1 (Square)"); 
    fireEvent.click(optionToSelect);
    expect(aspectRatioTrigger).toHaveTextContent("1:1");
  });

  test("submit button is initially disabled and enables when text description is entered", () => {
    render(<TextToRenderForm />);
    const submitButton = screen.getByRole("button", { name: /generate image/i });
    expect(submitButton).toBeDisabled();

    const textarea = screen.getByLabelText(/describe your vision/i);
    fireEvent.change(textarea, { target: { value: "Test description" } });
    expect(submitButton).not.toBeDisabled();
  });

  test("shows and hides StyleSuggestionWidget when toggle button is clicked", () => {
    render(<TextToRenderForm />);
    const toggleButton = screen.getByRole("button", { name: /show AI Style Advisor/i });

    // Initially, widget might not be there or mocked as hidden.
    // Our mock is always there but we can check for its visibility if the component itself handles it.
    // For this test, let's assume the mock is always rendered by the parent if showStyleAdvisor is true.
    expect(screen.queryByTestId("style-suggestion-widget-mock")).not.toBeInTheDocument(); // Assuming it's not shown by default

    fireEvent.click(toggleButton); // Click to show
    expect(screen.getByTestId("style-suggestion-widget-mock")).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent(/hide AI Style Advisor/i);

    fireEvent.click(toggleButton); // Click to hide
    expect(screen.queryByTestId("style-suggestion-widget-mock")).not.toBeInTheDocument();
    expect(toggleButton).toHaveTextContent(/show AI Style Advisor/i);
  });

  test("calls handleTextToRender on form submission with correct data", async () => {
    const mockHandleTextToRender = require("@/lib/actions").handleTextToRender;
    mockHandleTextToRender.mockResolvedValue({ imageUrl: "http://example.com/generated.png", error: null });

    render(<TextToRenderForm />);

    const textarea = screen.getByLabelText(/describe your vision/i);
    fireEvent.change(textarea, { target: { value: "Modern living room" } });

    // Change style to test it's included
    const styleSelectTrigger = screen.getByRole('combobox', { name: /architectural style/i });
    fireEvent.mouseDown(styleSelectTrigger);
    fireEvent.click(screen.getByText("Minimalist")); // Select "Minimalist"

    const submitButton = screen.getByRole("button", { name: /generate image/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled(); // Should be disabled while loading

    await waitFor(() => {
      expect(mockHandleTextToRender).toHaveBeenCalledTimes(1);
      expect(mockHandleTextToRender).toHaveBeenCalledWith({
        textDescription: "Modern living room",
        aspectRatio: "16:9", // Default
        outputSize: "1024x576", // Default
        architecturalStyle: "Minimalist", // Changed value
      });
    });

    // Check if loading state is reset
    expect(submitButton).not.toBeDisabled();
    // Check if image is displayed (optional, depends on mock response and component logic)
    // await screen.findByAltText("Generated from text description"); // This would require the mock to trigger state update
  });

  // Test applying suggestion from the mocked StyleSuggestionWidget
  test("updates form fields when mock suggestion is applied", async () => {
    render(<TextToRenderForm />);
    const toggleButton = screen.getByRole("button", { name: /show AI Style Advisor/i });
    fireEvent.click(toggleButton); // Show the widget

    const applyMockSuggestionButton = screen.getByRole("button", { name: "Apply Mock Suggestion" });
    fireEvent.click(applyMockSuggestionButton);
    
    // Check if form fields were updated based on mock suggestion
    // The mock suggestion is { style: "Mock Style", enhancements: "Mock Enhancements" }
    // Our handleApplySuggestionInForm logic appends these.
    const textarea = screen.getByLabelText(/describe your vision/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain("Mock Style");
    expect(textarea.value).toContain("Mock Enhancements");
    
    // Check if architectural style was set if it matched, or appended
    // "Mock Style" doesn't match predefined, so it should be in textarea.
    // If we mocked a style that exists, e.g., "Modern", then the select would update.
  });

});
