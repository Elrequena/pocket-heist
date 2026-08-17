# Spec for Heist Card

branch: claude/feature/heist-card

## Summary

Create a `HeistCard` component that displays individual heist information in a visually rich card format, and a `HeistCardSkeleton` for loading states. Update the `/heists` page to render active and assigned heists using these cards in a responsive 3-column grid layout. Expired heists are excluded from this view entirely. Each card's title links to the heist detail page (`/heists/:id`), but the detail page content remains unchanged.

## Functional Requirements

- **HeistCard component** displays the following information extracted from a `Heist` object:
  - **Title** (top-left, bold) — links to `/heists/[id]` detail page
  - **Clock icon** (top-right) — a timer/clock indicator from Lucide React
  - **Assigned to** — row with person icon + codename in accent color (primary/purple)
  - **Created by** — row with person icon + codename in accent color (secondary/pink)
  - **Deadline date** — row with calendar icon + formatted date/time
  - **Time remaining or "Overdue"** — displayed inline after the deadline, showing either a countdown (e.g. "4h 42m", "1d 0h") or "Overdue" in red when the deadline has passed
- **Card visual style**:
  - Dark card background with a subtle border (matching existing dark theme)
  - Rounded corners
  - Consistent padding and spacing between rows
  - Codenames prefixed with `@`
- **HeistCardSkeleton component** mimics the card layout with animated skeleton placeholders for each content area (title, icon, three info rows)
- **Heists page updates**:
  - Two sections: "Active Heists" and "Assigned Heists" (remove the expired heists section)
  - Each section displays cards in a responsive grid: 3 columns on desktop, 2 on tablet, 1 on mobile
  - Section headers include a relevant icon (clock icon for active, target/crosshair icon for assigned)
  - While loading, show 3 `HeistCardSkeleton` cards per section in the same grid
  - Empty state message when no heists exist in a section
- **Title links** navigate to `/heists/[id]` but no content changes are made to the detail page

## Possible Edge Cases

- Heist with a very long title that wraps to multiple lines — card should handle gracefully without breaking layout
- Deadline exactly at the current moment — should show "Overdue" rather than "0h 0m"
- Heist missing optional fields (e.g. codenames) — display graceful fallback text
- Time remaining calculation: should update or be accurate at render time (does not need to be a live countdown)
- Grid with only 1 or 2 cards in a section — cards should not stretch to fill the full row

## Acceptance Criteria

- [ ] `HeistCard` component renders title, assignee, creator, deadline, and time remaining from a `Heist` object
- [ ] Card title is a clickable link navigating to `/heists/[id]`
- [ ] Time remaining shows a human-readable countdown (e.g. "2d 5h") or "Overdue" in red
- [ ] `HeistCardSkeleton` matches the card's dimensions and layout with animated placeholders
- [ ] Heists page shows "Active Heists" and "Assigned Heists" sections only (no expired heists)
- [ ] Cards are displayed in a 3-column responsive grid (3 cols desktop, 2 tablet, 1 mobile)
- [ ] Loading state shows 3 skeleton cards per section in the grid
- [ ] Empty sections show an appropriate empty-state message
- [ ] All styling uses CSS Modules with Tailwind `@apply` directives (per project conventions)
- [ ] Component follows barrel export pattern (`index.ts`)

## Open Questions

- Should the time remaining update live (via interval) or only at render time?  updae only if data change.
- Should the "Overdue" label appear only for active heists, or for assigned heists too? No.
- Should there be any hover/focus styles on the card beyond the title link? Yes.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- HeistCard renders all expected fields (title, assignee, creator, deadline)
- Title renders as a link with the correct href (`/heists/[id]`)
- Displays "Overdue" when the deadline is in the past
- Displays time remaining (e.g. "1d 2h") when the deadline is in the future
- HeistCardSkeleton renders without errors
- Heists page renders both "Active Heists" and "Assigned Heists" sections
- Heists page does NOT render an expired heists section
