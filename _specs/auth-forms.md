# Spec for Authentication Forms

branch: claude/feature/auth-forms

## Summary

Create reusable authentication form components for Login and Signup pages. The forms should include email and password input fields, a password visibility toggle (eye icon), and a submit button. Both forms will initially log submission data to the console for development purposes. The implementation should make it easy to switch between login and signup modes or render both forms independently.

## Functional Requirements

- Email field with text input
- Password field with masked input (type="password" by default)
- Password visibility toggle icon (show/hide password)
- Submit button labeled appropriately ("Login" for login form, "Sign Up" for signup form)
- Form submission logs form data (email, password) to console
- Form should clear after successful submission (or handle as per design)
- Easy component composition to allow switching between login and signup forms
- Support for both `/login` and `/signup` page routes
- Responsive design that works on mobile and desktop

## Figma Design Reference

None at this time (visual design to follow or reference existing brand guidelines)

## Possible Edge Cases

- User submits form with empty email or password
- User toggles password visibility multiple times rapidly
- Form submission while fields are being filled
- Browser autofill for email and password fields
- Form state when switching between login and signup modes
- Keyboard navigation and form submission via Enter key
- Screen reader accessibility for password toggle button

## Acceptance Criteria

- [ ] Login form displays email and password fields with correct labels
- [ ] Signup form displays email and password fields with correct labels (may have additional fields in future)
- [ ] Password field masks input by default
- [ ] Clicking the eye icon toggles password visibility (plain text ↔ masked)
- [ ] Eye icon reflects current state (open = visible, closed = masked)
- [ ] Clicking submit button logs form data to console in format: `{ email: string, password: string }`
- [ ] Forms are accessible via keyboard navigation (Tab, Enter)
- [ ] Submit button has appropriate text ("Login" or "Sign Up")
- [ ] Forms can be easily switched/swapped on their respective pages
- [ ] No form data is persisted to backend (console logging only for now)

## Open Questions

- Should the form clear after submission, or should values remain? Clear only if was success.
- Do we need form validation (client-side) at this stage, or just basic required fields? only basic.
- Should there be a "Remember me" or "Forgot password" link for login form? No.
- Will signup form have additional fields (confirm password, terms checkbox)? Only Confim Password.
- Should both forms live in a single reusable component or separate components? diferents components.

## Testing Guidelines

Create test file(s) in the `./tests` folder for the authentication forms, and create meaningful tests for the following cases:

- Email field renders and accepts input
- Password field masks input by default
- Password toggle button shows/hides password text
- Form submission logs correct data to console
- Submit button is accessible and clickable
- Keyboard interaction (Enter key submits form)
- Form fields are labeled accessibly
- Login and signup forms display correct button labels
