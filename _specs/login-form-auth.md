# Spec for Login Form Authentication Logic

branch: claude/feature/login-form-auth

## Summary

Add authentication logic to the login form in `@app/(public)/login` that allows users to log in with their credentials. Upon successful authentication with Firebase, display a success message to the user. The feature does not include page redirection at this stage.

## Functional Requirements

- Form submission triggers Firebase authentication with email and password
- On successful authentication:
  - User is logged in (auth state is updated)
  - A success message is displayed to the user
- On failed authentication:
  - Error message is displayed to the user (e.g., "Invalid credentials", "User not found")
  - User remains on the login page
  - Form is not submitted
- Form maintains existing validation (email format, password requirements)
- Loading state is shown during authentication request
- Success/error messages should be clear and user-friendly

## Figma Design Reference

No Figma design referenced for this feature.

## Possible Edge Cases

- User enters invalid email format - validation prevents submission
- User enters non-existent account email - Firebase returns "user-not-found" error
- User enters correct email but wrong password - Firebase returns "wrong-password" error
- Network request times out during authentication
- User submits form multiple times quickly - loading state prevents duplicate requests
- Success message visibility and dismissal timing

## Acceptance Criteria

- [ ] User can successfully log in with correct email and password
- [ ] Success message appears after successful authentication
- [ ] Error message appears when credentials are incorrect
- [ ] Loading state is visible during authentication request
- [ ] User remains on login page (no redirect) after successful login
- [ ] Form fields remain populated after failed authentication (for user convenience)
- [ ] Form submission is disabled during loading state

## Open questions

- How should the success message be dismissed? (auto-dismiss, manual close button, or persistent?)
- What error messages should be shown for different Firebase error codes?
- Should the success message appear inline on the form or in a separate toast/modal?
- Should form fields be cleared after successful login?

## Testing Guidelines

Create a test file `tests/components/LoginForm.test.tsx` and create meaningful tests for the following cases:

- Successfully logs in user with valid credentials
- Displays error message when credentials are incorrect
- Shows loading state during authentication
- Disables form submission during loading
- Displays success message on successful authentication
- Handles Firebase auth errors gracefully
- Form validation prevents submission with invalid email format
