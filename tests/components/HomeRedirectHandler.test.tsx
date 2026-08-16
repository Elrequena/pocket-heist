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
  default: () => <div data-testid="auth-loading">Loading</div>,
}));

import { render, screen } from "@testing-library/react";
import HomeRedirectHandler from "@/components/HomeRedirectHandler";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

describe("HomeRedirectHandler", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);
  });

  it("shows loading screen initially", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: true,
    } as any);

    render(<HomeRedirectHandler />);
    expect(screen.getByTestId("auth-loading")).toBeInTheDocument();
  });

  it("redirects to /heists when user is authenticated", () => {
    const mockUser = {
      uid: "123",
      email: "test@example.com",
      displayName: "Test",
    };
    vi.mocked(useUser).mockReturnValue({
      user: mockUser,
      loading: false,
    } as any);

    render(<HomeRedirectHandler />);

    expect(mockPush).toHaveBeenCalledWith("/heists");
  });

  it("redirects to /login when user is not authenticated", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: false,
    } as any);

    render(<HomeRedirectHandler />);

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("always shows loading screen while loading", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: true,
    } as any);

    render(<HomeRedirectHandler />);
    expect(screen.getByTestId("auth-loading")).toBeInTheDocument();
  });
});
