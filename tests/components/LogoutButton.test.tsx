import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LogoutButton from "@/components/Navbar/LogoutButton";

vi.mock("@/hooks", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  logoutUser: vi.fn(),
}));

// Import after mocking
import { useUser } from "@/hooks";
import { logoutUser } from "@/lib/firebase";

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when user is not authenticated", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false });

    render(<LogoutButton />);

    expect(
      screen.queryByRole("button", { name: /logout/i }),
    ).not.toBeInTheDocument();
  });

  it("does not render while auth state is loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true });

    render(<LogoutButton />);

    expect(
      screen.queryByRole("button", { name: /logout/i }),
    ).not.toBeInTheDocument();
  });

  it("renders when user is authenticated", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@example.com", displayName: "Test User" },
      loading: false,
    });

    render(<LogoutButton />);

    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("calls logoutUser when clicked", async () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@example.com", displayName: "Test User" },
      loading: false,
    });

    vi.mocked(logoutUser).mockResolvedValue(undefined);

    const { userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

    render(<LogoutButton />);

    const button = screen.getByRole("button", { name: /logout/i });
    await user.click(button);

    expect(vi.mocked(logoutUser)).toHaveBeenCalled();
  });
});
