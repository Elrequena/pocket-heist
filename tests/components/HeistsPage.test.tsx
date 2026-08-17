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
} = {}) {
  mockUseHeists.mockImplementation((filter: string) => {
    switch (filter) {
      case "active":
        return active;
      case "assigned":
        return assigned;
      default:
        return { heists: [], loading: false };
    }
  });
}

function createMockHeist(id: string, title: string) {
  return {
    id,
    title,
    description: "Test description",
    createdBy: "uid1",
    createdByCodename: "Creator",
    assignedTo: "uid2",
    assignedToCodename: "Assignee",
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    finalStatus: null,
    createdAt: new Date(),
  };
}

describe("HeistsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeistsReturn();
  });

  it("renders active and assigned section headings", () => {
    render(<HeistsPage />);

    expect(
      screen.getByRole("heading", { name: /active heists/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /assigned heists/i }),
    ).toBeInTheDocument();
  });

  it("does not render an expired heists section", () => {
    render(<HeistsPage />);

    expect(
      screen.queryByRole("heading", { name: /expired/i }),
    ).not.toBeInTheDocument();
  });

  it("calls useHeists with active and assigned filters only", () => {
    render(<HeistsPage />);

    expect(mockUseHeists).toHaveBeenCalledWith("active");
    expect(mockUseHeists).toHaveBeenCalledWith("assigned");
    expect(mockUseHeists).not.toHaveBeenCalledWith("expired");
  });

  it("renders heist cards with links when data is loaded", () => {
    mockHeistsReturn({
      active: {
        heists: [createMockHeist("h1", "Active Mission")],
        loading: false,
      },
      assigned: {
        heists: [createMockHeist("h2", "Assigned Mission")],
        loading: false,
      },
    });

    render(<HeistsPage />);

    const activeLink = screen.getByRole("link", { name: /active mission/i });
    expect(activeLink).toHaveAttribute("href", "/heists/h1");

    const assignedLink = screen.getByRole("link", {
      name: /assigned mission/i,
    });
    expect(assignedLink).toHaveAttribute("href", "/heists/h2");
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
  });
});
