import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth } from "./auth";
import { db } from "./firestore";
import { generateCodename } from "@/lib/codename";

const firebaseAuthErrors: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists",
  "auth/invalid-email": "Please enter a valid email address",
  "auth/operation-not-allowed": "Email/password sign-up is not enabled",
  "auth/weak-password": "Password must be at least 6 characters",
  "auth/network-request-failed": "Network error. Please check your connection",
  "auth/too-many-requests": "Too many attempts. Please try again later",
};

export function getAuthErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (
      firebaseAuthErrors[(error as { code: string }).code] ??
      "Something went wrong. Please try again"
    );
  }
  return "Something went wrong. Please try again";
}

export async function signUpUser(
  email: string,
  password: string,
): Promise<void> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const codename = generateCodename();
  await updateProfile(credential.user, { displayName: codename });

  await setDoc(doc(db, "users", credential.user.uid), {
    codename,
    id: credential.user.uid,
  });
}
