# EduCore Enterprise UI Component Library & Layout Specifications

## 1. Action Components (Buttons)
- **Primary Action**: `bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25`
- **Secondary Action**: `bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold rounded-xl`
- **Ghost Action**: `bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white`
- **Danger Action**: `bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20`
- **Success Action**: `bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20`

## 2. Display Components (Cards & Stat Widgets)
- **StatCard Component**: Accepts `title`, `value`, `change`, `changeType`, `icon`, and `iconBgColor`. Renders metric count with visual icon container.
- **StatusChip Component**: Accepts `status` and `type` (`enrollment` | `bill`). Dynamically applies HSL background, text color, and border.

## 3. Data Tables
- **Header Structure**: `bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800`
- **Row Structure**: `hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors` with font-mono reference numbers.

## 4. Modal Overlays & Drawers
- **Glassmorphism Backdrop**: `fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4`
- **Container Box**: `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl`
