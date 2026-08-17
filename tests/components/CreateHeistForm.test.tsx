import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateHeistForm from "@/components/CreateHeistForm";

const mockPush = vi.fn();
const mockAddDoc = vi.fn();
const mockGetDocs = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/hooks", () => ({
  useUser: () => ({
    user: {
      uid: "user-1",
      email: "test@example.com",
      displayName: "Shadow Fox",
    },
    loading: false,
  }),
}));

vi.mock("@/lib/firebase/firestore", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  serverTimestamp: () => "SERVER_TIMESTAMP",
}));

function createMockSnapshot(users: Array<{ codename: string; id: string }>) {
  return {
    docs: users.map((u) => ({
      data: () => u,
      id: u.id,
    })),
  };
}

describe("CreateHeistForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDocs.mockResolvedValue(
      createMockSnapshot([
        { codename: "Night Owl", id: "user-2" },
        { codename: "Ghost Rider", id: "user-3" },
        { codename: "Shadow Fox", id: "user-1" },
      ]),
    );
    mockAddDoc.mockResolvedValue({ id: "heist-1" });
  });

  it("renders title, description, and assignee fields", async () => {
    render(<CreateHeistForm />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assign to/i)).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<CreateHeistForm />);
    expect(
      screen.getByRole("button", { name: /create heist/i }),
    ).toBeInTheDocument();
  });

  it("populates assignee dropdown with fetched users excluding current user", async () => {
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByText("Night Owl")).toBeInTheDocument();
      expect(screen.getByText("Ghost Rider")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("option", { name: "Shadow Fox" }),
    ).not.toBeInTheDocument();
  });

  it("shows loading state while fetching users", () => {
    mockGetDocs.mockReturnValue(new Promise(() => {}));
    render(<CreateHeistForm />);

    expect(screen.getByText("Loading agents...")).toBeInTheDocument();
  });

  it("calls addDoc with correct data on submit", async () => {
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByText("Night Owl")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/title/i), "Operation Nightfall");
    await user.type(screen.getByLabelText(/description/i), "Steal the plans");
    await user.selectOptions(screen.getByLabelText(/assign to/i), "user-2");
    await user.click(screen.getByRole("button", { name: /create heist/i }));

    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          title: "Operation Nightfall",
          description: "Steal the plans",
          createdBy: "user-1",
          createdByCodename: "Shadow Fox",
          assignedTo: "user-2",
          assignedToCodename: "Night Owl",
          finalStatus: null,
          createdAt: "SERVER_TIMESTAMP",
        }),
      );
    });

    const callArgs = mockAddDoc.mock.calls[0][1];
    expect(callArgs.deadline).toBeInstanceOf(Date);
  });

  it("redirects to /heists after successful creation", async () => {
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByText("Night Owl")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/title/i), "Test Heist");
    await user.type(screen.getByLabelText(/description/i), "A test");
    await user.selectOptions(screen.getByLabelText(/assign to/i), "user-2");
    await user.click(screen.getByRole("button", { name: /create heist/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/heists");
    });
  });

  it("shows error on Firestore write failure", async () => {
    mockAddDoc.mockRejectedValue(new Error("Firestore error"));
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByText("Night Owl")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/title/i), "Test Heist");
    await user.type(screen.getByLabelText(/description/i), "A test");
    await user.selectOptions(screen.getByLabelText(/assign to/i), "user-2");
    await user.click(screen.getByRole("button", { name: /create heist/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Something went wrong. Please try again",
      );
    });
  });

  it("shows loading state during submission", async () => {
    mockAddDoc.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByText("Night Owl")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/title/i), "Test Heist");
    await user.type(screen.getByLabelText(/description/i), "A test");
    await user.selectOptions(screen.getByLabelText(/assign to/i), "user-2");
    await user.click(screen.getByRole("button", { name: /create heist/i }));

    const button = screen.getByRole("button", { name: /creating/i });
    expect(button).toBeDisabled();
  });

  it("shows error when user fetch fails", async () => {
    mockGetDocs.mockRejectedValue(new Error("Network error"));
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Failed to load users",
      );
    });
  });
});
