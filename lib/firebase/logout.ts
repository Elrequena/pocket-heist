import { signOut } from "firebase/auth";
import { auth } from "./auth";

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
