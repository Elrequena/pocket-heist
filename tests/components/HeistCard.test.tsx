import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/firebase/config", () => ({
  app: {},
}));

vi.mock("@/lib/firebase/firestore", () => ({
  db: {},
}));

import { HeistCard, HeistCardSkeleton } from "@/components/HeistCard";
import type { Heist } from "@/types/firestore";

function createMockHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "h1",
    title: "Leave a mysterious sticky note",
    description: "A test heist description",
    createdBy: "uid1",
    createdByCodename: "NightOwl",
    assignedTo: "uid2",
    assignedToCodename: "SecretSauceAgent",
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
    finalStatus: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("HeistCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title as a link to the heist detail page", () => {
    render(<HeistCard heist={createMockHeist()} />);

    const link = screen.getByRole("link", {
      name: /leave a mysterious sticky note/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/heists/h1");
  });

  it("renders the assignee codename", () => {
    render(<HeistCard heist={createMockHeist()} />);

    expect(screen.getByText(/@SecretSauceAgent/)).toBeInTheDocument();
  });

  it("renders the creator codename", () => {
    render(<HeistCard heist={createMockHeist()} />);

    expect(screen.getByText(/@NightOwl/)).toBeInTheDocument();
  });

  it("renders the formatted deadline", () => {
    const deadline = new Date(2025, 11, 7, 14, 0);
    render(<HeistCard heist={createMockHeist({ deadline })} />);

    expect(screen.getByText(/Dec 7/)).toBeInTheDocument();
  });

  it("displays time remaining when deadline is in the future", () => {
    const deadline = new Date(Date.now() + 5 * 60 * 60 * 1000);
    render(<HeistCard heist={createMockHeist({ deadline })} />);

    expect(screen.getByText(/\d+h \d+m/)).toBeInTheDocument();
  });

  it("displays days and hours for deadlines more than 24h away", () => {
    const deadline = new Date(Date.now() + 50 * 60 * 60 * 1000);
    render(<HeistCard heist={createMockHeist({ deadline })} />);

    expect(screen.getByText(/\d+d \d+h/)).toBeInTheDocument();
  });

  it("displays Overdue when deadline has passed", () => {
    const deadline = new Date(Date.now() - 60 * 1000);
    render(<HeistCard heist={createMockHeist({ deadline })} />);

    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });
});

describe("HeistCardSkeleton", () => {
  it("renders without errors", () => {
    const { container } = render(<HeistCardSkeleton />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
