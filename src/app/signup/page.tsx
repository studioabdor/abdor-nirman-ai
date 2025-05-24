"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SignupForm } from "@/components/auth/SignupForm";import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebaseConfig"; // Import Firebase auth
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function SignupPage() {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "Signup Successful",
        description: "Your account has been created. Please login.",
      });
      router.push("/login"); // Redirect to login page after successful signup
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <SignupForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
