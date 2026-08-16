"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import AuthLoadingScreen from "@/components/AuthLoadingScreen";

export default function HomeRedirectHandler() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect based on auth status after initial loading
    if (!loading) {
      if (user) {
        router.push("/heists");
      } else {
        router.push("/login");
      }
    }
  }, [loading, user, router]);

  // Always show loader on home page (always redirects)
  return <AuthLoadingScreen variant="public" />;
}
