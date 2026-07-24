# EduCore Enterprise Design Principles

## Core Design Principles

1. **Clarity Over Decoration**
   - Design choices must serve user comprehension first. Avoid arbitrary graphical noise or non-functional animations.

2. **Consistency Before Creativity**
   - Reuse standardized design tokens, button variants, and layout grids across all 20+ modules.

3. **Domain Integrity (`Applicant ≠ Student`)**
   - Maintain explicit separation between applicant records and enrolled student profiles.

4. **Forgiving Authentication**
   - Hide internal staff roles from public navigation. Provide clear back navigation (`← Back to Selection`) on all login screens.

5. **Progressive Disclosure**
   - Show high-level summary metrics first, with drill-down details available via drawers or modals.

6. **Accessibility & Contrast**
   - Ensure WCAG 2.1 AA compliance with high-contrast text ratios across light and dark themes.
