# EduCore Enterprise UI Implementation Contract
**(SECTION 48)**

---

## 1. General Implementation Rules

The existing application architecture is the authoritative single source of truth. The following core boundaries must **NEVER** change:

- **Business Logic & Domain Constraints**: Strict domain separation where `Applicant ≠ Student`. Applicants remain applicant records until approved and officially converted by Registrars.
- **Authentication & Security**: JWT token handling, role-based authorization (`AuthGuard`, `RoleGuard`, `PermissionGuard`), and forgiving authentication where internal staff roles are hidden from public header dropdowns.
- **Backend API Endpoints**: All ASP.NET Core Web API (.NET 9) contracts, PostgreSQL schemas, and Axios service instances.
- **Routing Structure**: All 20+ public, portal selection, applicant tracking, and enterprise ERP module routes.

---

## 2. Design System Compliance & Token Enforcements

Every frontend enhancement must adhere to the official Design System:
1. **Color System**: Use approved HSL color tokens (`--primary`, `--secondary`, `--accent-emerald`, `--accent-amber`, `--accent-rose`). No hardcoded hex strings.
2. **Typography Scale**: Follow Inter font hierarchy from Display (`text-4xl sm:text-6xl`) down to Caption (`text-xs text-slate-400`).
3. **Spacing Scale**: Enforce strict 4px grid spacing (`p-1`, `p-2`, `p-3`, `p-4`, `p-6`, `p-8`, `py-12`).
4. **Theme Support**: 100% light mode and dark mode compatibility with high-contrast accessibility ratios (WCAG 2.1 AA).

---

## 3. Component Reuse Policy

Before creating any new component:
1. Search the Component Library ([Enterprise_UI_Component_Library.md](file:///c:/Users/Charles/OneDrive/Desktop/THESIS/docs/design/Enterprise_UI_Component_Library.md)).
2. Reuse existing primitives (`StatCard`, `StatusChip`, `GlobalSearchModal`, `NotificationCenter`).
3. Extend existing components via props before creating new custom components.

---

## 4. Quality Assurance & Production Verification Checklist

Before any UI enhancement is considered production-ready, verify:

- [x] **Zero Build Errors**: `npm run build` passes cleanly with 0 TypeScript and Vite compilation errors.
- [x] **Zero Broken Routes**: All public, authentication, applicant, and role-guarded enterprise portal routes operate cleanly.
- [x] **Zero API Contract Mutating**: ASP.NET Core Web API endpoints and DTO structures remain 100% untouched.
- [x] **Responsive Verification**: Verified across Mobile (`<640px`), Tablet (`640-768px`), Laptop (`768-1024px`), Desktop (`1024-1280px`), and Large Monitors (`>1280px`).
- [x] **Keyboard & Accessibility**: Verified `Tab` navigation order, `focus:ring-2` focus indicators, `Esc` key modal dismissals, and screen-reader `aria-label` tags.
- [x] **Theme Consistency**: Verified text legibility and surface contrast across both Light and Dark themes.
- [x] **State Handling**: Verified loading skeletons, empty states, error fallbacks, and success toast alerts (`sonner`).

---

## 5. Design Governance & Single Source of Truth

The Design System and documentation suite under `docs/design/` remain the single source of truth for all future visual decisions across **EduCore (Noah's Academy Integrated Management System)**.
