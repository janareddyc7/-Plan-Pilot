# PlanPilot design system — Perpetuity v1

This is the shared visual contract for every page and feature. The user's Perpetuity selection overrides the older palette in the master specification. Keep the current light theme unless the team explicitly asks for a theme change. Do not reinterpret the product's visual identity for each feature.

## Source of truth

- **Values:** src/styles/theme.css is the only source of raw colors, base radius and theme shadows.
- **Tailwind mapping and global behavior:** src/app/globals.css imports the tokens and maps them to semantic classes.
- **UI primitives:** src/components/ui contains Button, Input, Card, CardTitle, CardDescription and Badge. Reuse these; extend them centrally when needed.
- **Composition references:** src/app/page.tsx, src/app/(auth)/layout.tsx and src/components/shell/workspace.tsx.
- **Preset origin:** https://tweakcn.com/editor/theme?theme=perpetuity. This adaptation deliberately retains Geist body/headings and uses Courier New for monospace details; do not switch the entire app to monospace.

## Color roles

| Use | Classes |
| --- | --- |
| Page | bg-background text-foreground |
| Card, dialog, input surface | bg-card text-card-foreground |
| Primary action | bg-primary text-primary-foreground |
| Quiet controls and tinted areas | bg-secondary text-secondary-foreground |
| Supporting copy | text-muted-foreground |
| Selected/highlighted area | bg-accent text-accent-foreground |
| Error | text-destructive; pair with visible explanatory text |
| Dividers and outlines | border-border |
| Focus | outline-ring / ring-ring |
| Sidebar | bg-sidebar text-sidebar-foreground and sidebar-* tokens |
| Charts | var(--chart-1) through var(--chart-5) |

Use opacity modifiers such as bg-primary/10 when needed. SVGs use currentColor and semantic text classes. Recharts accepts CSS variable strings directly. Do not hardcode hex/RGB values, use generic Tailwind palettes like teal-600, or add a second palette in a feature stylesheet. White button text is text-primary-foreground, not text-white.

## Typography, shape and space

- Geist Sans for body/headings. font-mono for figures, labels and receipts; tabular-nums for money.
- Body text-sm/text-base with leading-6/leading-7. Supporting labels text-xs. Page headings text-3xl or text-4xl, font-medium, tracking-tight. Landing hero may use its existing larger responsive scale.
- Use the existing eyebrow class for small uppercase metadata; do not use it for long copy.
- Controls rounded-sm (2px), cards rounded-md (4px), larger panels rounded-lg (6px). rounded-full is for dots, avatars and small status pills.
- Prefer gap-4/gap-6/gap-8 and p-6/sm:p-8. Page gutters px-5/sm:px-10. Use thin borders and whitespace, not large shadows.
- shadow-control for primary controls; shadow-preview only for the landing preview. No new decorative shadows or gradients by default.
- Lucide icons, usually 16–20px, with text or an accessible name. No new icon pack or font for an individual feature.

## States and responsive behavior

Reuse Button variants default/outline/ghost. Use Input with an associated label, aria-invalid and an error description. Pending actions disable duplicate submission and retain a visible progress message. Empty/loading/error/success states are required when relevant.

All interactive controls need keyboard focus. Financial/status changes need text, not color alone. Use the built-in reduced-motion rule; normal UI transitions are 180ms, with the existing reveal animation reserved for initial page entrances.

Test narrow mobile layouts and desktop. Avoid horizontal page overflow; a future timeline may scroll within its own labeled container. Do not hide essential functionality on mobile.

## Example

```tsx
import {Button} from "@/components/ui/button";
import {Card, CardTitle, CardDescription} from "@/components/ui/card";
import {Input} from "@/components/ui/input";

<Card>
  <CardTitle>Plan details</CardTitle>
  <CardDescription>Review the information supplied by your insurer.</CardDescription>
  <label htmlFor="plan-name" className="mt-6 block text-sm font-medium">Plan name</label>
  <Input id="plan-name" name="name" />
  <Button className="mt-6" type="submit">Save details</Button>
</Card>
```

## Extending the system

Check existing components first. Add missing primitives under components/ui following components.json and Radix accessibility conventions. A shadcn generator must not overwrite global tokens or reset the theme. Add a genuinely necessary new semantic token in theme.css and its Tailwind mapping in globals.css; document its role here.

Run npm run theme:check before committing. CI runs it too. It catches common raw colors in TypeScript/TSX/CSS outside theme.css, but is not a complete CSS parser and does not guarantee consistent layout. Review changes visually. Token-file edits themselves require review because that file is intentionally exempt from raw-color checks.

## Prompt for any teammate's AI

> Before implementing my feature, read AGENTS.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, and docs/STATUS.md. Use the existing PlanPilot Perpetuity v1 theme in src/styles/theme.css and reusable components in src/components/ui. Match the current home/auth/workspace patterns. Do not invent another palette, font, radius system, or page style. Use semantic Tailwind tokens and keep new UI responsive and accessible. Work only on the feature I assign. Run npm run theme:check plus the relevant project checks, and report what you verified.
