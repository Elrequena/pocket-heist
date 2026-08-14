import styles from "./Skeleton.module.css"

interface SkeletonProps {
  variant?: "card" | "text" | "circle"
  width?: string
  height?: string
  className?: string
}

export default function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
}: SkeletonProps) {
  const baseClass = `${styles.skeleton} ${styles[variant]} ${className}`
  const style = {
    width: width || (variant === "circle" ? "48px" : "100%"),
    height: height || (variant === "circle" ? "48px" : "16px"),
  }

  return <div className={baseClass} style={style} />
}

export function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <Skeleton variant="circle" width="48px" height="48px" />
      <div className={styles.textGroup}>
        <Skeleton width="60%" height="16px" />
        <Skeleton width="40%" height="12px" />
      </div>
    </div>
  )
}
