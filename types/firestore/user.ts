/**
 * User document as stored in the Firestore users collection
 * Created during signup in lib/firebase/signup.ts
 * Named FirestoreUser to avoid collision with the auth User type
 */
export interface FirestoreUser {
  codename: string;
  id: string;
}
