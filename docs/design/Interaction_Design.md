# EduCore Interaction Design Guidelines
**(SECTION 47)**

## 1. Primary Action & Button States
- **Hover State**: Subtle scale elevation (`hover:scale-[1.01]`) with background color shift (`hover:bg-blue-500`) and shadow expansion (`shadow-xl shadow-blue-500/25`).
- **Active / Pressed State**: Micro-scale down (`active:scale-[0.99]`) for tactile touch feedback.
- **Focus State**: `focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` for accessible keyboard navigation.
- **Disabled State**: `disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`.

## 2. Command Palette (`Cmd+K` / `Ctrl+K`)
- **Trigger**: Keypress shortcut (`Cmd+K` / `Ctrl+K`) or search bar click.
- **Backdrop**: Smooth backdrop blur (`backdrop-blur-md bg-slate-950/60`).
- **Keyboard Navigation**: Up/Down arrow keys select items, Enter executes selection, Esc dismisses modal.

## 3. Data Table Filtering & Sorting
- **Instant Search**: Debounced client-side filtering updating table rows without full page refreshes.
- **Column Sorting**: Clicking column headers toggles ascending/descending order with visual directional indicator icons.
