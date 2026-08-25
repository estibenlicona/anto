## Why

"Parámetros del modelo" stacks its four sections — bandas de talla, mix de capacidades, pool de preguntas, versionado — as a 2×2 grid of cards, so all four tables compete for attention at once and the screen scrolls past whatever the reader is not looking at. Each section is a self-contained reference table that is consulted on its own, never compared against the others, which is what tabs are for.

The screen also predates the design system's recent additions and reads worse than it needs to as a result:

- Every `Table` sits directly inside a `Card`, and both draw `rounded-surface border border-neutral-default` — a border inside a border on all four sections. `Table` now has `flush` for exactly this.
- Every numeric column renders left-aligned with proportional digits: puntajes, PM mín/máx, los conteos del mix, los pesos y máximos del pool. `Table` now has `align="right"`, which right-aligns and applies tabular figures together.
- The talla column repeats five closed values as plain text. `Tag` now exists to label a member of a set with a color that distinguishes it without implying a status.

## What Changes

- Reorganize the four sections into four tabs, one section each, replacing the 2×2 card grid. The first tab (bandas de talla) is active on load.
- Drop each section's `CardHeader`: the tab trigger already names the section, and repeating it below is the same duplication the screen's `AdminPageHeader` already avoids by rendering the page title `sr-only`. Radix associates each panel with its trigger, so the accessible name survives without a second heading.
- Pass `flush` to every `Table`, so each section shows a single border — the `Card`'s.
- Pass `align="right"` to the header and cells of every numeric column across the four tables.
- Render the talla column with `Tag`, one fixed color per size (XS gray, S green, M blue, L amber, XL red), stable wherever the size appears.
- Update `AdminParametersPage.test.tsx`: it asserts the "Editar parámetros" button is disabled, and that button lives in the versionado section, which is no longer mounted unless its tab is selected.
- No **BREAKING** changes: this is a placeholder screen with no persisted state and no backend calls, and the route is unchanged.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `admin-shell`: the "Parámetros del modelo" screen presents its four sections as tabs rather than all at once, with only the selected section's content rendered.

## Impact

- `frontend/src/pages/AdminParametersPage/AdminParametersPage.tsx` — tabs, `flush`, `align`, `Tag`, and the removal of the four `CardHeader`s.
- `frontend/src/pages/AdminParametersPage/AdminParametersPage.test.tsx` — the assertions that depend on every section being mounted at once.
- Consumes `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`, `Table`'s `flush` and `align`, and `Tag` from `@tuya-ui/components`; all already exist, so no design-system change is required.
