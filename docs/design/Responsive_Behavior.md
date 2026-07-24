# EduCore Responsive Behavior & Grid Breakpoint Specification

## 1. Grid Breakpoints Scale
- **Mobile (`xs` / `<640px`)**: Single column layout, full-bleed cards, mobile drawer menu, sticky bottom action bar.
- **Tablet (`sm` / `640px–768px`)**: 2-column card grid, collapsible sidebar overlay.
- **Laptop (`md` / `768px–1024px`)**: 3-column metric cards, inline header navigation.
- **Desktop (`lg` / `1024px–1280px`)**: 4-column metric grid, fixed 280px sidebar layout.
- **Large Monitors (`xl` / `>1280px`)**: Max container width `max-w-7xl` centered with outer ambient glow margins.

## 2. Table Responsive Adaptation
- **Desktop**: Full data table with all columns (ID, Name, Track, Parent, Status, Actions).
- **Mobile / Tablet**: Horizontal scroll container (`overflow-x-auto`) or card-based view item stack.
