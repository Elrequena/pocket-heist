import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SignupForm from "@/components/SignupForm";

const mockPush = vi.fn();
const mockSignUpUser = vi.fn();
const mockGetAuthErrorMessage = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/firebase", () => ({
  signUpUser: (...args: unknown[]) => mockSignUpUser(...args),
  getAuthErrorMessage: (...args: unknown[]) => mockGetAuthErrorMessage(...args),
}));

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUpUser.mockResolvedValue(undefined);
    mockGetAuthErrorMessage.mockReturnValue(
      "Something went wrong. Please try again",
    );
  });

  it("renders email, password, and confirm password fields", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
  });

  it("renders the sign up submit button", () => {
    render(<SignupForm />);
    expect(
      screen.getByRole("button", { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  it("masks both password fields by default", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
      "type",
      "password",
    );
    expect(screen.getByLabelText(/^confirm password$/i)).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("toggles password visibility independently", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const toggleButtons = screen.getAllByRole("button", { name: /show/i });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/^confirm password$/i);

    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(confirmInput).toHaveAttribute("type", "password");

    await user.click(toggleButtons[1]);
    expect(confirmInput).toHaveAttribute("type", "text");
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.type(screen.getByLabelText(/^confirm password$/i), "different");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Passwords do not match",
    );
    expect(mockSignUpUser).not.toHaveBeenCalled();
  });

  it("calls signUpUser and redirects on success", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.type(screen.getByLabelText(/^confirm password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignUpUser).toHaveBeenCalledWith(
        "test@example.com",
        "secret123",
      );
      expect(mockPush).toHaveBeenCalledWith("/heists");
    });
  });

  it("shows loading state during signup", async () => {
    mockSignUpUser.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.type(screen.getByLabelText(/^confirm password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    const button = screen.getByRole("button", { name: /signing up/i });
    expect(button).toBeDisabled();
  });

  it("shows error message on signup failure", async () => {
    mockSignUpUser.mockRejectedValue({ code: "auth/email-already-in-use" });
    mockGetAuthErrorMessage.mockReturnValue(
      "An account with this email already exists",
    );
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.type(screen.getByLabelText(/^confirm password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "An account with this email already exists",
      );
    });
  });

  it("preserves field values on error", async () => {
    mockSignUpUser.mockRejectedValue({ code: "auth/weak-password" });
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "short");
    await user.type(screen.getByLabelText(/^confirm password$/i), "short");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
    expect(screen.getByLabelText(/^password$/i)).toHaveValue("short");
    expect(screen.getByLabelText(/^confirm password$/i)).toHaveValue("short");
  });

  it("renders a link to the login page", () => {
    render(<SignupForm />);
    const loginLink = screen.getByRole("link", { name: /log in/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
