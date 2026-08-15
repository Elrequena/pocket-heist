import { getAuth } from "firebase/auth";
import { app } from "./config";

// Initialize Firebase Authentication
export const auth = getAuth(app);
