# EduCore Microinteractions Specification

## 1. Notification Bell Animation
- **Trigger**: New high-priority system notification or applicant status change.
- **Animation**: Subtle bell swing rotation (`animate-bounce` or keyframe rotation 12deg left/right twice) with a glowing red indicator badge.

## 2. Success Checkmark & Toast Notifications
- **Toast Notifications (`sonner`)**: Slide in from top-right corner (`duration: 4000ms`, `position: top-right`).
- **Confirmation Feedback**: Green checkmark pulse animation (`animate-in zoom-in-50 duration-200`) upon document verification or student conversion.

## 3. Sidebar Collapse & Expansion
- **Transition**: Smooth width transition (`w-70` to `w-20`, `transition-all duration-300 ease-in-out`).
- **Tooltip Fallbacks**: Collapsed icon-only state displays tooltip labels on hover.

## 4. Progress Bars & Metric Counter Animations
- **Progress Stepper**: Active step indicator pulses subtly (`animate-pulse`) while inactive completed steps render static checkmarks.
