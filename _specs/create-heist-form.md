# Spec for Create Heist Form

branch: claude/feature/create-heist-form

## Summary

Build a form page at `app/(dashboard)/heists/create/page.tsx` that allows authenticated users to create a new heist. The form collects heist details using the `CreateHeistInput` interface, validates input, persists the heist document to Firestore's heists collection, and redirects to the heists list page on success. The form should fetch available users from the Firestore users collection to enable heist assignment.

## Functional Requirements

- Display a form with fields corresponding to the `CreateHeistInput` interface
- Fetch available users from Firestore users collection (codename and userId)
- Display users as assignee options in a dropdown/select field
- On form submission:
  - Validate all required fields
  - Create a new heist document in Firestore heists collection
  - Automatically set `createdAt` to current timestamp
  - Automatically set `deadline` to a calculated date (per business logic)
  - Include the selected assignee's userId
  - Redirect user to `/heists` page after successful creation
- Display error messages if Firestore write fails
- Show loading state during form submission
- Prevent duplicate submissions while processing

## Possible Edge Cases

- Form submitted while user list is still loading
- Network failure during Firestore write
- User's Firestore write permission denied
- Stale user data (assignee deleted between fetch and submit)
- Invalid or missing CreateHeistInput fields
- User navigates away before form submission completes

## Acceptance Criteria

- Form renders with all fields from `CreateHeistInput` interface
- Users are successfully fetched and populated in assignee dropdown
- New heist documents are created in Firestore with correct schema
- `createdAt` timestamp is set to submission time
- `deadline` is calculated and set programmatically
- User is redirected to `/heists` on successful creation
- Error messages display appropriately on failure
- Loading state prevents duplicate submissions
- Form is accessible and follows semantic HTML patterns

## Open Questions

- What should the deadline calculation logic be? (e.g., 7 days from createdAt, user-specified duration, etc.) 48 hours.
- Should the form have client-side validation, server-side validation, or both? Neither
- What is the complete `CreateHeistInput` interface structure? Is a interface to use in @types\firestore\heist.ts
- Should there be a success toast/confirmation message before redirect? No.
- What roles/permissions are required to create a heist? No one

## Testing Guidelines

Create a test file `tests/components/CreateHeistForm.test.tsx` with meaningful tests for:
- Form renders with all input fields and assignee dropdown
- User list fetches and populates correctly
- Form submission creates Firestore document with correct data
- `createdAt` and `deadline` are set programmatically
- Redirect occurs after successful submission
- Error states display when Firestore write fails
- Loading state prevents multiple submissions
