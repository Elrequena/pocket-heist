import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginUser, getLoginAuthErrorMessage } from "@/lib/firebase/login";

const mockSignInWithEmailAndPassword = vi.fn();

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: (...args: unknown[]) =>
    mockSignInWithEmailAndPassword(...args),
}));

describe("Firebase Login Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginUser", () => {
    it("calls signInWithEmailAndPassword with correct arguments", async () => {
      mockSignInWithEmailAndPassword.mockResolvedValue({});
      await loginUser("test@example.com", "password123");
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "test@example.com",
        "password123",
      );
    });

    it("throws on Firebase authentication error", async () => {
      const error = new Error("auth/invalid-password");
      mockSignInWithEmailAndPassword.mockRejectedValue(error);
      await expect(
        loginUser("test@example.com", "wrongpassword"),
      ).rejects.toThrow("auth/invalid-password");
    });
  });

  describe("getLoginAuthErrorMessage", () => {
    it("returns generic message for user-not-found error", () => {
      const error = { code: "auth/user-not-found" };
      expect(getLoginAuthErrorMessage(error)).toBe("Invalid email or password");
    });

    it("returns generic message for invalid-password error", () => {
      const error = { code: "auth/invalid-password" };
      expect(getLoginAuthErrorMessage(error)).toBe("Invalid email or password");
    });

    it("returns generic message for any Firebase error", () => {
      const error = { code: "auth/network-request-failed" };
      expect(getLoginAuthErrorMessage(error)).toBe("Invalid email or password");
    });

    it("returns generic message for unknown error", () => {
      expect(getLoginAuthErrorMessage({})).toBe("Invalid email or password");
    });

    it("returns generic message for null/undefined", () => {
      expect(getLoginAuthErrorMessage(null)).toBe("Invalid email or password");
      expect(getLoginAuthErrorMessage(undefined)).toBe(
        "Invalid email or password",
      );
    });
  });
});
