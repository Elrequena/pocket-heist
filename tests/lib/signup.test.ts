import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreateUser = vi.fn();
const mockUpdateProfile = vi.fn();
const mockSetDoc = vi.fn();
const mockDoc = vi.fn();

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: (...args: unknown[]) =>
    mockCreateUser(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  getAuth: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  getFirestore: vi.fn(),
}));

vi.mock("@/lib/firebase/config", () => ({
  app: {},
}));

vi.mock("@/lib/codename", () => ({
  generateCodename: () => "SilentFoxPrime",
}));

import { signUpUser, getAuthErrorMessage } from "@/lib/firebase/signup";

describe("signUpUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateUser.mockResolvedValue({
      user: { uid: "test-uid-123" },
    });
    mockUpdateProfile.mockResolvedValue(undefined);
    mockSetDoc.mockResolvedValue(undefined);
    mockDoc.mockReturnValue("doc-ref");
  });

  it("calls createUserWithEmailAndPassword with email and password", async () => {
    await signUpUser("test@example.com", "password123");

    expect(mockCreateUser).toHaveBeenCalledWith(
      undefined,
      "test@example.com",
      "password123",
    );
  });

  it("calls updateProfile with generated codename as displayName", async () => {
    await signUpUser("test@example.com", "password123");

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      { uid: "test-uid-123" },
      { displayName: "SilentFoxPrime" },
    );
  });

  it("creates Firestore document with codename and id but no email", async () => {
    await signUpUser("test@example.com", "password123");

    expect(mockDoc).toHaveBeenCalledWith(undefined, "users", "test-uid-123");
    expect(mockSetDoc).toHaveBeenCalledWith("doc-ref", {
      codename: "SilentFoxPrime",
      id: "test-uid-123",
    });
  });

  it("propagates createUserWithEmailAndPassword errors", async () => {
    mockCreateUser.mockRejectedValue({ code: "auth/email-already-in-use" });

    await expect(signUpUser("test@example.com", "password123")).rejects.toEqual(
      { code: "auth/email-already-in-use" },
    );
  });

  it("propagates updateProfile errors", async () => {
    mockUpdateProfile.mockRejectedValue(new Error("profile update failed"));

    await expect(signUpUser("test@example.com", "password123")).rejects.toThrow(
      "profile update failed",
    );
  });

  it("propagates setDoc errors", async () => {
    mockSetDoc.mockRejectedValue(new Error("firestore write failed"));

    await expect(signUpUser("test@example.com", "password123")).rejects.toThrow(
      "firestore write failed",
    );
  });
});

describe("getAuthErrorMessage", () => {
  it("returns mapped message for known Firebase error codes", () => {
    expect(getAuthErrorMessage({ code: "auth/email-already-in-use" })).toBe(
      "An account with this email already exists",
    );

    expect(getAuthErrorMessage({ code: "auth/weak-password" })).toBe(
      "Password must be at least 6 characters",
    );
  });

  it("returns fallback for unknown Firebase error codes", () => {
    expect(getAuthErrorMessage({ code: "auth/unknown-error" })).toBe(
      "Something went wrong. Please try again",
    );
  });

  it("returns fallback for non-Firebase errors", () => {
    expect(getAuthErrorMessage(new Error("random error"))).toBe(
      "Something went wrong. Please try again",
    );
    expect(getAuthErrorMessage(null)).toBe(
      "Something went wrong. Please try again",
    );
    expect(getAuthErrorMessage("string error")).toBe(
      "Something went wrong. Please try again",
    );
  });
});
