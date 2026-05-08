---
name: Faith Giving
colors:
  surface: '#f9f9ff'
  surface-dim: '#d9d9e1'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fb'
  surface-container: '#ededf5'
  surface-container-high: '#e8e7ef'
  surface-container-highest: '#e2e2e9'
  on-surface: '#1a1b21'
  on-surface-variant: '#46464b'
  inverse-surface: '#2e3036'
  inverse-on-surface: '#f0f0f8'
  outline: '#76777b'
  outline-variant: '#c7c6cb'
  surface-tint: '#5d5e64'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1a1b21'
  on-primary-container: '#82838a'
  inverse-primary: '#c6c6cd'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#191c1e'
  on-tertiary-container: '#818486'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e9'
  primary-fixed-dim: '#c6c6cd'
  on-primary-fixed: '#1a1b21'
  on-primary-fixed-variant: '#45474d'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f9f9ff'
  on-background: '#1a1b21'
  surface-variant: '#e2e2e9'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 600px
  gutter: 1.5rem
  section-gap: 4rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

This design system centers on a philosophy of "Reverent Minimalism." The brand personality is deeply rooted in clarity and accessibility, ensuring that the act of giving feels like a natural, undistracted extension of worship. By prioritizing high-contrast legibility and expansive whitespace, the UI evokes an emotional response of peace, transparency, and trust. 

The aesthetic style is a refined **Modern Minimalist** approach. It avoids unnecessary ornamentation, relying instead on precise typographic hierarchy and a sophisticated monochromatic foundation to guide the user’s journey. This creates a professional atmosphere that respects the gravity of stewardship while maintaining the warmth of a community-focused environment.

## Colors

The palette is anchored by the brand's deep charcoal (`#0A0C11`), used for primary actions and core typography to provide a sense of stability and authority. This is balanced by an expansive use of white (`#FFFFFF`) to ensure the "generous whitespace" requested is functional, not just aesthetic.

- **Primary:** Used for the most critical calls to action (e.g., "Give Now" buttons) and header text.
- **Secondary:** A muted slate gray used for auxiliary information and icons, preventing the interface from feeling too harsh.
- **Surface:** Subtle off-white backgrounds are used to differentiate form sections without introducing heavy borders.

## Typography

This design system utilizes **Plus Jakarta Sans** for its modern, friendly, and geometric characteristics, echoing the welcoming spirit of the community. 

Headlines are set with tighter letter-spacing and heavier weights to command attention, while body copy utilizes a generous line height (1.6) to maximize readability for all age groups. Labels are intentionally distinct, using uppercase styling and increased tracking to clearly mark form fields and small metadata without cluttering the layout.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model for the giving experience, centering the content in a focused 600px container. This concentration minimizes eye travel and increases conversion by making the giving process feel manageable.

Spacing is governed by a strict 8px rhythmic scale. We prioritize "generous whitespace" by using large vertical gaps (`section-gap`) between logical steps of the giving process (e.g., between "Amount Selection" and "Payment Details"). Internal component padding is kept airy to ensure the interface never feels cramped, even on mobile devices.

## Elevation & Depth

To maintain the clean and modern aesthetic, depth is communicated through **Low-Contrast Outlines** and **Tonal Layers** rather than heavy shadows.

1.  **Surface Tiers:** The main giving card sits on a very subtle light-gray background to separate it from the pure white page background.
2.  **Soft Borders:** Elements like input fields and amount-selection chips use 1px borders in a soft light-gray. 
3.  **Active State Depth:** When an element is selected (like a giving tier), it gains a subtle ambient shadow (0px 4px 20px, 5% opacity) to provide a soft "lift" without breaking the minimalist aesthetic.

## Shapes

The design system employs a **Rounded** shape language. 

- **Standard Elements:** Buttons and input fields use a 0.5rem radius, providing a softened, approachable feel that avoids the corporate coldness of sharp corners.
- **Large Elements:** Giving cards and main containers use a 1rem radius to frame the content comfortably.
- **Interactive Elements:** Small interactive chips (like pre-set dollar amounts) utilize the same 0.5rem radius to maintain a consistent visual rhythm throughout the form.

## Components

### Buttons
Primary buttons are solid `#0A0C11` with white text, utilizing bold typography. They should have a subtle scale-down effect on click to feel tactile. Secondary buttons use a transparent background with a 1px border.

### Giving Chips
For pre-set donation amounts, use large, airy chips. When unselected, they have a light border; when selected, they transition to a solid primary color background with white text to clearly indicate the choice.

### Input Fields
Inputs should be "Minimalist-Modern": a simple light-gray border that thickens slightly and darkens when focused. Labels should float or sit clearly above the field in the `label-md` style.

### Cards
The primary giving container is a large white card with a 1rem border-radius. It should have no visible border, instead relying on a very soft, wide ambient shadow to distinguish it from the background.

### Progress Indicator
A simple, thin line at the top of the card or container to show the user's step in the process (e.g., Amount > Info > Confirm), using the primary color for the active state and a light gray for pending states.