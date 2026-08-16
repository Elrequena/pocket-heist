import { vi } from "vitest";

// Mock Firebase before any imports
vi.mock("@/lib/firebase/config", () => ({
  app: {},
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/components/AuthLoadingScreen", () => ({
  default: ({ variant }: { variant?: string }) => (
    <div data-testid="auth-loading">{variant}</div>
  ),
}));

import { render, screen } from "@testing-library/react";
import PublicLayout from "@/components/PublicLayout";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

describe("PublicLayout", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);
  });

  it("shows loading screen while loading", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: true,
    } as any);

    render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>,
    );
    expect(screen.getByTestId("auth-loading")).toBeInTheDocument();
  });

  it("renders children when user is not authenticated", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: false,
    } as any);

    render(
      <PublicLayout>
        <div>Public Content</div>
      </PublicLayout>,
    );
    expect(screen.getByText("Public Content")).toBeInTheDocument();
  });

  it("shows public variant of loading screen", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: true,
    } as any);

    render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>,
    );
    expect(screen.getByTestId("auth-loading")).toHaveTextContent("public");
  });
});
