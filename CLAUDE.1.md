# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pocket Heist** is a Next.js 16 starter project for the Claude Code Masterclass. It's a mission management application where users can create, assign, and complete workplace "heists" (fun office tasks/challenges).

**Tech Stack:**
- Next.js 16.0.7 with App Router
- React 19.2.0
- TypeScript 5
- Tailwind CSS 4
- Lucide React (icons)
- Vitest + React Testing Library (testing)
- ESLint 9

## Common Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Production
npm run build        # Create optimized build
npm start            # Run production server

# Code Quality
npm run lint         # Run ESLint
npm run test         # Run all tests with Vitest
npm run test -- --ui # Run tests with UI dashboard
npm run test -- Navbar.test  # Run single test file

# Specific Test Patterns
npm run test -- --coverage   # Generate coverage report
npm run test -- --watch      # Watch mode for test development
```

## Architecture & Structure

### Route Organization (Next.js App Router)

The app uses **Route Groups** to separate public and protected routes:

```
app/
├── (public)/              # Unauthenticated routes
│   ├── page.tsx          # Splash/home page
│   ├── login/
│   ├── signup/
│   └── preview/          # Component preview sandbox
├── (dashboard)/          # Protected dashboard (includes Navbar)
│   └── heists/
│       ├── page.tsx      # List all heists
│       ├── create/       # Create new heist form
│       └── [id]/         # Individual heist details
├── layout.tsx            # Root layout
└── globals.css           # Global styles + Tailwind
```

**Key Pattern:** The `(public)` layout doesn't include Navbar; `(dashboard)` layout does. This naturally enforces navigation hierarchy.

### Component Structure

```
components/
└── Navbar/
    ├── Navbar.tsx        # Component logic
    ├── Navbar.module.css # Scoped styles (CSS Modules)
    └── index.ts          # Barrel export
```

**Style Strategy:** Mix Tailwind utility classes with CSS Modules for component-scoped styling. Use CSS Modules only when utility-first approach is insufficient.

### Testing Pattern

```
tests/
└── components/
    └── Navbar.test.tsx
```

Tests use **React Testing Library** with accessibility-first queries:
- `screen.getByRole()` - preferred for semantic queries
- `screen.getByText()` - when role doesn't work
- Avoid testing implementation details, focus on user behavior

## Important Configuration Details

### Path Aliases
- `@/*` resolves to project root for clean imports

### Styling

**Global styles** in `app/globals.css`:
- Tailwind directives (`@tailwind`)
- Custom theme colors: primary (#C27AFF), secondary (#FB64B6), success (#05DF72), error (#FF6467)
- Dark background (#030712)

**Component styles**: Use CSS Modules (`ComponentName.module.css`) for scoped styling to avoid global conflicts.

### TypeScript Configuration
- Strict mode enabled
- Target: ES2017
- Module: ESNext

## Development Workflow Notes

1. **Adding a new page**: Create a folder in `app/(dashboard)/` or `app/(public)/` with `page.tsx`
2. **Adding a component**: Create folder in `components/` with `.tsx`, `.module.css`, and `index.ts`
3. **Styling**: Start with Tailwind utilities, use CSS Modules only for complex scoped styles
4. **Testing**: Write tests in `tests/` mirroring the `components/` structure
5. **Dynamic routes**: Use `[paramName]` folder syntax for dynamic segments like `/heists/[id]`

## Key Architectural Decisions

- **Route Groups** enable flexible layout hierarchy without affecting URL structure
- **CSS Modules + Tailwind**: Prevents global CSS conflicts while maintaining rapid development
- **Vitest over Jest**: Faster test execution and better ESM support for modern projects
- **React 19**: Latest React features available (Server Components ready)

## Common Tasks

### Running the app in development
```bash
npm run dev
```
The app loads at `http://localhost:3000`. Hot module reloading is enabled.

### Creating a new page in the dashboard
1. Create `app/(dashboard)/[route-name]/page.tsx`
2. It automatically inherits the dashboard layout with Navbar

### Testing a component
```bash
npm run test -- ComponentName.test
npm run test -- --ui  # Visual test runner
```

### Debugging styles
- Check `globals.css` for global Tailwind config
- Check `ComponentName.module.css` for component-specific styles
- Use browser DevTools to inspect computed Tailwind classes

## Debugging & Troubleshooting

- **Import not working**: Check path alias in `tsconfig.json` (`@/*`)
- **Style not applied**: Verify Tailwind purge includes the file pattern; check CSS Module scoping
- **Test failing**: Use `screen.debug()` in tests to see rendered output; check accessibility tree with `screen.logTestingPlaygroundURL()`
- **Build errors**: Run `npm run lint` to catch TypeScript/ESLint issues before building

## Additional Coding Preferences

- Do NOT use semicolons for JavaScript or TypeScript code.
- Do NOT apply tailwind classes directly in component templates unless essential or just 1 at most. If an element needs more than a single tailwind class, combine them into a custom class using the `@apply` directive.
- Use minimal project dependencies where possible.
- Use the `git switch -c` command to switch to new branches, not `git checkout`.