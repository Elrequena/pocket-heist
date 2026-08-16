"use client";

import { Clock } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import styles from "./AuthLoadingScreen.module.css";

interface AuthLoadingScreenProps {
  variant?: "public" | "dashboard";
}

export default function AuthLoadingScreen({
  variant = "public",
}: AuthLoadingScreenProps) {
  return (
    <div
      className={styles.container}
      role="status"
      aria-label="Loading authentication status"
    >
      <div className={styles.content}>
        {variant === "dashboard" && (
          <div className={styles.navbarPlaceholder}>
            <Skeleton variant="text" width="150px" height="24px" />
            <div className={styles.navbarButtons}>
              <Skeleton variant="text" width="120px" height="24px" />
              <Skeleton variant="circle" width="32px" height="32px" />
            </div>
          </div>
        )}

        <div className={styles.loaderWrapper}>
          <Clock className={styles.clockIcon} size={64} strokeWidth={1.5} />
          <p className={styles.message}>Checking authentication status...</p>
        </div>
      </div>
    </div>
  );
}
