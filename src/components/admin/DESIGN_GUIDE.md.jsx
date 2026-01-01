# PILAR Application Design Guide

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Layout Patterns](#layout-patterns)
5. [Component Design](#component-design)
6. [Motion & Animation](#motion--animation)
7. [Glassmorphism & Effects](#glassmorphism--effects)
8. [Accessibility](#accessibility)

---

## Design Philosophy

### Core Principles
- **Clarity First**: Information hierarchy should be immediately apparent
- **Progressive Disclosure**: Show complexity only when needed
- **Consistency**: Reuse established patterns throughout the app
- **Delight**: Subtle animations and interactions create engagement
- **Performance**: Visual effects should never compromise usability

### Visual Language
The PILAR app uses a **modern, dark-themed design** with:
- Deep space-like backgrounds (#0F0F12)
- Vibrant accent colors for each pillar
- Glassmorphic surfaces with backdrop blur
- Smooth, purposeful animations
- Generous whitespace and breathing room

---

## Color System

### Base Colors
```css
--color-primary: #6C4BF4;          /* Primary purple */
--color-secondary: #3FD0C9;        /* Secondary teal */
--color-surface-dark: #0F0F12;     /* Main background */
--color-surface-light: #F6F7FB;    /* Light surface (rare) */
--color-text-primary: #FFFFFF;     /* Primary text */
--color-text-secondary: #A1A1AA;   /* Secondary text (zinc-400) */
```

### Pillar Colors (Semantic)
Each pillar has a dedicated color that represents its essence:

```css
--color-pillar-purpose: #8B5CF6;      /* Violet - Direction & meaning */
--color-pillar-interpersonal: #EC4899; /* Pink - Connection & empathy */
--color-pillar-learning: #4F46E5;     /* Indigo - Growth & curiosity */
--color-pillar-action: #10B981;       /* Emerald - Execution & momentum */
--color-pillar-resilience: #F59E0B;   /* Amber - Strength & recovery */
```

### Usage Guidelines
- **Pillar Colors**: Use exclusively for pillar-related content (icons, badges, connections)
- **Primary Color**: Use for CTAs, key actions, and interactive elements
- **Text Colors**: White for primary content, zinc-400 for secondary/metadata
- **Gradients**: Combine pillar colors for visual interest (e.g., violet-to-pink)

### Color Combinations
```css
/* Approved gradient combinations */
from-violet-500 to-pink-500      /* Purpose + Interpersonal */
from-indigo-500 to-violet-500    /* Learning + Purpose */
from-emerald-500 to-indigo-500   /* Action + Learning */
from-amber-500 to-orange-500     /* Resilience (hierarchical) */
```

---

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

**Inter** is used throughout for its excellent readability and modern aesthetic.

### Type Scale

#### Headings
```css
h1: text-4xl md:text-5xl (36px/48px)    /* Page titles */
h2: text-2xl (24px)                      /* Section headers */
h3: text-xl (20px)                       /* Card titles */
h4: text-base (16px)                     /* Subsection titles */
```

#### Body Text
```css
text-base (16px)    /* Primary body text */
text-sm (14px)      /* Secondary text, labels */
text-xs (12px)      /* Metadata, captions */
```

### Font Weights
- **Regular (400)**: Body text
- **Medium (500)**: Emphasized text, labels
- **Semibold (600)**: Subheadings, important labels
- **Bold (700)**: Main headings, key information

### Line Height
- Headings: `leading-tight` (1.25)
- Body: `leading-relaxed` (1.625)
- Compact UI: `leading-normal` (1.5)

---

## Layout Patterns

### Grid Systems
```jsx
// Standard content grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Feature showcase (auto-fit)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// Split view (sidebar + content)
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">{/* Main content */}</div>
  <div>{/* Sidebar */}</div>
</div>
```

### Spacing System
Use Tailwind's spacing scale consistently:
- **Extra tight**: `gap-1` `gap-2` (4-8px) - Icon + text, chip groups
- **Tight**: `gap-3` `gap-4` (12-16px) - Cards in lists
- **Normal**: `gap-6` (24px) - Main content sections
- **Loose**: `gap-8` `gap-12` (32-48px) - Major page sections

### Container Widths
```css
max-w-4xl (896px)  /* Standard content pages */
max-w-5xl (1024px) /* Wide content pages */
max-w-7xl (1280px) /* Dashboard/data-heavy pages */
```

### Padding/Margin Standards
```css
p-4 (16px)  /* Cards, modals */
p-6 (24px)  /* Large cards, page sections */
p-8 (32px)  /* Hero sections, feature areas */
```

---

## Component Design

### Cards

#### Standard Card
```jsx
<div className="rounded-[28px] p-8 border backdrop-blur-xl 
                bg-gradient-to-br from-white/5 to-white/[0.02] 
                border-white/10">
  {/* Content */}
</div>
```

**Characteristics:**
- Large border radius (28px) for modern feel
- Subtle gradient background
- Backdrop blur for glassmorphism
- 10% white border with transparency

#### Interactive Card
```jsx
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="rounded-2xl p-6 border backdrop-blur-sm
             bg-white/5 border-white/10 cursor-pointer
             hover:bg-white/10 hover:border-white/20 transition-all"
>
  {/* Content */}
</motion.div>
```

### Buttons

#### Primary Button
```jsx
<Button className="bg-gradient-to-r from-violet-500 to-pink-500 
                   hover:from-violet-600 hover:to-pink-600 
                   text-white shadow-lg shadow-violet-500/30">
  Primary Action
</Button>
```

#### Secondary Button
```jsx
<Button variant="outline" 
        className="border-white/10 text-zinc-300 
                   hover:bg-white/10 hover:text-white">
  Secondary Action
</Button>
```

#### Ghost Button
```jsx
<Button variant="ghost" 
        className="text-zinc-400 hover:text-white hover:bg-white/10">
  Ghost Action
</Button>
```

### Modals

#### Standard Modal Structure
```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm 
             flex items-center justify-center p-4"
  onClick={onClose}
>
  <motion.div
    initial={{ scale: 0.9, y: 20 }}
    animate={{ scale: 1, y: 0 }}
    exit={{ scale: 0.9, y: 20 }}
    onClick={(e) => e.stopPropagation()}
    className="bg-gradient-to-br from-zinc-900/95 to-black/95 
               rounded-3xl border border-white/10 p-6 max-w-lg w-full 
               backdrop-blur-xl"
  >
    {/* Modal content */}
  </motion.div>
</motion.div>
```

### Badges & Tags

#### Pillar Badge
```jsx
<div className="px-3 py-1.5 rounded-full text-xs font-medium"
     style={{ 
       backgroundColor: `${pillarColor}33`, 
       color: pillarColor,
       border: `1px solid ${pillarColor}55`
     }}>
  {pillarName}
</div>
```

#### Status Badge
```jsx
<span className="px-2 py-1 rounded-full bg-emerald-500/20 
                 text-emerald-300 text-xs font-medium">
  Active
</span>
```

---

## Motion & Animation

### Animation Library
**Framer Motion** is used for all animations.

### Animation Principles
1. **Purpose**: Every animation should have a clear purpose
2. **Subtlety**: Animations should feel natural, not distracting
3. **Performance**: Use `transform` and `opacity` (GPU-accelerated)
4. **Consistency**: Reuse animation variants

### Standard Animations

#### Page Entry
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

#### Staggered Children
```jsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.1 } }
  }}
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
```

#### Hover States
```jsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400 }}
>
```

#### Modal/Dialog
```jsx
<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
```

### Timing
- **Fast**: 0.15s - Micro-interactions (hover, focus)
- **Normal**: 0.3s - Standard transitions (page entry, modals)
- **Slow**: 0.5-0.8s - Dramatic reveals, data visualizations

---

## Glassmorphism & Effects

### Glassmorphic Surfaces
```css
/* Standard glass card */
background: linear-gradient(to bottom right, 
            rgba(255,255,255,0.05), 
            rgba(255,255,255,0.008));
backdrop-filter: blur(24px);
border: 1px solid rgba(255,255,255,0.1);
```

### Blur Effects
- **backdrop-blur-sm**: 4px - Subtle overlay
- **backdrop-blur**: 8px - Standard glass effect
- **backdrop-blur-md**: 12px - Strong glass
- **backdrop-blur-xl**: 24px - Prominent modals

### Glow Effects
```css
/* Button/CTA glow */
box-shadow: 0 10px 40px -10px rgba(139, 92, 246, 0.3);

/* Pillar node glow */
box-shadow: 0 0 20px rgba(pillarColor, 0.4);
```

### Gradient Overlays
```jsx
// Background gradient orbs
<div className="absolute top-0 left-1/4 w-[500px] h-[500px] 
                bg-violet-500/10 rounded-full blur-[150px]" />
<div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] 
                bg-pink-500/10 rounded-full blur-[150px]" />
```

---

## Accessibility

### Color Contrast
- **Text on dark**: Use white (#FFFFFF) or light zinc (zinc-100, zinc-200)
- **Minimum ratio**: 4.5:1 for normal text, 3:1 for large text
- **Interactive elements**: Must have visible focus states

### Focus States
```jsx
className="focus:outline-none focus:ring-2 focus:ring-violet-500 
           focus:ring-offset-2 focus:ring-offset-zinc-900"
```

### Motion Preferences
```jsx
// Respect user's motion preferences
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<motion.div
  animate={prefersReducedMotion ? {} : { scale: [1, 1.05, 1] }}
>
```

### Interactive Elements
- All clickable elements should have `cursor-pointer`
- Buttons should have hover and active states
- Use semantic HTML (`<button>`, `<a>`, `<nav>`)
- Provide descriptive labels and aria attributes

### Keyboard Navigation
- All interactive elements accessible via Tab
- Modals should trap focus
- Escape key closes modals
- Enter/Space activates buttons

---

## Design Checklist

When creating new components:

- [ ] Uses appropriate pillar colors (if pillar-related)
- [ ] Has dark background with proper contrast
- [ ] Includes subtle animations (entry, hover)
- [ ] Uses glassmorphic styling where appropriate
- [ ] Responsive on mobile, tablet, desktop
- [ ] Has proper focus states
- [ ] Follows spacing system (gaps, padding)
- [ ] Uses Inter font family
- [ ] Has loading states (if async)
- [ ] Includes error states (if applicable)

---

## Resources

### Color Palette Reference
- [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors)
- Pillar colors defined in `Layout.js`

### Typography
- [Inter Font](https://rsms.me/inter/)
- [Tailwind Typography Scale](https://tailwindcss.com/docs/font-size)

### Components
- [shadcn/ui](https://ui.shadcn.com/) - Base component library
- [Lucide Icons](https://lucide.dev/) - Icon system
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

**Last Updated**: December 2025  
**Version**: 1.0  
**Maintained by**: PILAR Development Team