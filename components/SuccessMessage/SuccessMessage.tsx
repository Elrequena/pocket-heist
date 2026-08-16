"use client";

import styles from "./SuccessMessage.module.css";

interface SuccessMessageProps {
  message: string;
  onClose: () => void;
}

export default function SuccessMessage({
  message,
  onClose,
}: SuccessMessageProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <p className={styles.message}>{message}</p>
        <button onClick={onClose} className={styles.button}>
          Got it
        </button>
      </div>
    </div>
  );
}
