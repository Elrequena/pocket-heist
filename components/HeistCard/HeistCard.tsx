import Link from "next/link";
import { Clock, User, Calendar } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import type { Heist } from "@/types/firestore";
import styles from "./HeistCard.module.css";

interface HeistCardProps {
  heist: Heist;
}

function formatTimeRemaining(deadline: Date): {
  text: string;
  isOverdue: boolean;
} {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) {
    return { text: "Overdue", isOverdue: true };
  }

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return { text: `${days}d ${hours}h`, isOverdue: false };
  }

  return { text: `${hours}h ${minutes}m`, isOverdue: false };
}

function formatDeadline(deadline: Date): string {
  const date = deadline.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const time = deadline.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date}, ${time}`;
}

export default function HeistCard({ heist }: HeistCardProps) {
  const { text: timeText, isOverdue } = formatTimeRemaining(heist.deadline);
  const deadlineFormatted = formatDeadline(heist.deadline);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <Link href={`/heists/${heist.id}`} className={styles.title}>
          {heist.title}
        </Link>
        <Clock className={styles.clockIcon} size={18} />
      </div>

      <div className={styles.row}>
        <User size={14} className={styles.icon} />
        <span className={styles.label}>To:</span>
        <span className={styles.assignee}>@{heist.assignedToCodename}</span>
      </div>

      <div className={styles.row}>
        <User size={14} className={styles.icon} />
        <span className={styles.label}>By:</span>
        <span className={styles.creator}>@{heist.createdByCodename}</span>
      </div>

      <div className={styles.row}>
        <Calendar size={14} className={styles.icon} />
        <span className={styles.deadlineText}>{deadlineFormatted}</span>
        <span className={styles.separator}>•</span>
        <span className={isOverdue ? styles.overdue : styles.timeRemaining}>
          {timeText}
        </span>
      </div>
    </article>
  );
}

export function HeistCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonHeader}>
        <Skeleton width="60%" height="16px" />
        <Skeleton variant="circle" width="18px" height="18px" />
      </div>
      <div className={styles.skeletonRows}>
        <Skeleton width="45%" height="14px" />
        <Skeleton width="40%" height="14px" />
        <Skeleton width="70%" height="14px" />
      </div>
    </div>
  );
}
