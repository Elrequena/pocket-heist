# Implementation Plan: Authentication-Based Route Protection

## Context

**Problem:** Pocket Heist has no route protection. Unauthenticated users can directly navigate to `/heists` routes, and authenticated users can access `/login` and `/signup`. The app needs conditional redirects based on auth state, plus a loading indicator while Firebase determines user status.

**Current State:**
- `useUser` hook and `AuthProvider` fully functional (returns `{ user, loading }`)
- Two route groups: `(public)` for unauthenticated pages, `(dashboard)` for heists
- `Skeleton` component with shimmer animation exists for loading UI
- No middleware, no redirect logic, no loading states during auth check
- LoginForm shows success but doesn't redirect; SignupForm redirects correctly

**Intended Outcome:** 
- Unauthenticated users redirected from dashboard to `/login`
- Authenticated users redirected from public routes to `/heists`
- Full-page loader with Clock icon during auth check prevents flash of wrong content
- Smooth, transparent redirects after auth status determined

---

## Recommended Approach: Client-Side Layout Guards

**Why this approach:**
- Next.js middleware cannot access `useUser` hook or client context
- `AuthProvider` already at root level makes client-side redirects ideal
- Layout-level guards prevent flash and ensure consistent behavior across all routes in a group
- Uses existing Skeleton component for loader UI with Clock icon from Lucide React

---

## Implementation Strategy

### Phase 1: Create Reusable Components

Create four new client components (all marked with `"use client"`):

**1. `components/AuthLoadingScreen/AuthLoadingScreen.tsx`**
- Full-page centered loader with Clock icon (from `lucide-react`)
- Variants: `'public' | 'dashboard'` (dashboard shows navbar shimmer placeholder)
- Shows during initial auth check
- Has fade-in animation, z-index: 9999 to overlay page content
- Clock icon spins during loading, centered on screen

**2. `components/ProtectedLayout/ProtectedLayout.tsx`**
- Wrapper component for `(dashboard)` layout
- Props: `{ children }`
- Logic:
  - If `loading === true` → show `AuthLoadingScreen`
  - If `loading === false && !user` → redirect to `/login` via `useRouter`
  - If `user` exists → render children
- Uses `useEffect` for redirect (after initial render)
- Uses `useUser` hook to access auth state

**3. `components/PublicLayout/PublicLayout.tsx`**
- Wrapper component for `(public)` layout
- Props: `{ children }`
- Logic:
  - If `loading === true` → show `AuthLoadingScreen`
  - If `loading === false && user` → redirect to `/heists` via `useRouter`
  - If `!user` → render children

**4. `components/HomeRedirectHandler/HomeRedirectHandler.tsx`**
- Client component replacing home page (`app/(public)/page.tsx`)
- No props, handles splash page redirection
- Logic:
  - If `loading === true` → show `AuthLoadingScreen`
  - If `user` → redirect to `/heists`
  - If `!user` → redirect to `/login`
- Always redirects; no fallback rendering

Each component uses Vitest + React Testing Library patterns from existing codebase.

### Phase 2: Update Layout Files

**1. `app/(dashboard)/layout.tsx`**
- Import `ProtectedLayout`
- Wrap existing structure with `<ProtectedLayout>`: 
  ```tsx
  return (
    <ProtectedLayout>
      <Navbar />
      <main>{children}</main>
    </ProtectedLayout>
  )
  ```
- Keep Navbar inside the wrapper (only renders when authenticated)

**2. `app/(public)/layout.tsx`**
- Import `PublicLayout`
- Wrap existing structure:
  ```tsx
  return (
    <PublicLayout>
      <main>{children}</main>
    </PublicLayout>
  )
  ```

**3. `app/(public)/page.tsx`**
- Replace entire page with `HomeRedirectHandler` component
- Remove splash page logic

### Phase 3: Fix LoginForm Auto-Redirect

**`components/LoginForm/LoginForm.tsx`**
- Import `useRouter` from `next/navigation`
- After successful login, redirect to `/heists` (like SignupForm already does)
- Remove/hide success message, or show it briefly before redirecting
- Handle async timing: show success, wait 300ms, then redirect

---

## Critical Files

### Files to Create
1. `components/AuthLoadingScreen/AuthLoadingScreen.tsx`
2. `components/AuthLoadingScreen/AuthLoadingScreen.module.css`
3. `components/AuthLoadingScreen/index.ts`
4. `components/ProtectedLayout/ProtectedLayout.tsx`
5. `components/ProtectedLayout/index.ts`
6. `components/PublicLayout/PublicLayout.tsx`
7. `components/PublicLayout/index.ts`
8. `components/HomeRedirectHandler/HomeRedirectHandler.tsx`
9. `components/HomeRedirectHandler/index.ts`
10. `tests/components/AuthLoadingScreen.test.tsx`
11. `tests/components/ProtectedLayout.test.tsx`
12. `tests/components/PublicLayout.test.tsx`
13. `tests/components/HomeRedirectHandler.test.tsx`

### Files to Modify
1. `app/(dashboard)/layout.tsx` - Wrap with ProtectedLayout
2. `app/(public)/layout.tsx` - Wrap with PublicLayout
3. `app/(public)/page.tsx` - Replace with HomeRedirectHandler
4. `components/LoginForm/LoginForm.tsx` - Add useRouter redirect

---

## Implementation Order

1. Create `AuthLoadingScreen` (simplest, no logic)
2. Create `ProtectedLayout` (uses AuthLoadingScreen + useRouter)
3. Create `PublicLayout` (similar pattern)
4. Create `HomeRedirectHandler` (special case of redirect logic)
5. Update layout files (dashboard, public)
6. Update home page (use HomeRedirectHandler)
7. Fix LoginForm (add redirect)
8. Write all tests (unit + integration)
9. Manual E2E verification

---

## Flash Prevention

The critical sequence to prevent showing wrong content:

```typescript
// In ProtectedLayout:
if (loading) return <AuthLoadingScreen />  // Step 1: Show loader immediately
if (!user) {                                // Step 2: Check auth after loading
  router.push('/login')                    // Step 3: Redirect
  return null                              // Don't render children
}
return children                             // Step 4: Only render if authenticated
```

The loader has `position: fixed; z-index: 9999`, so it overlays any page content that renders below while the redirect is queued.

---

## Testing Strategy

### Unit Tests (each component gets 4-6 tests)

**AuthLoadingScreen:**
- Renders correctly with Clock icon
- Shows correct variant (public/dashboard)
- Has fade-in animation
- Clock icon rotates/spins during loading

**ProtectedLayout:**
- Shows loading screen while `loading === true`
- Calls `router.push('/login')` when `loading === false && !user`
- Renders children when `loading === false && user`
- Uses `useUser` hook correctly

**PublicLayout:**
- Shows loading screen while `loading === true`
- Calls `router.push('/heists')` when `loading === false && user`
- Renders children when `loading === false && !user`

**HomeRedirectHandler:**
- Redirects to `/heists` when user exists
- Redirects to `/login` when no user
- Shows loading screen during check

### Integration Tests (auth flow scenarios)

- Unauthenticated user navigates to `/heists` → redirects to `/login`
- Authenticated user navigates to `/login` → redirects to `/heists`
- User logs in via LoginForm → auto-redirects to `/heists`
- From home page `/` → redirects based on auth state
- No console errors during redirects

Follow existing test patterns from `LoginForm.test.tsx` and `useUser.test.tsx`:
- Mock `useUser` hook with different states
- Mock `next/navigation` useRouter
- Use `vi.mock()` for module mocking
- Use React Testing Library with `screen.getByRole()`, `screen.getByText()`

---

## Verification Approach

### Manual Testing (End-to-End)
1. **Start unauthenticated:**
   - Navigate to `/` → should redirect to `/login` (via HomeRedirectHandler)
   - URL bar shows `/login`, page renders login form
   
2. **Log in:**
   - Enter credentials → login succeeds → auto-redirect to `/heists`
   - Loader with spinning Clock icon visible during auth state update
   - URL changes to `/heists`, heists list renders

3. **Try accessing public routes while authenticated:**
   - Navigate to `/login` → immediately redirect to `/heists`
   - Navigate to `/signup` → immediately redirect to `/heists`
   - Navbar visible (proof of authentication)

4. **Log out:**
   - Click logout → auth state updates → redirect to `/login`
   - Public routes become accessible again

5. **Deep linking:**
   - Bookmarked `/heists` → open in new tab while logged out → redirect to `/login`
   - Bookmarked `/login` → open in new tab while logged in → redirect to `/heists`

### Browser DevTools Checks
- No flash of wrong content
- Console has no errors/warnings
- Network tab shows no unnecessary redirects (max 1 per navigation)
- Loading screen with Clock icon visible during initial page load (until Firebase determines auth)

---

## Edge Cases Handled

| Scenario | Solution |
|----------|----------|
| Network delay in Firebase auth | Loader stays visible until `loading` becomes `false` |
| User logs out in another tab | `AuthProvider` listens to `onAuthStateChanged`, updates context, triggers redirect |
| Very fast auth (cached) | Loader may flash briefly, acceptable UX |
| Double redirect attempt | `useRouter` handles idempotently; cleanup in useEffect prevents duplicate calls |
| SSR vs CSR mismatch | Both layouts are `"use client"`, component-only rendering (no SSR) |
| Page reload while authenticated | `AuthProvider` re-initializes, user stays on route if still authenticated |

---

## Notes

- All new components use barrel exports (`index.ts`) following project convention
- CSS Modules for component-specific styling (following project pattern)
- Clock icon from `lucide-react` (already in dependencies)
- No new dependencies required
- Uses existing Firebase + React patterns from codebase
- Skeleton component reused for navbar shimmer in dashboard variant
- Testing follows Vitest + React Testing Library patterns from existing tests
