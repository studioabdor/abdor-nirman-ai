"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/lib/firebaseConfig"; // Import Firebase auth
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push("/"); // Redirect to homepage after successful login
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <LoginForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
