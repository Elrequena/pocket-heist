"use client";

import { useUser } from "@/hooks";
import { logoutUser } from "@/lib/firebase";
import styles from "./Navbar.module.css";

export default function LogoutButton() {
  const { user, loading } = useUser();

  if (loading || !user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button className={styles.btnOutline} onClick={handleLogout}>
      Logout
    </button>
  );
}
