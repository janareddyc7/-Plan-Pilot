# PlanPilot — Vintage Paper

The user's latest selection is tweakcn **Vintage Paper**, replacing Perpetuity.
Preset source: https://github.com/jnsahaj/tweakcn/blob/main/utils/theme-presets.ts (vintage-paper).

## Shared theme

- Raw colors and radius: src/styles/theme.css. This uses the preset's light palette.
- Tailwind mapping: src/app/globals.css.
- UI primitives: src/components/ui. Extend these centrally.
- References: home, auth layout, workspace, dashboard.
- Do not introduce per-feature palettes, raw color values, large gradients, or decorative AI panels.

## Typography and density

The palette follows the preset; typography is deliberately adapted for this compact application.
Use local Geist for body and controls, Georgia for restrained editorial headings, and tabular numbers for financial results.
Do not download a different font for each feature.

- Page headings: serif, 28–32px; landing headline can reach 60px.
- Body: 12–14px. Secondary metadata: 10–11px.
- Controls: 36–40px high. Keep accessible labels and visible focus.
- Panels: thin borders, 4–8px radii, 16–20px padding; avoid oversized shadows.
- Gaps: 12–20px. Dashboard sidebar: 196px, collapses to navigation on mobile.
- Use warm paper surfaces and brown accents sparingly; no giant primary-colored marketing block in the workspace.

## Semantic roles

Use bg-background for the page, bg-card for panels, bg-sidebar for navigation.
Use text-foreground for primary text and text-muted-foreground for secondary text.
Use bg-primary/text-primary-foreground for actions, bg-secondary for quiet emphasis,
border-border for dividers, ring-ring for focus, and text-destructive for errors.
All charts use chart tokens. No hardcoded colors outside theme.css.

## Behavior

Use native inputs, labels, disabled/pending/error states and keyboard focus.
The receipt uses a native modal dialog for focus containment, Escape, and focus restoration.
Invalid schedule edits show a reason and retain the last valid calculation.
Current and recommended schedules stay distinct until the user applies a recommendation.
The sample plan must always be labeled as synthetic, including inside signed-in workspaces.

Verify browser behavior and mobile layout; a production build alone does not prove either.
Run theme:check, typecheck, lint, test and build.

## Teammate AI prompt

Read AGENTS.md, DESIGN_SYSTEM.md and docs/STATUS.md. Use the shared Vintage Paper
tokens and compact home/auth/dashboard patterns. Reuse the UI primitives.
Keep all financial values derived from the engine. Do not invent a different
palette, large headline treatment, or decorative AI card. Verify the actual UI
and report outstanding limitations honestly.
