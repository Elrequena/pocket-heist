import styles from "./Avatar.module.css"

interface AvatarProps {
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

function getInitials(name: string): string {
  // Check if name is PascalCase (has uppercase letters followed by more letters)
  const pascalCasePattern = /^[A-Z][a-z]+[A-Z]/
  if (pascalCasePattern.test(name)) {
    // Return first two uppercase letters
    const uppercase = name.match(/[A-Z]/g)
    if (uppercase && uppercase.length >= 2) {
      return uppercase.slice(0, 2).join("")
    }
  }

  // Return first letter in uppercase
  return name.charAt(0).toUpperCase()
}

export default function Avatar({
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const initials = getInitials(name)

  return (
    <div
      className={`${styles.avatar} ${styles[size]} ${className}`}
      role="img"
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  )
}
