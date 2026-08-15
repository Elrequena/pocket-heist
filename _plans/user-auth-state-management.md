# Plan: User Auth State Management

## Context

The app needs a way to know who's logged in — right now there's zero auth state management. Firebase Auth is initialized (`lib/firebase/auth.ts` exports an `auth` instance) but nothing in the app consumes it. No contexts, providers, hooks, or user types exist. The goal is a real-time global listener via `onAuthStateChanged` exposed through a `useUser()` hook, so any component can read `{ user, loading }` without prop drilling. This is the foundation for future login/logout/signup flows and route protection.

## Approach

React Context + Firebase `onAuthStateChanged`, wired at the root layout level.

### Files to create (7)

| File | Purpose |
|------|---------|
| `lib/firebase/types.ts` | Slim `User` interface + `mapFirebaseUser()` mapping function |
| `components/AuthProvider/AuthProvider.tsx` | `"use client"` — creates `AuthContext`, subscribes to `onAuthStateChanged`, provides `{ user, loading }` |
| `components/AuthProvider/index.ts` | Barrel export |
| `hooks/useUser.ts` | `useUser()` — thin `useContext(AuthContext)` wrapper with guard |
| `hooks/index.ts` | Barrel export |
| `tests/hooks/useUser.test.tsx` | Hook + provider integration tests |
| `tests/components/AuthProvider.test.tsx` | Provider-specific edge case tests (optional, can merge into hook tests) |

### Files to modify (2)

| File | Change |
|------|--------|
| `lib/firebase/index.ts` | Add re-exports: `User` type + `mapFirebaseUser` |
| `app/layout.tsx` | Wrap `{children}` with `<AuthProvider>` |

### Implementation order

1. **`lib/firebase/types.ts`** — Define slim `User` interface (`uid`, `email`, `displayName`) and `mapFirebaseUser(firebaseUser)` converter
2. **`lib/firebase/index.ts`** — Add `export type { User }` and `export { mapFirebaseUser }` from `"./types"`
3. **`components/AuthProvider/AuthProvider.tsx`** — Create `AuthContext` with `createContext<AuthContextValue | undefined>(undefined)`. Provider component uses `useState` for `user` and `loading`, `useEffect` with `onAuthStateChanged(auth, callback)` that maps the Firebase user and sets loading to false. Uses React 19 `<AuthContext value={...}>` syntax (no `.Provider`)
4. **`components/AuthProvider/index.ts`** — Barrel export default + named `AuthContext` + type `AuthContextValue`
5. **`hooks/useUser.ts`** — Calls `useContext(AuthContext)`, throws if `undefined` (used outside provider), returns `{ user: User | null, loading: boolean }`
6. **`hooks/index.ts`** — `export { useUser }`
7. **`app/layout.tsx`** — Import `AuthProvider`, wrap `{children}` inside `<AuthProvider>`. Layout stays a server component
8. **`tests/hooks/useUser.test.tsx`** — Mock `firebase/auth` and `@/lib/firebase/config`, test: loading state, null user, logged-in user, auth state changes, listener cleanup on unmount, error when used outside provider

### Key design decisions

- **Slim User type** over raw Firebase User — only `uid`, `email`, `displayName`. Keeps Firebase internals out of the component tree. Future fields are added to one interface + one mapping function
- **Context default is `undefined`** (not `{ user: null, loading: true }`) — forces the `useUser()` guard to catch misuse outside the provider tree with a clear error
- **No `.module.css` for AuthProvider** — it's a pure logic component that renders no DOM of its own (only passes through `children`)
- **React 19 context syntax** — `<AuthContext value={...}>` directly, not `<AuthContext.Provider>` (confirmed React 19.2.0)
- **`hooks/` directory at project root** — establishes the pattern alongside existing `components/` and `lib/`
- **Loading state handled** — `useUser()` returns `{ user, loading }`. Components can use the existing `Skeleton` component for loading UI

### What this does NOT include (per spec)

- No signup/login/logout flows
- No route protection or middleware
- No localStorage caching
- No custom claims or roles
- No eager profile/metadata loading

## Verification

1. Run `npm install` to ensure `firebase` is in `node_modules`
2. Run `npm run test -- useUser.test` — all 6 tests should pass
3. Run `npm run lint` — no TypeScript or ESLint errors
4. Run `npm run build` — successful build with no errors
5. Optionally start dev server (`npm run dev`) and verify no console errors on load
