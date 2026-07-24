# EduCore Accessibility Specification (WCAG 2.1 AA)

## 1. Contrast Ratios & Legibility
- **Text Contrast**: All text elements achieve a minimum 4.5:1 contrast ratio against card and page background surfaces.
- **Interactive Controls**: Buttons, inputs, and select fields provide explicit border definitions and non-color dependent status indicators.

## 2. Keyboard Navigation & Focus Management
- **Focus Rings**: All interactive controls display high-contrast focus rings (`focus:ring-2 focus:ring-blue-500`).
- **Tab Order**: Logical top-to-bottom, left-to-right DOM tab order across forms, tables, and modal dialogs.
- **Modal Lock & Escape**: Opening a modal traps focus inside the dialog box and enables dismissal via the `Esc` key.

## 3. ARIA Labels & Screen Reader Support
- **Icon Buttons**: All icon-only buttons include descriptive `aria-label` tags (e.g. `aria-label="View Student Profile"`).
- **Landmarks**: Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`) are used throughout.
