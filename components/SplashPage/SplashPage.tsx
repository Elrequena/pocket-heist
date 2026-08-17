import Link from "next/link";
import styles from "./SplashPage.module.css";

export default function SplashPage() {
  return (
    <div className={`${styles.splashContainer} min-h-screen bg-dark`}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>CLASSIFIED OPERATIONS</div>
          <h1 className={styles.heroTitle}>Pocket Heist</h1>
          <p className={styles.heroSubtitle}>
            Turn your workplace into a mission. Create thrilling tasks, assemble
            your team, and execute the perfect heist. Every challenge is an
            adventure waiting to happen.
          </p>

          {/* CTA Buttons */}
          <div className={styles.ctaGroup}>
            <Link href="/signup" className="btn">
              Begin Your First Mission
            </Link>
            <Link href="/login" className={styles.secondaryLink}>
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Mission Briefing Section */}
      <div className={styles.briefingSection}>
        <h2 className={styles.sectionTitle}>What Makes a Perfect Heist?</h2>

        <div className={styles.briefingGrid}>
          {/* Mission Card 1 */}
          <div className={styles.briefingCard}>
            <div className={styles.cardCode}>OPERATION-01</div>
            <h3 className={styles.cardTitle}>Create & Plan</h3>
            <p className={styles.cardDescription}>
              Design exciting missions for your team. Set objectives, deadlines,
              and success criteria. Every heist needs a solid plan.
            </p>
          </div>

          {/* Mission Card 2 */}
          <div className={styles.briefingCard}>
            <div className={styles.cardCode}>OPERATION-02</div>
            <h3 className={styles.cardTitle}>Coordinate Teams</h3>
            <p className={styles.cardDescription}>
              Assemble your elite team members. Delegate responsibilities and
              watch collaboration happen in real-time.
            </p>
          </div>

          {/* Mission Card 3 */}
          <div className={styles.briefingCard}>
            <div className={styles.cardCode}>OPERATION-03</div>
            <h3 className={styles.cardTitle}>Execute & Celebrate</h3>
            <p className={styles.cardDescription}>
              Track progress and celebrate wins. Mark missions complete and
              unlock achievements with your team.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Signal Section */}
      <div className={styles.trustSection}>
        <p className={styles.trustText}>
          Join teams transforming workplace culture through mission-driven
          engagement.
        </p>
      </div>
    </div>
  );
}
