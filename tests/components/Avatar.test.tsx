import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Avatar from "@/components/Avatar"

describe("Avatar", () => {
  it("renders successfully with a name prop", () => {
    render(<Avatar name="john" />)
    const avatar = screen.getByRole("img", { hidden: true })
    expect(avatar).toBeInTheDocument()
  })

  it("displays first letter for lowercase names", () => {
    render(<Avatar name="alice" />)
    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("displays first two uppercase letters for PascalCase names", () => {
    render(<Avatar name="JohnDoe" />)
    expect(screen.getByText("JD")).toBeInTheDocument()
  })

  it("displays first letter for single word mixed case", () => {
    render(<Avatar name="Sarah" />)
    expect(screen.getByText("S")).toBeInTheDocument()
  })

  it("handles names with special characters", () => {
    render(<Avatar name="alice-smith" />)
    expect(screen.getByText("A")).toBeInTheDocument()
  })
})
