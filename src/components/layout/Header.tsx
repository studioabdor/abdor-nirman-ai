'use client';

import Link from 'next/link';
import { Home, LayoutDashboard, PencilRuler, Image as ImageIcon, Combine, Sparkles, PenTool, DollarSign, Info } from 'lucide-react';
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
        {/* Mobile Menu Trigger (optional, can be added later if needed) */}
        {/* For now, mobile users will scroll or use browser navigation */}
      </div>
    </header>
  );
}
