import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./auth";

// For login, we use a generic error message for security
// This prevents username enumeration attacks
const LOGIN_ERROR_MESSAGE = "Invalid email or password";

export function getLoginAuthErrorMessage(error: unknown): string {
  // All login errors return the same generic message for security
  return LOGIN_ERROR_MESSAGE;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}
