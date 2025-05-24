'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import for redirection
import { Home, LayoutDashboard, PencilRuler, Image as ImageIcon, Combine, Sparkles, PenTool, DollarSign, Info, LogOut, UserCircle, UserPlus } from 'lucide-react'; // Added icons
import NavItem from './NavItem';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { auth } from '@/lib/firebaseConfig'; // Import Firebase auth for signOut
import { signOut as firebaseSignOut } from 'firebase/auth'; // Specific import for signOut
import { Button } from '@/components/ui/button'; // Import Button for Login/Logout
import { useToast } from '@/components/ui/use-toast'; // Import useToast

const navLinks = [
  { href: "/sketch-to-render", label: "Sketch to Render", icon: PencilRuler },
  { href: "/moodboard-render", label: "Moodboard Render", icon: Combine },
  { href: "/text-to-render", label: "Text to Render", icon: PenTool },
  { href: "/style-suggestion", label: "AI Style Suggestion", icon: ImageIcon }, // Changed icon to ImageIcon
  { href: "/pricing", label: "Pricing", icon: DollarSign },
  { href: "/about", label: "About", icon: Info },
];

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/'); // Redirect to homepage
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <LayoutDashboard className="h-7 w-7" />
          <span>Nirman AI</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => (
            <NavItem key={link.href} href={link.href} label={link.label} icon={link.icon} />
          ))}
        </nav>
        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="h-8 w-20 animate-pulse bg-muted rounded-md"></div> // Placeholder for loading state
          ) : user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email ? user.email.split('@')[0] : 'User'}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>
        {/* Mobile Menu Trigger (optional, can be added later if needed) */}
      </div>
    </header>
  );
}
