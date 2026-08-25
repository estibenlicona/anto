## Context

See proposal.md — Why. The constraints that shape the approach:

- The screen is a placeholder: module-level constant arrays, no backend, no persisted state. Nothing here has to survive a tab switch, which removes the usual reason to keep hidden panels mounted.
- `AdminPageHeader` renders the page title as an `sr-only` `<h1>`, with a comment stating the rule: the sidebar's active entry and the breadcrumb already name the screen, so repeating it visually is duplication — but the heading landmark stays for screen readers. The same tension appears one level down once tabs name each section.
- The four sections are not symmetric. Three are a bare `Table`; "Versionado y auditoría" is an `Alert`, a `Table` and a disabled `Button` inside a `CardBody`.
- `AdminParametersPage.test.tsx` asserts on content from two different sections in the same render, which only works while everything is mounted at once.

## Goals / Non-Goals

**Goals:**
- One section in view at a time, without losing the accessible naming that the current headings provide.
- Adopt the affordances the design system now has, rather than leaving the screen hand-rolling around their absence.

**Non-Goals:**
- Not reordering or merging columns. An earlier round explicitly chose `flush` + `align` over the reference mockup's re-cut of the bandas table (columns reordered, PM mín/máx fused into one range), so the five columns stay as they are.
- Not making the screen functional — no persistence, no backend, and "Editar parámetros" stays disabled.
- Not touching the other three Admin screens, which keep their current stacked structure.
- No design-system changes: everything used here already ships.

## Decisions

- **Drop each section's `CardHeader` rather than keeping it above the table.** The tab trigger is now the section's visible name; a `CardHeader` repeating it verbatim is the same duplication `AdminPageHeader` already exists to avoid, one level down. Radix Tabs points each panel at its trigger with `aria-labelledby`, so the panel keeps an accessible name without a second heading — which is what makes this a safe removal rather than a loss. Considered and rejected: keeping the header (duplicates), and making it `sr-only` like `AdminPageHeader` (redundant, since the trigger association already provides the name).
- **Keep the `Card` even without its header, and pass `flush` to the `Table` inside it.** The card is still the surface that separates the panel from the page canvas. `flush` is precisely the prop for a table already inside a bordered container, so the pairing is the intended one rather than a workaround.
- **Let inactive panels unmount (Radix's default); do not add `forceMount`.** There is no state in a panel worth preserving — the data are module constants. `forceMount` would only matter for keeping form input or scroll position alive, neither of which exists here.
- **Tab order follows the current reading order** (bandas → mix → pool → versionado), with bandas active on load. The grid already put bandas first, so nothing about the screen's information order changes; only how much of it is visible at once.
- **The talla→color map lives in the page's data, next to the rows, not in a helper.** It is five entries of consumer data — which color a size wears — and `Tag` deliberately takes a color rather than deriving one. Putting it in the same constant as the rows keeps the pairing visible where someone editing a band would look.
- **`Tag` is used for the talla cells only, not for the XS…XL column headers in the mix table.** Those headers are column names, not data values; a `Tag` there would present a heading as though it were a row's value.
- **The test switches tabs instead of asserting across all sections.** It currently reads the "Editar parámetros" button while the versionado section happens to be mounted. Under tabs that button is genuinely absent until its tab is selected, so the honest fix is to select the tab and then assert — the test then covers the tab interaction too, rather than being weakened to accommodate it.

## Risks / Trade-offs

- [Tabs hide three quarters of the screen, so a reader who wants to compare two sections now has to switch back and forth] → Accepted on the grounds that these are independent reference tables — a band's persona-mes range has nothing to compare against the pool's question weights. If a real cross-section comparison appears later, that is a reason to revisit the grouping, not to keep four tables permanently on screen.
- [Removing the `CardHeader`s means the section names exist in exactly one place; if the tab list is ever restyled into something less prominent, the sections lose their visible labels] → Bounded by the spec requirement that each tab names its section, which makes the label a stated behavior rather than an incidental styling detail.
- [The screen becomes the first consumer of `Tabs`, `flush`, `align` and `Tag` at once, so a defect in any of them surfaces here first] → All four are covered by the design system's own docs examples and its contrast/type checks; this change adds no new component behavior, only its first application in the app.
