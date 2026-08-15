# Spec for User Auth State Management

branch: claude/feature/user-auth-state-management

## Summary

Implement a global auth state management solution that provides real-time access to the current user across the entire application. Users can access the current authenticated user (or `null` if logged out) via a `useUser()` hook from any page or component without prop drilling. This foundation enables future signup, login, and logout flow implementations.

The solution leverages Firebase Authentication's real-time listener to automatically update the user state whenever the authentication status changes, ensuring the app always reflects the true authentication state without manual polling or refresh.

## Functional Requirements

- Create a `useUser()` custom hook that returns the current user object or `null`
- Hook must be accessible from any page or component in the application
- Implement a real-time listener for Firebase Authentication that automatically updates global user state
- User state should persist across page navigation and browser refreshes (via Firebase session)
- Hook must be lightweight and not cause unnecessary re-renders
- Support TypeScript with proper type definitions for the user object
- No authentication flow (signup/login/logout) should be implemented in this spec—only state management
- Provide a context-based solution for state management to enable future features

## Functional Non-Requirements

- User signup flow
- User login flow  
- User logout flow
- Account settings or profile management
- Permission/authorization logic
- Multi-tenant or role-based access control

## Posible Edge Cases

- User is logged out while the app is open (token expired or logged out from another tab)
- App is opened with existing valid session token
- User closes and reopens browser with existing session
- Multiple tabs open simultaneously with shared auth state
- Rapid authentication state changes (logout then login quickly)
- Firebase not initialized or authentication service unavailable

## Acceptance Criteria

- `useUser()` hook is exported from a centralized location and can be imported in any component
- Hook returns `User | null` type, where `User` matches Firebase Auth user object structure
- Real-time listener is initialized at app startup (in root layout)
- User state updates automatically when authentication status changes
- Existing components that reference user data should be prepared for refactoring (no breaking changes required in this spec)
- Hook usage is tested and verified in at least one component
- TypeScript types are properly defined for the user object returned by the hook

## Open questions

- Should we extend the user object with additional custom claims (e.g., role, permissions)? no
- Should we cache the user state in localStorage as a fallback? no
- How should we handle loading state while the auth listener is initializing? yes
- Should profile image and user metadata be eagerly loaded alongside the user object? no

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `useUser()` returns `null` when user is not logged in
- `useUser()` returns a valid user object when user is logged in
- User state updates when authentication status changes (mocked Firebase listener)
- Hook works correctly when called from multiple components
- Real-time listener is initialized and cleaned up properly
