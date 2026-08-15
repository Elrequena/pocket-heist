import { getFirestore } from "firebase/firestore";
import { app } from "./config";

// Initialize Cloud Firestore
export const db = getFirestore(app);
