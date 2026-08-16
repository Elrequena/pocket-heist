"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import AuthLoadingScreen from "@/components/AuthLoadingScreen";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after initial loading is complete
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Show loader while checking auth status
  if (loading) {
    return <AuthLoadingScreen variant="dashboard" />;
  }

  // If user exists, render the protected content
  if (user) {
    return <>{children}</>;
  }

  // If not loading and no user, show nothing while redirect happens
  return null;
}
