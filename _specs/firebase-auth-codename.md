# Spec for Firebase Auth Integration with Codename Generation

branch: claude/feature/firebase-auth-codename

## Summary

Integrate Firebase Authentication into the signup form at `app/(public)/signup/page.tsx` to enable user account creation. Upon successful signup, automatically generate a random "codename" by combining words from three distinct word sets into PascalCase format. Store the user's codename and Firebase UID in a Firestore `users` collection document, without storing their email address.

## Functional Requirements

- **Firebase Auth Integration**
  - Use Firebase Web SDK to create new user accounts via `createUserWithEmailAndPassword()`
  - Set the user's `displayName` to the generated codename using `updateProfile()`
  - Handle authentication errors gracefully (invalid email, password too weak, account exists, etc.)
  
- **Codename Generation**
  - Create three separate word sets (arrays of strings)
  - Randomly select one word from each set
  - Combine the three words in PascalCase (e.g., "QuantumSilverFox", "NovaNectarDragon")
  - Ensure codenames are unique and deterministic within a single generation (each signup gets a new random codename)

- **Firestore User Document**
  - Create a new document in the `users` collection with document ID equal to the user's Firebase UID
  - Document structure: `{ codename: string, id: string }` where `id` is the Firebase UID
  - Do NOT store email address in Firestore
  - Document is created immediately after user profile update succeeds

- **Form Submission Flow**
  - Hook the existing signup form to call Firebase auth on submit
  - Show loading state during auth request
  - Display error messages if signup fails
  - Redirect to dashboard/heists page on successful signup
  - Prevent form submission while a request is in progress

## Figma Design Reference

None - using existing signup form design

## Possible Edge Cases

- User closes browser/navigates away during signup (auth succeeds but Firestore doc creation fails)
- Network timeout during user profile update or Firestore write
- Generated codename is somehow already taken (extremely rare with 3 word sets, but possible)
- User tries to sign up with email that already exists in Firebase
- Invalid email format provided
- Password doesn't meet Firebase security requirements
- Firestore security rules might reject writes from unauthenticated context (even though user just created auth account)

## Acceptance Criteria

- [ ] Signup form submits data to Firebase Authentication
- [ ] User account is created in Firebase Auth with email and password
- [ ] Display name is automatically set to a randomly generated codename (PascalCase format)
- [ ] Codename is created from 3 distinct word sets (no duplicates within each set)
- [ ] User document is created in Firestore `users` collection with codename and UID
- [ ] Email is NOT stored in the Firestore user document
- [ ] Signup errors are displayed to user (email exists, weak password, etc.)
- [ ] After successful signup, user is redirected to dashboard/heists page
- [ ] Loading state is shown while request is in progress (no double-submit)
- [ ] All code uses Firebase Web SDK only (no Admin SDK)
- [ ] Signup form is still accessible at `/signup` route

## Open Questions

- Should we log the generated codename somewhere for debugging/verification purposes? No.
- Do we need to handle the edge case where Firestore write fails after auth succeeds? (Should we delete the auth account or create a cleanup task?) No.
- Should codenames be checked for uniqueness in Firestore, or is the probability of collision low enough to ignore? No.
- After successful signup, should we automatically log the user in and navigate, or require them to login separately? auto log

## Testing Guidelines

Create a test file `tests/signup-auth.test.tsx` (or similar) with the following test cases:

- **Firebase Integration**
  - Test that form submission calls `createUserWithEmailAndPassword()` with email and password
  - Test that `updateProfile()` is called with the generated codename
  - Test that form displays error message when signup fails (email exists, weak password, etc.)

- **Codename Generation**
  - Test that codename is generated from three separate word sets
  - Test that codename is in PascalCase format
  - Test that codename changes on each generation (random)

- **Firestore User Document**
  - Test that user document is created in `users` collection
  - Test that document ID is the Firebase UID
  - Test that document contains `codename` and `id` fields
  - Test that document does NOT contain email field

- **Form Behavior**
  - Test that loading state is shown during submission
  - Test that form is disabled during submission (no double-submit)
  - Test that user is redirected to dashboard/heists on success
  - Test that form preserves state on error and allows retry
