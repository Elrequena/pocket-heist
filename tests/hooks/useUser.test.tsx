import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUser } from "@/hooks";
import AuthProvider from "@/components/AuthProvider";

// Mock Firebase auth
const mockOnAuthStateChanged = vi.fn();

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  getAuth: vi.fn(),
}));

vi.mock("@/lib/firebase/config", () => ({
  app: {},
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(),
}));

function TestConsumer() {
  const { user, loading } = useUser();
  if (loading) return <p>Loading</p>;
  if (!user) return <p>No user</p>;
  return <p>{user.email}</p>;
}

describe("useUser", () => {
  beforeEach(() => {
    mockOnAuthStateChanged.mockReset();
    mockOnAuthStateChanged.mockReturnValue(vi.fn());
  });

  it("returns loading true initially", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("returns null when no user is logged in", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByText("No user")).toBeInTheDocument();
  });

  it("returns user data when user is logged in", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback({
        uid: "123",
        email: "test@example.com",
        displayName: "Test User",
      });
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("updates when auth state changes", () => {
    let authCallback: (user: unknown) => void;

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      authCallback = callback;
      callback(null);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByText("No user")).toBeInTheDocument();

    act(() => {
      authCallback({
        uid: "123",
        email: "test@example.com",
        displayName: "Test User",
      });
    });
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("cleans up listener on unmount", () => {
    const unsubscribe = vi.fn();

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null);
      return unsubscribe;
    });

    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("throws when used outside AuthProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useUser must be used within an AuthProvider",
    );

    spy.mockRestore();
  });
});
