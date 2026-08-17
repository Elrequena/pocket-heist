import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseHeists = vi.fn();

vi.mock("@/hooks", () => ({
  useHeists: (...args: unknown[]) => mockUseHeists(...args),
}));

vi.mock("@/lib/firebase/config", () => ({
  app: {},
}));

vi.mock("@/lib/firebase/firestore", () => ({
  db: {},
}));

import HeistsPage from "@/app/(dashboard)/heists/page";

function mockHeistsReturn({
  active = { heists: [], loading: false },
  assigned = { heists: [], loading: false },
  expired = { heists: [], loading: false },
} = {}) {
  mockUseHeists.mockImplementation((filter: string) => {
    switch (filter) {
      case "active":
        return active;
      case "assigned":
        return assigned;
      case "expired":
        return expired;
      default:
        return { heists: [], loading: false };
    }
  });
}

describe("HeistsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeistsReturn();
  });

  it("renders all three section headings", () => {
    render(<HeistsPage />);

    expect(
      screen.getByRole("heading", { name: /your active heists/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /heists you've assigned/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /all expired heists/i }),
    ).toBeInTheDocument();
  });

  it("calls useHeists with correct filter strings", () => {
    render(<HeistsPage />);

    expect(mockUseHeists).toHaveBeenCalledWith("active");
    expect(mockUseHeists).toHaveBeenCalledWith("assigned");
    expect(mockUseHeists).toHaveBeenCalledWith("expired");
  });

  it("shows loading state when data is loading", () => {
    mockHeistsReturn({
      active: { heists: [], loading: true },
      assigned: { heists: [], loading: true },
      expired: { heists: [], loading: true },
    });

    render(<HeistsPage />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders heist titles in each section", () => {
    mockHeistsReturn({
      active: {
        heists: [{ id: "h1", title: "Active Mission" }],
        loading: false,
      },
      assigned: {
        heists: [{ id: "h2", title: "Assigned Mission" }],
        loading: false,
      },
      expired: {
        heists: [{ id: "h3", title: "Expired Mission" }],
        loading: false,
      },
    });

    render(<HeistsPage />);

    expect(screen.getByText("Active Mission")).toBeInTheDocument();
    expect(screen.getByText("Assigned Mission")).toBeInTheDocument();
    expect(screen.getByText("Expired Mission")).toBeInTheDocument();
  });

  it("shows empty state messages when no heists exist", () => {
    mockHeistsReturn();
    render(<HeistsPage />);

    expect(
      screen.getByText(/no active heists assigned to you/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/you haven't assigned any heists yet/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/no expired heists found/i)).toBeInTheDocument();
  });
});
