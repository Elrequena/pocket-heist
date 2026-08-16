import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock LogoutButton to avoid Firebase initialization in tests
vi.mock("@/components/Navbar/LogoutButton", () => ({
  default: () => null,
}));

// component imports
import Navbar from "@/components/Navbar";

describe("Navbar", () => {
  it("renders the main heading", () => {
    render(<Navbar />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("renders the Create Heist link", () => {
    render(<Navbar />);

    const createLink = screen.getByRole("link", { name: /create new heist/i });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute("href", "/heists/create");
  });
});
