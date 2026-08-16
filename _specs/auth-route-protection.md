# Spec for Authentication-Based Route Protection

branch: claude/feature/auth-route-protection

## Summary

Implement route protection based on authentication status to ensure users can only access pages intended for their state (authenticated or unauthenticated). Pages in the `(public)` route group should only be viewable to unauthenticated users, and pages in the `(dashboard)` group should only be viewable to authenticated users. During the auth status check, show a simple loader in the group layouts to provide visual feedback while Firebase determines the user's authentication state.

## Functional Requirements

- Implement route guards in the `(public)` layout that redirect authenticated users away from public pages
- Implement route guards in the `(dashboard)` layout that redirect unauthenticated users away from dashboard pages
- Use the existing `useUser` hook to check the current authentication status
- Display a simple loader component in both group layouts during the auth status check
- Ensure smooth redirects happen after auth status is determined, without flash of wrong content
- Public routes: home (splash), login, signup, and preview pages
- Dashboard routes: heists list, create heist, individual heist details

## Figma Design Reference

Not required - this is a technical implementation feature.

## Possible Edge Cases

- User logs in/out in one tab and navigates in another tab (auth state becomes stale)
- Network latency causing delayed auth status response
- User manually navigating to URL of restricted page (should redirect immediately)
- Initial page load before auth status is determined from Firebase
- Rapid navigation between public and dashboard pages

## Acceptance Criteria

- Unauthenticated users can access public routes (`/`, `/login`, `/signup`, `/preview`)
- Authenticated users are redirected from public routes to the dashboard
- Authenticated users can access dashboard routes (`/heists`, `/heists/create`, `/heists/[id]`)
- Unauthenticated users are redirected from dashboard routes to login
- A simple loader is displayed in layouts during auth status check
- No flash of incorrect content before redirects occur
- Auth status is checked on every page navigation
- Redirects happen smoothly without console errors

## Open Questions

- Should we persist the loader visibility duration for a minimum time to avoid flashing? No
- What is the preferred loader style (spinner, skeleton, simple text)? Spinner useng this clock icon from title
- Should we add a loading state indicator in the Navbar when auth is being checked? No
- How should we handle deep linking (user bookmarks a dashboard page but is logged out)? Go to log in

## Testing Guidelines

Create test files in the `./tests` folder for the new route protection feature:

- Test that unauthenticated users are redirected from dashboard routes to login
- Test that authenticated users are redirected from public routes to dashboard
- Test that public routes are accessible to unauthenticated users
- Test that dashboard routes are accessible to authenticated users
- Test that the loader displays during auth status check
- Test that redirects do not occur when user is in the correct route group for their auth status
