# UI Design System

## Color Palette (Green Aesthetic)

All colors defined in `frontend/app/globals.css` via `@theme inline`.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-forest` | `#2D5016` | Primary dark green (headings, strong accents) |
| `--color-emerald` | `#059669` | Primary action color (buttons, links, active states) |
| `--color-sage` | `#4A7C59` | Secondary green (borders, muted accents) |
| `--color-mint` | `#E8F5E9` | Light green (card backgrounds, hover states) |
| `--color-mint-cream` | `#F1F8E9` | Page background |
| `--color-pine` | `#1B3409` | Darkest green (body text) |
| `--color-leaf` | `#81C784` | Soft highlight green |
| `--color-moss` | `#33691E` | Dark accent green |

## Typography

**Fonts** (loaded via Google Fonts `@import` in `globals.css`):
- **Display/headings**: `Fraunces` (serif, variable weight)
- **Body/UI**: `Outfit` (sans-serif, variable weight)

**Scale**:
- Page titles: `text-3xl` / `text-4xl` Fraunces, font-bold
- Section headings: `text-xl` / `text-2xl` Fraunces
- Body text: `text-sm` / `text-base` Outfit
- Small/meta text: `text-xs` Outfit

## Components (Custom, no shadcn)

### Card (`components/ui/Card.tsx`)
- White background, rounded-2xl, shadow, padding
- Used as wrapper for all dashboard sections

### Badge (`components/ui/Badge.tsx`)
- Pill-shaped, small text, colored background
- Used for categories, statuses

### ProgressRing (`components/ui/ProgressRing.tsx`)
- SVG circular progress indicator
- Configurable size, stroke width, color, percentage

### NavBar (`components/ui/NavBar.tsx`)
- Fixed top navigation
- 4 links: Dashboard, Goals, Journal, Setup
- Green theme with active state highlighting
- Uses Lucide icons

## Layout Patterns
- Dashboard uses CSS grid for card layout
- Pages are max-width containers with padding
- Cards use flexbox for internal layout
- Responsive: mobile-first, grid columns adjust at breakpoints

## Tailwind v4 Notes
- **No `tailwind.config.js`** — all config is in `globals.css` via `@theme inline { ... }`
- Custom colors referenced as `text-forest`, `bg-mint-cream`, `border-sage`, etc.
- Custom animations defined in `globals.css` (`@keyframes`)
- Custom scrollbar styles in `globals.css`

## Banner Images
- 6 SVG placeholders in `public/banners/banner-{1-6}.svg`
- Displayed as rotating collage on dashboard
- **To replace**: swap the SVG files, keep the same filenames

## Mood Options
Emoji-based mood picker: happy, good, neutral, bad, awful (with corresponding emoji icons)
