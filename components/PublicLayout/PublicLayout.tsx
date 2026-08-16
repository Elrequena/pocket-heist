"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import AuthLoadingScreen from "@/components/AuthLoadingScreen";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after initial loading is complete
    if (!loading && user) {
      router.push("/heists");
    }
  }, [loading, user, router]);

  // Show loader while checking auth status
  if (loading) {
    return <AuthLoadingScreen variant="public" />;
  }

  // If no user, render the public content
  if (!user) {
    return <>{children}</>;
  }

  // If not loading and user exists, show nothing while redirect happens
  return null;
}
