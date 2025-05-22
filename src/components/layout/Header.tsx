'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Home, LayoutDashboard, PencilRuler, Image as ImageIcon, Combine, Sparkles, PenTool, DollarSign, Info, Menu, X } from 'lucide-react';
import NavItem from './NavItem';

const navLinks = [
  { href: "/sketch-to-render", label: "Sketch to Render", icon: PencilRuler },
  { href: "/moodboard-render", label: "Moodboard Render", icon: Combine },
  { href: "/text-to-render", label: "Text to Render", icon: PenTool },
  { href: "/enhance-details", label: "Enhance Details", icon: Sparkles },
  { href: "/style-suggestion", label: "AI Style Suggestion", icon: ImageIcon }, // Changed icon to ImageIcon
  { href: "/pricing", label: "Pricing", icon: DollarSign },
  { href: "/about", label: "About", icon: Info },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <LayoutDashboard className="h-7 w-7" />
          <span>Nirman AI</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {navLinks.map((link) => (
            <NavItem key={link.href} href={link.href} label={link.label} icon={link.icon} />
          ))}
        </nav>
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            className="p-2 rounded-md text-primary hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">{isMobileMenuOpen ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu" 
          className="md:hidden absolute top-16 inset-x-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40 shadow-lg"
          // Simple transition, could be enhanced with framer-motion or more complex CSS
          // For CSS transition: add classes like `transition-all duration-300 ease-in-out` and manage opacity/transform
        >
          <nav className="container mx-auto flex flex-col space-y-2 p-4">
            {navLinks.map((link) => (
              <Link
                key={`mobile-${link.href}`}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
                className="flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium text-foreground hover:bg-muted hover:text-primary transition-colors"
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

// Helper component to initialize state, as direct state in Header might cause issues with 'use client' if not correctly handled.
// However, since Header is already 'use client', direct state is fine.
// For this implementation, we'll add state directly to Header.
// If Header were a Server Component, we'd need a wrapper.

// Note: A [useState] import is needed for the above changes. It's added in the SEARCH/REPLACE block.
