## Why

`Table` documents conventions it gives consumers no way to follow. The main spec already requires that "las columnas numéricas se alinean a la derecha con cifras tabulares" — but only as a *documentation* obligation. `TableHead` and `TableCell` hardcode `text-left`, so every numeric column has to hand-roll `className="text-right tabular-nums"`, and in practice most don't: the admin "Parámetros del modelo" screens render score and person-month columns left-aligned, with digits that don't line up between rows.

Two more gaps show up the moment a table is placed in a real page:

- The `label` typography token is documented as being for "Column heading and other small caps rubrics" (12px, semibold, `letterSpacing: 0.09em`), yet `TableHead` uses `text-body-sm` — the token designed for column headings is not used by the only component that has column headings.
- `Table` wraps itself in `rounded-surface border border-neutral-default`, and `Card` does the same. Nesting a `Table` inside a `Card` — the dominant pattern across the admin screens — draws a border inside a border, and the last `TableRow`'s `border-b` adds a third line right against the container edge.

## What Changes

- Add an `align?: "left" | "right"` prop to `TableHead` and `TableCell`. `align="right"` right-aligns the cell and applies tabular figures, turning the documented numeric convention into an affordance the component provides. Defaults to `"left"` — today's behavior.
- Restyle `TableHead` to use the `label` token (uppercase, 12px, semibold, letter-spaced) instead of `text-body-sm`, so column headings render with the token the design system defines for them.
- Add a `flush?: boolean` prop to `Table` that drops its own surface chrome (border and rounded corners), for when the table is already inside a bordered container such as `Card`. Defaults to `false` — today's standalone behavior.
- Stop drawing the bottom rule on the last `TableRow`, so the final row does not double up against the container's own border.
- No **BREAKING** changes: `align` and `flush` are optional and default to current behavior. The `TableHead` restyle is a visual change to every existing table, applying a token already designated for column headings.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `component-library`: `Table` gains a per-column alignment affordance (replacing a documentation-only convention), a flush mode for nesting inside a bordered container, `label`-token column headings, and no bottom rule on the last row.

## Impact

- `packages/components/src/table.tsx` — `align` on `TableHead`/`TableCell`, `flush` on `Table`, `label` token on headings, last-row rule removal.
- `apps/docs/src/content/table.tsx` and `apps/docs/src/examples/table/` — document `align` and `flush`; the alignment convention moves from prose-only to a demonstrated prop.
- Consumers rendering a `Table` inside a `Card` (notably the admin parameter screens in the sibling app) can adopt `flush` and `align`; nothing breaks if they don't.
