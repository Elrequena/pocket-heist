# Plan: Firebase Auth Signup with Codename Generation

## Context

The signup form at `components/SignupForm/SignupForm.tsx` currently only logs credentials to the console — no actual auth, no error display, no loading state, no redirect. The Firebase layer (`lib/firebase/`) already has `auth` and `db` instances exported, plus an `AuthProvider` with `onAuthStateChanged` and a `useUser` hook. This change wires the signup form to Firebase Auth, generates a random PascalCase codename from 3 word sets, stores `{ codename, id }` (no email) in Firestore, and redirects to `/heists` on success.

## Implementation Steps

### 1. Create codename generator — `lib/codename.ts` (NEW)

A pure utility function with zero dependencies:
- Three `const` arrays (~15 words each): adjectives (`Silent`, `Swift`, `Phantom`, …), nouns (`Fox`, `Hawk`, `Viper`, …), suffixes (`Prime`, `Alpha`, `Nova`, …)
- `export function generateCodename(): string` — picks one random word from each array, concatenates them (already PascalCase). Example: `SilentFoxPrime`

### 2. Create signup service — `lib/firebase/signup.ts` (NEW)

Encapsulates the 3-step signup sequence:

```
signUpUser(email, password) → void (throws on error)
  1. createUserWithEmailAndPassword(auth, email, password)
  2. updateProfile(user, { displayName: codename })
  3. setDoc(doc(db, "users", uid), { codename, id: uid })
```

Also exports `getAuthErrorMessage(error: unknown): string` — maps Firebase error codes (`auth/email-already-in-use`, `auth/weak-password`, etc.) to user-friendly strings with a fallback.

Imports to use: `createUserWithEmailAndPassword`, `updateProfile` from `firebase/auth`; `doc`, `setDoc` from `firebase/firestore`; `auth` from `./auth`; `db` from `./firestore`; `generateCodename` from `@/lib/codename`.

### 3. Update barrel export — `lib/firebase/index.ts` (MODIFY)

Add: `export { signUpUser, getAuthErrorMessage } from "./signup"`

### 4. Update SignupForm component — `components/SignupForm/SignupForm.tsx` (MODIFY)

- Add imports: `useRouter` from `next/navigation`, `signUpUser` and `getAuthErrorMessage` from `@/lib/firebase`
- Add state: `error` (string), `loading` (boolean); add `const router = useRouter()`
- Replace `handleSubmit` body:
  - Set `error("")` on entry
  - Password mismatch → `setError("Passwords do not match")` + return (replaces `console.error`)
  - Wrap `signUpUser(email, password)` in try/catch/finally with `setLoading`
  - On success: `router.push("/heists")`
  - On error: `setError(getAuthErrorMessage(err))`
  - Remove `console.log`, remove field-clearing logic (user is redirected away)
- Add error display in JSX before the submit button: `{error && <p className={styles.error} role="alert">{error}</p>}`
- Add `disabled={loading}` to submit button; change text to `{loading ? "Signing up..." : "Sign Up"}`

### 5. Add error styling — `components/SignupForm/SignupForm.module.css` (MODIFY)

Add at end:
```css
.error {
  @apply text-sm text-error text-center;
}
```

Uses existing `text-error` (#FF6467) from `globals.css`.

### 6. Write tests

**`tests/lib/codename.test.ts` (NEW)** — Pure function tests:
- Returns a non-empty string
- Matches PascalCase pattern `/^[A-Z][a-zA-Z]+$/`
- Generates varied results across multiple calls

**`tests/lib/signup.test.ts` (NEW)** — Service tests with mocked Firebase:
- `signUpUser` calls `createUserWithEmailAndPassword` with correct args
- `signUpUser` calls `updateProfile` with codename as displayName
- `signUpUser` calls `setDoc` with `{ codename, id }` (no email)
- Propagates errors from each step
- `getAuthErrorMessage` returns mapped messages for known codes, fallback for unknown

**`tests/components/SignupForm.test.tsx` (MODIFY)** — Updated component tests:
- Mock `next/navigation` (useRouter → mockPush) and `@/lib/firebase` (signUpUser, getAuthErrorMessage)
- Remove console spy setup and old tests: "logs form data when passwords match", "clears all fields after successful submission", "logs error when passwords do not match"
- Keep: renders fields, renders button, masks passwords, toggles visibility, login link
- Add: shows error on password mismatch (check `role="alert"`), calls signUpUser and redirects on success, shows loading state during signup, shows error message on failure, preserves field values on error

## Files Changed

| File | Action |
|------|--------|
| `lib/codename.ts` | CREATE |
| `lib/firebase/signup.ts` | CREATE |
| `lib/firebase/index.ts` | MODIFY — add exports |
| `components/SignupForm/SignupForm.tsx` | MODIFY — wire auth |
| `components/SignupForm/SignupForm.module.css` | MODIFY — add .error |
| `tests/lib/codename.test.ts` | CREATE |
| `tests/lib/signup.test.ts` | CREATE |
| `tests/components/SignupForm.test.tsx` | MODIFY — update for new behavior |

## Verification

1. Run `npm run test` — all new and updated tests pass
2. Run `npm run lint` — no lint errors
3. Run `npm run dev` and navigate to `/signup` — form renders, submit with valid data creates Firebase user, redirects to `/heists`
4. Check Firebase Console — user created with codename as displayName; Firestore `users` collection has doc with `{ codename, id }` and no email
