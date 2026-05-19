---
name: Stitch Design System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3d4a3f'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6c7b6e'
  outline-variant: '#bbcabc'
  surface-tint: '#006d3d'
  primary: '#006d3d'
  on-primary: '#ffffff'
  primary-container: '#02b96b'
  on-primary-container: '#004122'
  inverse-primary: '#4be08d'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#494bd6'
  on-tertiary: '#ffffff'
  tertiary-container: '#9497ff'
  on-tertiary-container: '#1b14b1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6cfda7'
  primary-fixed-dim: '#4be08d'
  on-primary-fixed: '#00210f'
  on-primary-fixed-variant: '#00522c'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  surface-white: '#ffffff'
  surface-subtle: '#f1f3f5'
  border-low: '#e9ecef'
  border-mid: '#dee2e6'
  text-main: '#1a1c1e'
  text-muted: '#64748b'
  error-red: '#fa5252'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  sidebar-left: 280px
  panel-right: 320px
  gutter: 16px
  margin-page: 24px
  stack-sm: 8px
  stack-md: 16px
---

## Brand & Style

The design system for this AI workbench is rooted in **Corporate Modernism** with a focus on high-utility professional tools. It balances the experimental nature of AI with a reliable, structured interface that prioritizes workflow efficiency and creative clarity. 

The aesthetic is characterized by:
- **Cleanliness:** High use of whitespace and high-contrast typography to reduce cognitive load during complex multi-step processes.
- **Collaboration:** Visual indicators that suggest a "workbench" environment where human input and AI output coexist seamlessly.
- **Precision:** Sharp execution of functional elements, using the signature green accent to guide the user's eye to primary actions and active states.

## Colors

The palette is centered around a vibrant "Stitch Green" (`#02b96b`), used strategically for primary actions and active workflow states. 

- **Primary Action:** Used for "Generate," "Save," and active step indicators.
- **Surfaces:** A hierarchy of whites and near-whites (`#f8f9fa`) distinguishes the three-pane layout. The main workspace uses pure white to ensure color accuracy for generated images, while the side panels use subtle grays to provide structural containment.
- **Typography:** High-contrast dark grays (`#1a1c1e`) ensure legibility for technical prompt text and labels.
- **Borders:** Low-contrast dividers maintain the grid without cluttering the visual field.

## Typography

This design system utilizes **Inter** for its neutral, highly legible characteristics, making it ideal for a data-dense design workbench. 

- **Scale:** A tight scale is used to accommodate the three-column layout. 
- **Hierarchy:** Bold weights are reserved for step headers and primary UI labels. 
- **Speciality:** For AI prompt editing and reverse-engineered tags, a monospaced font (JetBrains Mono) is introduced to differentiate "machine-generated" content from "system" labels.
- **Mobile Adaptivity:** For the rare instances of mobile viewing, `headline-xl` should scale down to 24px to prevent overflow in the workflow pane.

## Layout & Spacing

The layout follows a **Fixed-Fluid-Fixed** tri-pane model:
1.  **Left (Workflow):** 280px fixed width. Contains the step-based progress tree.
2.  **Center (Workspace):** Fluid width. Focuses on the canvas and large-scale previews.
3.  **Right (AI Panel):** 320px fixed width. Houses high-interaction controls like textareas and task status.

**Rhythm:** An 8px base grid governs all padding and margins. Vertical stacks within panels use 16px spacing to group related controls, while 8px is used for internal element relationships (e.g., label to input).

## Elevation & Depth

To maintain a "modern professional" feel, the system avoids heavy shadows. 

- **Layering:** Depth is conveyed through **Tonal Layers**. The background is a neutral light gray, while the active workspace and cards are pure white with a subtle 1px border (`#dee2e6`).
- **Interaction:** Hover states on image cards and workflow steps use a very soft, diffused ambient shadow (4px blur, 5% opacity) to indicate "pick-up" potential.
- **Modals/Drawers:** Use a backdrop blur (8px) and a standard elevation shadow to pull focus away from the workbench during prompt inspection or cropping tasks.

## Shapes

The system uses **Soft (0.25rem)** roundedness for most UI elements. This approach maintains a professional, "tooled" look that isn't overly organic or playful, which suits a technical workbench.

- **Standard (4px):** Used for buttons, input fields, and small cards.
- **Large (8px):** Used for the main workspace containers and image preview frames.
- **Pill:** Reserved exclusively for status tags (e.g., "Completed," "Processing") to distinguish them from actionable buttons.

## Components

### Buttons
- **Primary:** Background `#02b96b`, text `#ffffff`. Sharp 4px corners. Used for "Generate" and "Submit."
- **Secondary:** Border 1px `#dee2e6`, background transparent, text `#1a1c1e`. Used for "Save," "Download," and "Retry."
- **Ghost:** No background or border, text `#64748b`. Used for "Delete" or "Cancel" within cards.

### Input Fields & Textareas
- **Default:** White background, 1px border `#dee2e6`. 
- **Focus:** Border changes to `#02b96b` with a 2px outer glow of the same color at 20% opacity.
- **Prompt Textarea:** Uses `code-sm` font for technical clarity.

### Workflow Steps (Left Panel)
- **Active Step:** Left-hand border accent (4px) in `#02b96b` and a subtle highlight background.
- **Completed Step:** Checkmark icon in green.
- **Thumbnail:** Small 40x40px crop of the step's output.

### Image Cards (Model Viewport)
- 1px internal border to define edges against white backgrounds.
- Floating labels at the bottom for "Front," "Side," etc., using a semi-transparent dark background (80% opacity) and white text.

### Progress Bars
- 4px height, track in `#e9ecef`, fill in `#02b96b` with a subtle pulse animation for active AI tasks.