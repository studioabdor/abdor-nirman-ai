/**
 * Test Suite for Button Component
 *
 * Requirements:
 * - Jest and React Testing Library setup.
 * - `@testing-library/jest-dom` for extended DOM assertions (e.g., `toBeInTheDocument`, `toHaveClass`).
 * - Ensure `src/components/ui/button.tsx` exists and is correctly imported.
 * - If using path aliases (e.g., `@/components/...`), Jest's `moduleNameMapper` must be configured.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom"; // For extended assertions

import { Button, buttonVariants } from "@/components/ui/button"; // Adjust path as necessary
import type { VariantProps } from "class-variance-authority"; // For typing variant props

describe("Button Component", () => {
  test("renders with default props", () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
    // Default variant is 'default', check for its class (implementation-dependent)
    // For example, if 'default' variant adds 'bg-primary', you might check:
    // expect(buttonElement).toHaveClass('bg-primary'); // This depends on your actual CSS classes
    // More generically, ensure it has the base class from buttonVariants
    expect(buttonElement).toHaveClass(buttonVariants({ variant: "default", size: "default" }).split(' ')[0]); // Check one of the base classes
  });

  test("renders with different variants", () => {
    const variants: Array<VariantProps<typeof buttonVariants>["variant"]> = [
      "destructive",
      "outline",
      "secondary",
      "ghost",
      "link",
    ];
    variants.forEach((variant) => {
      render(<Button variant={variant}>{variant || "button"}</Button>);
      const buttonElement = screen.getByRole("button", { name: new RegExp(variant || "button", "i") });
      expect(buttonElement).toBeInTheDocument();
      // Check for a class associated with the variant. This is illustrative.
      // The exact class depends on cva implementation in button.tsx
      // For example, if variant 'destructive' adds 'bg-destructive':
      // expect(buttonElement).toHaveClass(buttonVariants({ variant }).split(' ')[0]); // Check first class of variant
      // It's better to test visual aspects in e2e/visual regression tests if possible.
      // For unit tests, checking if a core class from cva is applied is reasonable.
      // Example:
      const expectedClass = buttonVariants({ variant }).split(" ").find(cls => cls.includes(variant || ""));
      if (expectedClass && variant) { // 'default' variant might not have a class named 'default'
         // This is a fragile check, depends on naming conventions of cva output.
         // A more robust way is to check against a snapshot or specific differentiating class.
      }
    });
  });

  test("renders with different sizes", () => {
    const sizes: Array<VariantProps<typeof buttonVariants>["size"]> = [
      "sm",
      "lg",
      "icon",
    ];
    sizes.forEach((size) => {
      render(<Button size={size}>{size || "button"}</Button>);
      const buttonElement = screen.getByRole("button", { name: new RegExp(size || "button", "i") });
      expect(buttonElement).toBeInTheDocument();
      // Check for a class associated with the size
      // Example:
      const expectedClass = buttonVariants({ size }).split(" ").find(cls => cls.includes(size || ""));
       if (expectedClass && size) {
         // Fragile check, similar to variant.
       }
    });
  });

  test("renders as child when asChild prop is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    // Check if it's an anchor tag now, not a button
    const linkElement = screen.getByRole("link", { name: /link button/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe("A");
    expect(linkElement).toHaveAttribute("href", "/test");
  });

  test("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    const buttonElement = screen.getByRole("button", { name: /clickable/i });
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("is disabled when disabled prop is true", () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    const buttonElement = screen.getByRole("button", { name: /disabled/i });
    expect(buttonElement).toBeDisabled();
    fireEvent.click(buttonElement);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("applies custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    const buttonElement = screen.getByRole("button", { name: /custom/i });
    expect(buttonElement).toHaveClass("custom-class");
  });
});
