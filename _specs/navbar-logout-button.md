# Spec for Navbar Logout Button

branch: claude/feature/navbar-logout-button

## Summary

Add a logout button to the Navbar component that signs the user out of Firebase Authentication. The button should only be visible when a user is currently logged in. No redirect is needed after signing out — the user simply returns to a signed-out state on the same page.

## Functional Requirements

- Display a "Logout" button in the Navbar, positioned to the left of the existing "Create New Heist" link
- The button should only render when the user is authenticated (i.e., `useUser()` returns a non-null `user`)
- When clicked, the button calls Firebase's `signOut` function to end the current session
- While the auth state is loading, the Logout button should not be shown
- The button should be styled as an outlined/bordered button (white border, transparent background) to visually distinguish it from the primary "Create New Heist" action button

## Figma Design Reference

- No Figma file; reference image provided inline
- Key visual constraints:
  - The Logout button uses a rounded rectangular outline style (white/light border, no fill)
  - It sits to the left of the "Create New Heist" button
  - Text reads "Logout" in white

## Possible Edge Cases

- User is not logged in: the Logout button should not render at all
- Auth state is still loading: the button should not flash briefly — wait until loading is complete before deciding to show or hide
- Sign-out fails (e.g., network error): handle gracefully without crashing; optionally log the error to console
- Multiple rapid clicks on the Logout button: should not cause errors or duplicate sign-out calls

## Acceptance Criteria

- The Logout button appears in the Navbar only when the user is authenticated
- Clicking the Logout button successfully signs the user out via Firebase Auth
- The Logout button does not appear when the user is not logged in or while auth state is loading
- The button matches the outlined style shown in the reference image
- No page redirect occurs after logout
- The Navbar remains functional and correctly laid out with both buttons visible when logged in

## Open Questions

- Should there be any visual feedback (e.g., a brief loading spinner) while the sign-out is in progress? No.
- Should a toast or notification confirm that the user has been signed out? No.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Logout button is visible when the user is authenticated
- Logout button is not visible when the user is not authenticated
- Logout button is not visible while auth state is loading
- Clicking the Logout button calls the Firebase `signOut` function
