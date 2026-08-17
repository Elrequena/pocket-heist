# HeistCard Implementation Plan

## Context

The `/heists` page currently renders heists as plain text lists. The spec calls for a visual card-based layout showing **active** and **assigned** heists only (no expired section), with each card displaying title, assignee, creator, deadline, and time remaining. A skeleton loading state and responsive 3-column grid are also required.

User clarifications on open questions:
- Time remaining: compute at render time only, no live interval — re-renders when Firestore data changes
- "Overdue" label: shows for both active and assigned heists
- Hover/focus styles: yes, on the card itself

---

## Files to Create

### 1. `components/HeistCard/HeistCard.tsx`

**Exports:** `default HeistCard` + named `HeistCardSkeleton`

**HeistCard** — presentational component receiving a `Heist` prop:
- `<article>` wrapper with dark card styling
- Header row: `<Link href={/heists/${id}}>` for title (bold, white) + `Clock` icon (top-right, muted)
- "To" row: `User` icon + `@assignedToCodename` in primary/purple
- "By" row: `User` icon + `@createdByCodename` in secondary/pink
- Deadline row: `Calendar` icon + formatted date + bullet separator + time remaining or "Overdue"

**Helper functions** (inside the file, not exported):
- `formatTimeRemaining(deadline: Date)` → `{ text: string, isOverdue: boolean }` — returns "Overdue" if `diff <= 0`, otherwise "Xd Yh" or "Xh Ym"
- `formatDeadline(deadline: Date)` → string like "Dec 7, 02:00 PM"

**HeistCardSkeleton** — composes `Skeleton` from `@/components/Skeleton` to match card layout:
- Same wrapper dimensions as the card
- 4 shimmer rows matching title+icon, assignee, creator, deadline

**Icons needed:** `Clock`, `User`, `Calendar` from `lucide-react`

### 2. `components/HeistCard/HeistCard.module.css`

Starts with `@reference "../../app/globals.css";`

Key classes:
- `.card` — `bg-light`, `border border-lighter`, `rounded-lg`, `p-4`, `flex flex-col gap-3`, transition on border-color + transform
- `.card:hover, .card:focus-within` — border changes to `--color-primary`, subtle `translateY(-2px)` lift
- `.title` — white, bold, no underline; underline on hover
- `.assignee` — `color: var(--color-primary)` 
- `.creator` — `color: var(--color-secondary)`
- `.overdue` — `color: var(--color-error)`, bold
- `.timeRemaining` — `color: var(--color-heading)`
- `.skeletonCard` — same dimensions as `.card` but no hover effects

### 3. `components/HeistCard/index.ts`

```ts
export { default as HeistCard, HeistCardSkeleton } from "./HeistCard"
```

### 4. `tests/components/HeistCard.test.tsx`

Tests with a mock `Heist` object (no hooks to mock — pure presentational):
- Renders title as a link with correct `href="/heists/[id]"`
- Renders `@assignedToCodename` and `@createdByCodename`
- Renders formatted deadline date
- Shows time remaining (e.g. "4h 0m") when deadline is future
- Shows "Overdue" when deadline is past
- HeistCardSkeleton renders without crashing

---

## Files to Modify

### 5. `app/globals.css`

Add a `.heist-grid` utility class alongside the existing `.skeleton-grid`:

```css
.heist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 1024px) {
  .heist-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .heist-grid { grid-template-columns: 1fr; }
}
```

Reason: the spec asks for explicit 3/2/1 columns, while `.skeleton-grid` uses `auto-fill` which could produce 4+ columns on wide screens.

### 6. `app/(dashboard)/heists/page.tsx`

- Remove `useHeists("expired")` call and the expired section entirely
- Replace inline `HeistSection` to use `HeistCard` + `HeistCardSkeleton` in the `.heist-grid` layout
- Section headers include icons: `Clock` for "Active Heists", `Target` for "Assigned Heists"
- Loading state: 3 `HeistCardSkeleton` per section
- Empty state: italic gray message (same as current)

### 7. `tests/components/HeistsPage.test.tsx`

- Remove expired section assertions
- Update `mockHeistsReturn` to exclude expired
- Update "calls useHeists with correct filter strings" to only expect `"active"` and `"assigned"`
- Add assertion that cards render as links with correct hrefs
- Add assertion that skeleton cards appear during loading

---

## Implementation Order

1. `components/HeistCard/HeistCard.module.css`
2. `components/HeistCard/HeistCard.tsx` (component + skeleton + helpers)
3. `components/HeistCard/index.ts`
4. `app/globals.css` — add `.heist-grid`
5. `app/(dashboard)/heists/page.tsx` — refactor to cards
6. `tests/components/HeistCard.test.tsx` — new tests
7. `tests/components/HeistsPage.test.tsx` — update existing tests

## Verification

1. `npm run test -- HeistCard.test` — card unit tests pass
2. `npm run test -- HeistsPage.test` — page tests pass  
3. `npm run test` — full suite, no regressions
4. `npm run build` — no type/build errors
5. Browser preview: verify 3-col grid on desktop, 2-col tablet, 1-col mobile; card hover effect; title links navigate to `/heists/[id]`; "Overdue" in red for past-deadline heists
