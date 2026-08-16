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
import ProtectedLayout from "@/components/ProtectedLayout";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

describe("ProtectedLayout", () => {
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
      <ProtectedLayout>
        <div>Content</div>
      </ProtectedLayout>,
    );
    expect(screen.getByTestId("auth-loading")).toBeInTheDocument();
  });

  it("renders children when user is authenticated", () => {
    const mockUser = {
      uid: "123",
      email: "test@example.com",
      displayName: "Test",
    };
    vi.mocked(useUser).mockReturnValue({
      user: mockUser,
      loading: false,
    } as any);

    render(
      <ProtectedLayout>
        <div>Protected Content</div>
      </ProtectedLayout>,
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("shows dashboard variant of loading screen", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: true,
    } as any);

    render(
      <ProtectedLayout>
        <div>Content</div>
      </ProtectedLayout>,
    );
    expect(screen.getByTestId("auth-loading")).toHaveTextContent("dashboard");
  });
});
