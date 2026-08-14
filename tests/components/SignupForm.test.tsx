import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SignupForm from "@/components/SignupForm";

describe("SignupForm", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
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

  it("logs error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.type(screen.getByLabelText(/^confirm password$/i), "different");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(consoleErrorSpy).toHaveBeenCalledWith("Passwords do not match");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("logs form data when passwords match", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.type(screen.getByLabelText(/^confirm password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(consoleSpy).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "secret123",
    });
  });

  it("clears all fields after successful submission", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.type(screen.getByLabelText(/^confirm password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(screen.getByLabelText(/email/i)).toHaveValue("");
    expect(screen.getByLabelText(/^password$/i)).toHaveValue("");
    expect(screen.getByLabelText(/^confirm password$/i)).toHaveValue("");
  });

  it("renders a link to the login page", () => {
    render(<SignupForm />);
    const loginLink = screen.getByRole("link", { name: /log in/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
