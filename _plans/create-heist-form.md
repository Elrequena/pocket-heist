# Plan: Create Heist Form

## Context

The create heist page at `app/(dashboard)/heists/create/page.tsx` is currently a placeholder with just a heading. This plan builds the full form that lets authenticated users create a new heist by entering a title, description, and selecting an assignee from a dropdown of Firestore users. On submission, it writes a `CreateHeistInput` document to the `heists` collection and redirects to `/heists`. The deadline is set programmatically to 48 hours from creation. No validation, no success toast, no permission checks.

## Implementation Steps

### Step 1: Create `types/firestore/user.ts` — Firestore User Type

Define a `FirestoreUser` interface matching the shape written during signup in `lib/firebase/signup.ts`:

- `codename: string`
- `id: string`

Named `FirestoreUser` to avoid collision with the auth `User` type in `lib/firebase/types.ts`.

### Step 2: Update `types/firestore/index.ts` — Add USERS collection + re-export

- Add `USERS: "users"` to the `COLLECTIONS` constant
- Add `export * from "./user"` to re-export the new type

### Step 3: Create `components/CreateHeistForm/CreateHeistForm.module.css`

Follow the exact pattern from `SignupForm.module.css`:
- Start with `@reference "../../app/globals.css"`
- Reuse same classes: `.form`, `.field`, `.label`, `.input`, `.error`
- Add `.select` class (styled like `.input`) for the assignee dropdown
- Add `.textarea` class (extending `.input`) for the description field

### Step 4: Create `components/CreateHeistForm/CreateHeistForm.tsx`

`"use client"` component following the SignupForm pattern exactly.

**State** (individual `useState` calls):
- `title`, `description`, `assignedTo` — form field strings
- `users` — `FirestoreUser[]` for the dropdown
- `error` — string
- `loading` — boolean (submission)
- `loadingUsers` — boolean (fetch on mount)

**useEffect — fetch users on mount:**
- `getDocs(collection(db, COLLECTIONS.USERS))` to get all users
- Filter out the current user (`user.uid`) so they can't self-assign
- Set into `users` state, set `loadingUsers = false`

**Auth context:**
- `useUser()` hook provides `user.uid` (for `createdBy`) and `user.displayName` (for `createdByCodename`)
- The dashboard's `ProtectedLayout` guarantees `user` is non-null

**handleSubmit:**
- Calculate `deadline = new Date(Date.now() + 48 * 60 * 60 * 1000)`
- Look up selected user's `codename` from `users` array
- Construct `CreateHeistInput` object with `serverTimestamp()` for `createdAt`, `null` for `finalStatus`
- `addDoc(collection(db, COLLECTIONS.HEISTS), heistData)`
- On success: `router.push("/heists")`
- On error: `setError("Something went wrong. Please try again")`

**JSX structure:**
- `<form className={styles.form}>` with title input, description textarea, assignee `<select>`, error display (`role="alert"`), and submit button (`className="btn"`)
- Dropdown shows "Loading agents..." while fetching, then "Select an agent..." default + user options
- Button text toggles: `"Creating..." / "Create Heist"`

### Step 5: Create `components/CreateHeistForm/index.ts` — Barrel Export

`export { default } from "./CreateHeistForm"`

### Step 6: Update `app/(dashboard)/heists/create/page.tsx`

Import and render `<CreateHeistForm />` below the existing `<h2>` heading. Page stays a server component — the form itself is the client component.

### Step 7: Create `tests/components/CreateHeistForm.test.tsx`

Follow `SignupForm.test.tsx` mock and test patterns.

**Mocks:**
- `next/navigation` — `useRouter` returning `{ push: mockPush }`
- `@/hooks` — `useUser` returning a fake user `{ uid, displayName }`
- `firebase/firestore` — `getDocs`, `addDoc`, `collection`, `serverTimestamp`
- `@/lib/firebase/firestore` — `db` as a placeholder

**Test cases:**
- Renders title, description, and assignee fields
- Renders submit button
- Populates dropdown with fetched users (excludes current user)
- Shows "Loading agents..." while fetching
- Calls `addDoc` with correct `CreateHeistInput` on submit
- Redirects to `/heists` after success
- Shows error on Firestore write failure
- Shows loading state during submission (button disabled, text changes)
- Shows error when user fetch fails

## Key Files

| File | Action |
|------|--------|
| `types/firestore/user.ts` | **Create** — FirestoreUser interface |
| `types/firestore/index.ts` | **Modify** — add USERS collection, re-export |
| `components/CreateHeistForm/CreateHeistForm.tsx` | **Create** — form component |
| `components/CreateHeistForm/CreateHeistForm.module.css` | **Create** — scoped styles |
| `components/CreateHeistForm/index.ts` | **Create** — barrel export |
| `app/(dashboard)/heists/create/page.tsx` | **Modify** — render form |
| `tests/components/CreateHeistForm.test.tsx` | **Create** — tests |

## Reference Files (patterns to follow)

- `components/SignupForm/SignupForm.tsx` — form state/submit/JSX pattern
- `components/SignupForm/SignupForm.module.css` — CSS Module structure
- `tests/components/SignupForm.test.tsx` — mock and test patterns
- `types/firestore/heist.ts` — CreateHeistInput interface
- `lib/firebase/signup.ts` — Firestore write pattern + user doc shape

## Verification

1. Run `npm run test -- CreateHeistForm.test` — all tests pass
2. Run `npm run lint` — no lint errors
3. Run `npm run build` — builds without errors
4. Start dev server, navigate to `/heists/create`, verify form renders with dropdown populated from Firestore users collection
