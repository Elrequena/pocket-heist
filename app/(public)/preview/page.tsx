// preview page for newly created UI components

import { Skeleton, SkeletonCard } from "@/components/Skeleton"
import Avatar from "@/components/Avatar"

export default function PreviewPage() {
  return (
    <div className="page-content">
      <h2>Component Preview</h2>

      <section className="mt-8">
        <h3>Avatar Component</h3>

        <div className="variants-grid mt-6">
          <div className="variant-box">
            <p className="text-sm text-body mb-3">Small (alice)</p>
            <div className="flex justify-center">
              <Avatar name="alice" size="sm" />
            </div>
          </div>

          <div className="variant-box">
            <p className="text-sm text-body mb-3">Medium (john)</p>
            <div className="flex justify-center">
              <Avatar name="john" size="md" />
            </div>
          </div>

          <div className="variant-box">
            <p className="text-sm text-body mb-3">Large (sarah)</p>
            <div className="flex justify-center">
              <Avatar name="sarah" size="lg" />
            </div>
          </div>

          <div className="variant-box">
            <p className="text-sm text-body mb-3">PascalCase (JohnDoe)</p>
            <div className="flex justify-center">
              <Avatar name="JohnDoe" size="md" />
            </div>
          </div>

          <div className="variant-box">
            <p className="text-sm text-body mb-3">PascalCase (AliceBrown)</p>
            <div className="flex justify-center">
              <Avatar name="AliceBrown" size="md" />
            </div>
          </div>

          <div className="variant-box">
            <p className="text-sm text-body mb-3">Hyphenated (alice-smith)</p>
            <div className="flex justify-center">
              <Avatar name="alice-smith" size="md" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h3>Skeleton Grid Preview</h3>

        <div className="skeleton-grid mt-6">
          {/* Repeated SkeletonCard items to show grid layout */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h3>Individual Skeleton Variants</h3>

        <div className="variants-grid mt-6">
          <div className="variant-box">
            <p className="text-sm text-body mb-3">Text Skeleton:</p>
            <Skeleton variant="text" />
          </div>

          <div className="variant-box">
            <p className="text-sm text-body mb-3">Circle Skeleton:</p>
            <div className="flex justify-center">
              <Skeleton variant="circle" width="64px" height="64px" />
            </div>
          </div>

          <div className="variant-box">
            <p className="text-sm text-body mb-3">Card Skeleton:</p>
            <Skeleton variant="card" />
          </div>

          <div className="variant-box">
            <p className="text-sm text-body mb-3">Custom Width:</p>
            <Skeleton width="200px" height="20px" />
          </div>

          <div className="variant-box">
            <p className="text-sm text-body mb-3">Multiple Lines:</p>
            <div className="space-y-2">
              <Skeleton width="100%" height="16px" />
              <Skeleton width="85%" height="16px" />
              <Skeleton width="70%" height="16px" />
            </div>
          </div>

          <div className="variant-box">
            <p className="text-sm text-body mb-3">Mixed Sizes:</p>
            <div className="space-y-2">
              <Skeleton width="100%" height="20px" />
              <Skeleton width="60%" height="12px" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
