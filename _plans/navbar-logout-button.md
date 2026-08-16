# Plan: Navbar Logout Button

## Context

The app has Firebase Authentication with signup and an `AuthProvider` that exposes `{ user, loading }` via `useUser()`. However, there's no way to sign out. We need a logout button in the Navbar that's visible only when authenticated, calling Firebase `signOut` on click. No redirects or toasts needed.

And do not use mocks to test for now

## Approach: Extract a Client Sub-Component

The Navbar is currently a **server component** (no `"use client"`). Rather than converting it entirely, we'll extract a `LogoutButton` client sub-component that handles auth state and the sign-out action. This keeps the Navbar as a server component — matching the project's preference.

## Implementation Steps

### 1. Create `lib/firebase/logout.ts`

A `signOutUser()` async function following the `signup.ts` pattern:
- Import `signOut` from `"firebase/auth"` and `auth` from `"./auth"`
- Export `async function signOutUser(): Promise<void>` that calls `signOut(auth)`

### 2. Update `lib/firebase/index.ts`

Add barrel export: `export { signOutUser } from "./logout"`

### 3. Create `components/Navbar/LogoutButton.tsx`

Client component (`"use client"`):
- Uses `useUser()` to check auth state
- Returns `null` when `loading === true` or `user === null`
- Renders a `<button>` with text "Logout" and `className={styles.btnOutline}`
- `onClick` calls `signOutUser()` in a try/catch (logs errors to console)
- Shares `Navbar.module.css` (same directory — no separate CSS file needed)
- **Not** a standalone component (no barrel export / `index.ts`) — internal to Navbar

### 4. Update `components/Navbar/Navbar.tsx`

- Import `LogoutButton` from `"./LogoutButton"`
- Add `<li><LogoutButton /></li>` before the existing "Create New Heist" `<li>`

### 5. Add `.btnOutline` to `components/Navbar/Navbar.module.css`

Outlined button style matching the reference image:
- `@apply` for sizing/rounding to match `.btn` proportions
- Transparent background, white border, white text
- Hover state with subtle `bg-white/10`

### 6. Update `tests/components/Navbar.test.tsx`

- Existing tests pass unchanged

### 7. Create `tests/components/LogoutButton.test.tsx`

Using the established mocking pattern from `tests/hooks/useUser.test.tsx`:
- Wrap renders in `<AuthProvider>`

Test cases:
1. Not visible when user is not authenticated
2. Not visible while auth state is loading
3. Visible when user is authenticated
4. Calls `signOut` when clicked

## Files Changed

| File | Action |
|------|--------|
| `lib/firebase/logout.ts` | Create |
| `lib/firebase/index.ts` | Modify (add export) |
| `components/Navbar/LogoutButton.tsx` | Create |
| `components/Navbar/Navbar.tsx` | Modify (add LogoutButton) |
| `components/Navbar/Navbar.module.css` | Modify (add `.btnOutline`) |
| `tests/components/Navbar.test.tsx` | Modify (add mock) |
| `tests/components/LogoutButton.test.tsx` | Create |

## Verification

1. Run `npm run test -- LogoutButton.test` — all 4 tests pass
2. Run `npm run test -- Navbar.test` — existing tests still pass
3. Run `npm run build` — no type errors
4. Visual check: dev server shows Logout button only when logged in, outlined style matching the reference image
