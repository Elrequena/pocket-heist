# Implementation Plan: Login Form Authentication Logic

## Context

The LoginForm component currently exists as a basic form with no Firebase integration. Users can enter credentials and see the form clear, but no actual authentication occurs. The SignupForm component already demonstrates the pattern for Firebase auth integration in this codebase. This implementation will add full Firebase authentication to the LoginForm, allowing users to log in with their credentials, see a success message with manual close button, and have their form fields cleared.

**Spec Reference:** `_specs/login-form-auth.md` with clarified decisions:
- Success message: manual close button, separated/modal display
- Error messages: generic "Invalid email or password" for all auth failures
- Form clearing: After user closes success message (not immediately)
- No redirect needed (stays on login page)

## Recommended Approach

Follow the existing **SignupForm pattern** as the baseline for consistency, but with key differences:

1. **Create a new Firebase login function** (`lib/firebase/login.ts`) that simply authenticates without additional setup
2. **Add a SuccessMessage component** for the modal-style success display with manual close button
3. **Enhance LoginForm** with Firebase integration, error handling, loading state, and success message display
4. **Use generic error messages** for security (prevents username enumeration)
5. **Clear form after success message close** to confirm successful authentication before clearing

## Critical Files to Create

### 1. `lib/firebase/login.ts` (NEW)
**Purpose:** Firebase authentication function and error mapping for login

**Key functions:**
- `loginUser(email: string, password: string): Promise<void>` 
  - Calls Firebase `signInWithEmailAndPassword()`
  - Lets `AuthProvider`'s `onAuthStateChanged` listener handle session state
  - Throws Firebase errors for component to catch
- `getLoginAuthErrorMessage(error: unknown): string`
  - Maps all auth errors to generic message: `"Invalid email or password"`
  - Security best practice: prevents username enumeration attacks

**Reference:** Pattern similar to `lib/firebase/signup.ts` but simpler (no Firestore/profile updates)

### 2. `components/SuccessMessage/SuccessMessage.tsx` (NEW)
**Purpose:** Reusable modal-style success message component

**Props:**
- `message: string` - The success message text
- `onClose: () => void` - Callback when user clicks close button

**Behavior:**
- Displays in modal-style container (fixed positioning with optional backdrop)
- Shows success message text in success color (`#05DF72` from globals.css)
- Manual close button ("Got it" or "Close" text)
- Consistent styling with form buttons and overall design

### 3. `components/SuccessMessage/SuccessMessage.module.css` (NEW)
**Purpose:** Scoped styles for success message modal

**Key classes:**
- `.container` - Modal container with fixed positioning
- `.message` - Success text styling in success color
- `.button` - Close button with form-consistent styling

## Critical Files to Modify

### 1. `components/LoginForm/LoginForm.tsx` (MODIFY)
**Changes needed:**

**New state variables:**
```typescript
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [showPassword, setShowPassword] = useState(false)
const [error, setError] = useState('')           // NEW
const [loading, setLoading] = useState(false)    // NEW
const [showSuccessMessage, setShowSuccessMessage] = useState(false) // NEW
```

**New imports:**
- `loginUser` and `getLoginAuthErrorMessage` from `@/lib/firebase`
- `SuccessMessage` component

**Update `handleSubmit` method:**
- Wrap in try/catch with async/await
- Clear previous error at start
- Set `loading = true`
- Call `loginUser(email, password)`
- On success: set `showSuccessMessage = true`
- On error: set error message using `getLoginAuthErrorMessage(error)`
- Set `loading = false` in finally block

**New method `handleCloseSuccess`:**
- Set `showSuccessMessage = false`
- Clear form fields: `setEmail('')`, `setPassword('')`, `setShowPassword(false)`

**Conditional renders:**
- Error message below form (only if error exists) - use `.error` CSS class
- SuccessMessage component below form (only if `showSuccessMessage` is true)

**Button state:**
- Disabled when `loading` is true
- Show "Logging in..." text instead of "Log In" during loading

### 2. `components/LoginForm/LoginForm.module.css` (MODIFY)
**Add CSS class:**
```css
.error {
  @apply text-sm text-error text-center;
}
```
(May already exist - check if needed)

### 3. `components/LoginForm/LoginForm.test.tsx` (MODIFY)
**Update existing tests:**
- Tests checking for `console.log` should be updated to verify `loginUser` is called instead

**Add comprehensive new tests** following SignupForm pattern:
- ✅ renders email and password fields (existing)
- ✅ renders login button (existing)
- ✅ accepts input in fields (existing)
- ✅ password visibility toggle works (existing)
- ✅ renders link to signup (existing)
- **[NEW]** successfully logs in with valid credentials (mocked loginUser resolves)
- **[NEW]** shows success message after successful login
- **[NEW]** success message closes on button click
- **[NEW]** form fields are cleared after closing success message
- **[NEW]** shows error message on login failure
- **[NEW]** error message is generic "Invalid email or password"
- **[NEW]** shows loading state during request
- **[NEW]** button is disabled during loading
- **[NEW]** button text changes to "Logging in..." during loading
- **[NEW]** form fields are preserved on error (allows retry without re-typing)

- No mocks for now.

**Mock strategy:**
- Use `vi.fn()` to create mock functions
- Use `waitFor()` for async operations

### 4. `lib/firebase/index.ts` (MODIFY)
**Add exports:**
```typescript
export { loginUser, getLoginAuthErrorMessage } from './login'
```

### 5. `tests/lib/login.test.ts` (NEW - OPTIONAL)
**Purpose:** Unit tests for Firebase login function

**Test cases:**
- `loginUser()` calls `signInWithEmailAndPassword()` with correct arguments
- `loginUser()` rejects on Firebase error
- `getLoginAuthErrorMessage()` returns generic message for all error codes
- `getLoginAuthErrorMessage()` has fallback for unknown errors

## Implementation Steps

### Step 1: Create Firebase login function
- Create `lib/firebase/login.ts`
- Implement `loginUser()` using Firebase `signInWithEmailAndPassword()`
- Implement `getLoginAuthErrorMessage()` with generic error mapping
- Export both functions

### Step 2: Create SuccessMessage component
- Create `components/SuccessMessage/SuccessMessage.tsx`
- Create `components/SuccessMessage/SuccessMessage.module.css`
- Ensure modal styling and close button are accessible
- Test component renders correctly with props

### Step 3: Update LoginForm component
- Import new login functions and SuccessMessage component
- Add three new state variables: error, loading, showSuccessMessage
- Implement `handleSubmit` with Firebase auth logic
- Implement `handleCloseSuccess` method
- Add conditional error message display
- Add conditional SuccessMessage display
- Update button state during loading

### Step 4: Update LoginForm styles
- Add `.error` class to LoginForm.module.css if missing

### Step 5: Expand LoginForm tests
- Setup mocks for loginUser and getLoginAuthErrorMessage
- Update existing tests that rely on console.log
- Add comprehensive test cases for auth flow, error handling, loading state, success message
- Test form field clearing and preservation

### Step 6: Create login function unit tests (optional)
- Create `tests/lib/login.test.ts`
- Test Firebase function and error mapping

### Step 7: Update exports
- Update `lib/firebase/index.ts` to export new functions

## Error Handling Strategy

**Decision:** Use generic "Invalid email or password" for all authentication errors

**Rationale:**
- Security: prevents username enumeration attacks
- UX: cleaner error message without technical jargon
- Consistency: matches security best practices

**All Firebase auth errors map to:**
```
"Invalid email or password"
```

This includes: wrong password, user not found, invalid email format, network errors, rate limiting, etc.

## Form State Flow

```
Initial: email="", password="", error="", loading=false, showSuccessMessage=false

User submits form:
  1. Clear error
  2. Set loading=true
  3. Call loginUser(email, password)
     ├─ Success → Set showSuccessMessage=true
     └─ Error → Set error to generic message
  4. Set loading=false

User closes success message:
  1. Set showSuccessMessage=false
  2. Clear form fields (email="", password="", showPassword=false)
  3. Ready for next login attempt
```

## Verification Strategy

### Pre-implementation checks:
1. Verify `LoginForm` component renders without Firebase integration
2. Verify `SignupForm` pattern works as expected (reference for consistency)
3. Confirm Firebase auth instance available in `lib/firebase/auth.ts`
4. Confirm `AuthProvider` properly listens to `onAuthStateChanged()`

### Post-implementation verification:

**Manual testing:**
1. Start dev server: `npm run dev`
2. Navigate to `/login`
3. Attempt login with valid credentials → verify success message appears and form clears after close
4. Attempt login with invalid credentials → verify generic error message appears
5. While loading → verify button is disabled and shows "Logging in..."
6. Verify form fields preserved on error (can retry)
7. Verify no page redirect occurs (stays on login page)

**Automated testing:**
1. Run component tests: `npm run test -- LoginForm.test`
2. Run Firebase function tests: `npm run test -- login.test`
3. Verify all new test cases pass
4. Check test coverage includes all new functionality

**Browser DevTools checks:**
1. Verify no console errors
2. Verify auth state is updated in AuthProvider
3. Verify success message displays with correct styling
4. Verify form fields are cleared (not visible in inputs)
5. Verify button state changes during loading

## Success Criteria

- [x] User can log in with correct Firebase credentials
- [x] Success message displays with manual close button
- [x] Form fields clear after success message closes
- [x] Generic error message appears for invalid credentials
- [x] Loading state visible during request (button disabled, text changed)
- [x] Form fields preserved on error (user can retry)
- [x] No page redirect occurs
- [x] All tests pass (component + Firebase function)
- [x] Code follows existing patterns (SignupForm baseline, CSS Modules, barrel exports)
- [x] Component is accessible (proper labels, role="alert" for error, keyboard navigation)

## Key References

- **SignupForm pattern:** `components/SignupForm/SignupForm.tsx` (reference implementation)
- **Firebase utilities:** `lib/firebase/` (existing functions to follow)
- **Auth context:** `components/AuthProvider/AuthProvider.tsx` (manages auth state)
- **useUser hook:** `hooks/useUser.ts` (access user state if needed)
- **Test patterns:** `components/SignupForm/SignupForm.test.tsx` (mocking approach)
- **CSS patterns:** `components/LoginForm/LoginForm.module.css` (existing styles)

## Architectural Notes

1. **No redirect needed:** Success message acts as confirmation; form stays on same page
2. **Security-first errors:** Generic messages prevent info leakage
3. **Consistent patterns:** Follows SignupForm for visual/behavioral consistency
4. **Automatic session:** AuthProvider's `onAuthStateChanged` handles session without explicit state update in component
5. **Accessible design:** Error messages use `role="alert"`, form labels properly associated, buttons keyboard accessible
