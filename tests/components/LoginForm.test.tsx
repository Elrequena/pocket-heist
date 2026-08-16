import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginForm from "@/components/LoginForm";

const mockLoginUser = vi.fn();
const mockGetLoginAuthErrorMessage = vi.fn();

vi.mock("@/lib/firebase/login", () => ({
  loginUser: (...args: unknown[]) => mockLoginUser(...args),
  getLoginAuthErrorMessage: (...args: unknown[]) =>
    mockGetLoginAuthErrorMessage(...args),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginUser.mockResolvedValue(undefined);
    mockGetLoginAuthErrorMessage.mockReturnValue("Invalid email or password");
  });

  it("renders email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it("renders the login submit button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("masks password input by default", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("toggles password visibility when eye icon is clicked", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const toggleButton = screen.getByRole("button", { name: /show password/i });
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("accepts input in email and password fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("calls loginUser and shows success message on success", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith(
        "test@example.com",
        "secret123",
      );
      expect(
        screen.getByText("You've successfully logged in!"),
      ).toBeInTheDocument();
    });
  });

  it("shows error message on login failure", async () => {
    mockLoginUser.mockRejectedValue({ code: "auth/invalid-password" });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid email or password",
      );
    });
  });

  it("shows generic error message for all credentials errors", async () => {
    mockLoginUser.mockRejectedValue({ code: "auth/user-not-found" });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "nonexistent@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "anypassword");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid email or password",
      );
    });
  });

  it("shows loading state during login", async () => {
    mockLoginUser.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    const button = screen.getByRole("button", { name: /logging in/i });
    expect(button).toBeDisabled();
  });

  it("disables button during loading", async () => {
    mockLoginUser.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();
  });

  it("preserves field values on error", async () => {
    mockLoginUser.mockRejectedValue({ code: "auth/invalid-password" });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
    expect(screen.getByLabelText(/^password$/i)).toHaveValue("wrongpassword");
  });

  it("closes success message and clears form when user clicks 'Got it'", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    // Wait for success message to appear
    const successText = await screen.findByText(
      "You've successfully logged in!",
    );
    expect(successText).toBeInTheDocument();

    // Click the Got it button
    const gotItButton = screen.getByRole("button", { name: /got it/i });
    await user.click(gotItButton);

    // Wait for the form fields to be cleared
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toHaveValue("");
      expect(screen.getByLabelText(/^password$/i)).toHaveValue("");
    });
  });

  it("renders a link to the signup page", () => {
    render(<LoginForm />);
    const signupLink = screen.getByRole("link", { name: /sign up/i });
    expect(signupLink).toHaveAttribute("href", "/signup");
  });
});
