import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockOnSnapshot = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockCollection = vi.fn();

vi.mock("@/lib/firebase/firestore", () => ({
  db: {},
}));

vi.mock("@/lib/firebase/config", () => ({
  app: {},
}));

vi.mock("firebase/firestore", () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  where: (...args: unknown[]) => mockWhere(...args),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  Timestamp: { now: () => ({ seconds: 1000, nanoseconds: 0 }) },
}));

const mockUseUser = vi.fn();

vi.mock("@/hooks/useUser", () => ({
  useUser: () => mockUseUser(),
}));

import { useHeists } from "@/hooks/useHeists";

function TestConsumer({
  filter,
}: {
  filter: "active" | "assigned" | "expired";
}) {
  const { heists, loading } = useHeists(filter);

  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <ul>
        {heists.map((h) => (
          <li key={h.id}>{h.title}</li>
        ))}
      </ul>
    </div>
  );
}

const mockUser = {
  uid: "user-1",
  email: "test@example.com",
  displayName: "Shadow Fox",
};

describe("useHeists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ user: mockUser, loading: false });
    mockCollection.mockReturnValue({ withConverter: vi.fn(() => "heistsRef") });
    mockQuery.mockReturnValue("mockQuery");
    mockWhere.mockImplementation((...args: unknown[]) => args);
    mockOnSnapshot.mockReturnValue(vi.fn());
  });

  it("shows loading state initially", () => {
    mockOnSnapshot.mockReturnValue(vi.fn());
    render(<TestConsumer filter="active" />);

    expect(screen.getByTestId("loading").textContent).toBe("true");
  });

  it("returns heists after snapshot fires", () => {
    mockOnSnapshot.mockImplementation(
      (_, callback: (snapshot: unknown) => void) => {
        callback({
          docs: [
            { data: () => ({ id: "h1", title: "Heist One" }) },
            { data: () => ({ id: "h2", title: "Heist Two" }) },
          ],
        });
        return vi.fn();
      },
    );

    render(<TestConsumer filter="active" />);

    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByText("Heist One")).toBeInTheDocument();
    expect(screen.getByText("Heist Two")).toBeInTheDocument();
  });

  it("returns empty array when user is null for active filter", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<TestConsumer filter="active" />);

    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it("returns empty array when user is null for assigned filter", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<TestConsumer filter="assigned" />);

    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it("proceeds with expired filter even when user is null", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    mockOnSnapshot.mockReturnValue(vi.fn());
    render(<TestConsumer filter="expired" />);

    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it("passes correct where clauses for active filter", () => {
    mockOnSnapshot.mockReturnValue(vi.fn());
    render(<TestConsumer filter="active" />);

    expect(mockWhere).toHaveBeenCalledWith("assignedTo", "==", "user-1");
    expect(mockWhere).toHaveBeenCalledWith(
      "deadline",
      ">",
      expect.objectContaining({ seconds: 1000 }),
    );
  });

  it("passes correct where clauses for assigned filter", () => {
    mockOnSnapshot.mockReturnValue(vi.fn());
    render(<TestConsumer filter="assigned" />);

    expect(mockWhere).toHaveBeenCalledWith("createdBy", "==", "user-1");
    expect(mockWhere).toHaveBeenCalledWith(
      "deadline",
      ">",
      expect.objectContaining({ seconds: 1000 }),
    );
  });

  it("passes correct where clauses for expired filter", () => {
    mockOnSnapshot.mockReturnValue(vi.fn());
    render(<TestConsumer filter="expired" />);

    expect(mockWhere).toHaveBeenCalledWith("finalStatus", "!=", null);
    expect(mockWhere).toHaveBeenCalledWith(
      "deadline",
      "<",
      expect.objectContaining({ seconds: 1000 }),
    );
  });

  it("calls unsubscribe on unmount", () => {
    const mockUnsubscribe = vi.fn();
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { unmount } = render(<TestConsumer filter="active" />);
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
