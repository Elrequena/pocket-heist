# Plan: `useHeists` Real-Time Firestore Hook

## Context

The heists dashboard page (`app/(dashboard)/heists/page.tsx`) is currently a stub with three empty sections. We need a `useHeists` hook that subscribes to real-time Firestore data with three filter modes, then wire it into the page to display heist titles. No real-time Firestore listeners exist in the codebase yet — this is the first.

## Files to Create/Modify

| File | Action |
|------|--------|
| `hooks/useHeists.ts` | **Create** — the core hook |
| `hooks/index.ts` | **Modify** — add `useHeists` export |
| `app/(dashboard)/heists/page.tsx` | **Modify** — add `"use client"`, call hook 3×, render titles |
| `app/(dashboard)/heists/page.module.css` | **Create** — scoped styles for the page |
| `tests/hooks/useHeists.test.tsx` | **Create** — hook tests |
| `tests/components/HeistsPage.test.tsx` | **Create** — page tests |

## Implementation Steps

### 1. Check Context7 for Firebase `onSnapshot` + `withConverter` usage in v11

Before writing any code, query Context7 for the current `firebase/firestore` docs on `onSnapshot`, `query`, `where`, and `withConverter` to confirm the API shape in v11.

### 2. Create `hooks/useHeists.ts`

- `"use client"` directive
- Accept `filter: 'active' | 'assigned' | 'expired'`
- Return `{ heists: Heist[], loading: boolean }`
- Use `useUser()` to get current user UID
- Build a Firestore `query` on `collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter)` with `where` clauses per filter:
  - `'active'` → `assignedTo == user.uid` AND `deadline > Timestamp.now()`
  - `'assigned'` → `createdBy == user.uid` AND `deadline > Timestamp.now()`
  - `'expired'` → `finalStatus != null` AND `deadline < Timestamp.now()`
- Subscribe via `onSnapshot(q, callback)` inside a `useEffect`
- Dependencies: `[filter, user]`
- Set `loading = true` at effect start, `false` inside the snapshot callback
- Return the `onSnapshot` unsubscribe function as cleanup
- If `user` is null and filter is `'active'` or `'assigned'`, skip subscription, return empty array

**Reuse:** `db` from `@/lib/firebase/firestore`, `useUser` from `@/hooks`, `heistConverter` and `COLLECTIONS` from `@/types/firestore`

### 3. Update `hooks/index.ts`

Add: `export { useHeists } from "./useHeists"`

### 4. Create `app/(dashboard)/heists/page.module.css`

Scoped styles for the page layout, section headings, and heist title lists. Use `@apply` with Tailwind utilities per project convention.

### 5. Update `app/(dashboard)/heists/page.tsx`

- Add `"use client"` at top
- Import `useHeists` from `@/hooks`
- Import `Skeleton` from `@/components/Skeleton`
- Import CSS module
- Call `useHeists("active")`, `useHeists("assigned")`, `useHeists("expired")`
- Each section: heading → loading skeleton OR `<ul>` of `<li>` with `heist.title`
- Handle empty states (no heists message)

### 6. Write `tests/hooks/useHeists.test.tsx`

Mock `firebase/firestore` (including `onSnapshot`, `query`, `where`, `collection`, `Timestamp`), `@/lib/firebase/firestore`, and `@/hooks/useUser`. Use a `TestConsumer` component that renders hook output as text.

Test cases:
- Returns loading initially, then heists after snapshot fires
- Returns empty array when user is null for `active`/`assigned`
- Proceeds with `expired` even when user is null
- Passes correct `where` clauses per filter
- Calls unsubscribe on unmount

### 7. Write `tests/components/HeistsPage.test.tsx`

Mock `@/hooks` to control `useHeists` return values per filter.

Test cases:
- Renders all three section headings
- Shows loading skeletons when loading
- Renders heist titles in each section
- Handles empty state gracefully

## Key Design Decisions

- **No error state** — `onSnapshot` auto-retries on transient failures; keep it simple per spec
- **`user` (not `user?.uid`) as effect dependency** — the `user` object from AuthProvider is referentially stable per auth state, so this is safe and correct
- **`Timestamp.now()` computed inside effect** — gives "current time at subscription start"; heists won't auto-migrate between sections without a re-render, which is fine for MVP
- **Three concurrent listeners** — Firestore multiplexes WebSocket connections internally, so this is efficient
- **Composite index for `expired`** — the `finalStatus != null` + `deadline < now` query on different fields requires a Firestore composite index. On first run, Firestore logs an error with a direct link to create it. No code-side workaround needed.

## Verification

1. `npm run test -- useHeists.test` — hook tests pass
2. `npm run test -- HeistsPage.test` — page tests pass
3. `npm run lint` — no lint errors
4. `npm run dev` → navigate to `/heists` — page renders three sections with real-time data (requires Firestore data + composite index)
5. Browser preview screenshot to confirm layout
