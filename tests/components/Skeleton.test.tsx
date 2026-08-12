import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Skeleton, SkeletonCard } from "@/components/Skeleton"

describe("Skeleton Component", () => {
  it("renders skeleton with default text variant", () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.querySelector(".skeleton")
    expect(skeleton).toBeInTheDocument()
  })

  it("renders circle variant with correct border-radius", () => {
    const { container } = render(<Skeleton variant="circle" />)
    const skeleton = container.querySelector(".circle")
    expect(skeleton).toBeInTheDocument()
  })

  it("applies custom width and height", () => {
    const { container } = render(
      <Skeleton width="200px" height="50px" variant="text" />
    )
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton.style.width).toBe("200px")
    expect(skeleton.style.height).toBe("50px")
  })

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="custom-class" />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton.classList.contains("custom-class")).toBe(true)
  })
})

describe("SkeletonCard Component", () => {
  it("renders card skeleton with circle and text group", () => {
    const { container } = render(<SkeletonCard />)
    const skeletonCard = container.querySelector(".skeletonCard")
    expect(skeletonCard).toBeInTheDocument()

    const circles = container.querySelectorAll(".circle")
    expect(circles.length).toBeGreaterThan(0)

    const textGroup = container.querySelector(".textGroup")
    expect(textGroup).toBeInTheDocument()
  })

  it("renders multiple skeleton elements", () => {
    const { container } = render(<SkeletonCard />)
    const skeletons = container.querySelectorAll(".skeleton")
    expect(skeletons.length).toBeGreaterThan(1)
  })
})
