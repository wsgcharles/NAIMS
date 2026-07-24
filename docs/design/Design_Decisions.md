# EduCore Architectural Design Decisions & Strategy

## Key Architectural Principles

1. **Domain Boundary (Applicant ≠ Student)**:
   - Applicants are strictly isolated in Applicant entities until approved by the Registrar and converted via the 1-Click Conversion Wizard.

2. **Forgiving Authentication**:
   - Internal staff roles are hidden from the public header. Users select between Student, Parent, or Employee SSO. All login pages include a visible `← Back to Selection` button and one-click recovery links.

3. **Layered API Integration**:
   - Axios instance with Bearer token interceptor, centralized `queryKeys.ts`, custom query hooks, and PBAC role guards (`AuthGuard`, `RoleGuard`, `PermissionGuard`).

4. **Design System Standardization**:
   - Shared HSL color tokens (`--primary`, `--secondary`, `--accent-emerald`, `--accent-amber`, `--accent-rose`), Inter typography scale, micro-animations (<200ms ease-out), and standard 4px grid spacing.
