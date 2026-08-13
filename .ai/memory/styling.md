# Shared Styling Language

## Foundation

- Use GOV.UK Frontend components and markup conventions as the base for forms, buttons, navigation, errors, tables, and typography.
- Load shared styling through `src/styles.css`; keep imports grouped by shared components and page styles.
- Use the existing Kainos CSS custom properties in `src/styles.css` instead of repeating raw values.
- The current palette combines Kainos blue, green, bright blue, orange, grey, white, and near-black text. Do not introduce a new dominant color family without approval.
- Use the existing font tokens `--k-font-body` and `--k-font-display`. Do not add a new font dependency or remote font without approval.

## Layout and rhythm

- Use GOV.UK width containers and responsive breakpoints already present in the application.
- Keep layouts content-first and scannable, with consistent spacing from the existing `--k-space-*` tokens.
- Use the existing small and medium radii. Avoid highly rounded cards or pill-shaped controls unless the product requirement calls for them.
- Keep repeated items comparable and avoid nesting cards inside cards.
- Add page-specific CSS under `src/styles/pages/`; add reusable UI treatment under `src/styles/components/`.

## Components

- Reuse shared button, form, link, notification, table, header, and footer styles before adding page-specific overrides.
- Primary actions use the existing primary button treatment; secondary and warning actions use their existing variants.
- Preserve visible keyboard focus using the shared focus treatment.
- Form fields must retain clear labels, hints, error associations, and the existing error color.
- Navigation should use the established header structure and responsive behavior.

## Accessibility and responsive behavior

- Preserve semantic HTML, GOV.UK accessibility attributes, and keyboard navigation.
- Check narrow and wide layouts whenever a page structure or component changes.
- Do not allow text, controls, or tables to overlap or overflow their containers.
- Maintain readable contrast and do not use color as the only way to communicate state.

## Review expectations

- A new visual pattern, token, font, gradient, shadow system, or component family is an invention and requires approval.
- Visual changes should include focused tests where behavior changes and a manual check at desktop and mobile widths.
