# Spec for useHeists Hook

branch: claude/feature/use-heists-hook

## Summary

A custom React hook called `useHeists` that subscribes to real-time Firestore data from the heists collection. It accepts a filter argument (`'active'`, `'assigned'`, or `'expired'`) and returns a typed array of `Heist` objects matching the corresponding query. After creating the hook, the heists dashboard page (`app/(dashboard)/heists/page.tsx`) will be updated to display the titles from each of the three result sets.

## Functional Requirements

- The hook must be a client-side React hook (`"use client"`)
- It must accept a single argument of type `'active' | 'assigned' | 'expired'`
- It must subscribe to real-time updates using Firestore's `onSnapshot` listener
- It must return an array of `Heist` objects (using the existing type from `types/firestore/heist.ts`) and a loading state
- It must use the existing `heistConverter` for proper Firestore deserialization
- It must obtain the current user's UID via the existing `useUser` hook
- Query logic per filter value:
  - **`'active'`**: Heists where `assignedTo` equals the current user's UID AND `deadline` is in the future
  - **`'assigned'`**: Heists where `createdBy` equals the current user's UID AND `deadline` is in the future
  - **`'expired'`**: Heists where `deadline` is in the past AND `finalStatus` is NOT null (regardless of user)
- The Firestore listener must be cleaned up when the component unmounts or when the filter argument changes
- The heists dashboard page must call the hook three times (once per filter) and render each heist's title in its corresponding section

## Possible Edge Cases

- User is not authenticated (no UID available) — the hook should handle this gracefully, returning an empty array
- Filter argument changes while a previous listener is still active — previous listener must be unsubscribed before attaching a new one
- Firestore returns heists where `deadline` is exactly the current time — define "in the future" as strictly greater than now
- Empty result sets — each section on the page should handle having no heists to display
- Firestore timestamps that haven't resolved yet (pending writes) — the converter already handles this with the `?.toDate?.()` pattern
- The `'expired'` filter requires a compound query (`deadline < now` AND `finalStatus != null`) — verify Firestore index requirements

## Acceptance Criteria

- [ ] `useHeists` hook exists in the `hooks/` directory and exports correctly
- [ ] Calling `useHeists('active')` returns only heists assigned TO the current user with a future deadline
- [ ] Calling `useHeists('assigned')` returns only heists created BY the current user with a future deadline
- [ ] Calling `useHeists('expired')` returns only heists with a past deadline and a non-null `finalStatus`
- [ ] All three subscriptions update in real-time when Firestore data changes
- [ ] Listeners are properly cleaned up on unmount
- [ ] The heists page (`app/(dashboard)/heists/page.tsx`) renders three sections, each showing heist titles from the corresponding filter
- [ ] The page shows a loading indicator while data is being fetched
- [ ] The page handles empty states (no heists in a given category)

## Open Questions

- Should the `'expired'` query be limited or paginated to avoid loading a large number of historical heists? No.
- Does the compound query for `'expired'` (`deadline < now` AND `finalStatus != null`) require a Firestore composite index, and if so, should it be created as part of this feature? No, keep it simple

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- The hook returns an empty array when no heists match the filter
- The hook correctly identifies which Firestore query fields to use for each filter type (`assignedTo` vs `createdBy` vs deadline-based)
- The heists page renders three sections with the correct headings
- The heists page displays heist titles within each section when data is available
- The heists page shows loading state while data is being fetched
