## 1. Column alignment

- [x] 1.1 Add `align?: "left" | "right"` to `TableHeadProps` and to `TableCell`'s props in `packages/components/src/table.tsx`, defaulting to `"left"`.
- [x] 1.2 Resolve `align="right"` to right-aligned text plus tabular figures, applied in one place so header and cell stay consistent; keep `"left"` producing today's classes exactly.
- [x] 1.3 Apply the resolved alignment in `TableHead` (both the plain and the sortable branch — the sortable branch's inner `<button>` must follow the alignment too, not stay left) and in `TableCell`.

## 2. Header typography

- [x] 2.1 Restyle `TableHead` to use the `label` token instead of `text-body-sm`, in both the plain and sortable branches, keeping the header's existing subtle text color.
- [x] 2.2 Confirm the sortable header's sort icon still aligns with the smaller label text and that its focus ring is unchanged. Caught a real bug here: the CSS reset applies `text-transform: none` to `button`, so the sortable header rendered in sentence case next to its uppercase neighbours — fixed by repeating `uppercase` on the button. Focus ring classes left untouched.

## 3. Flush mode and last-row rule

- [x] 3.1 Add `flush?: boolean` to `TableProps`, defaulting to `false`; when true, the wrapper drops its border and rounded corners while keeping `w-full overflow-x-auto`.
- [x] 3.2 Drop the last body row's bottom rule via `TableBody`'s `[&>tr:last-child]:border-b-0`. NOT `last:border-b-0` on `TableRow` as originally planned: the header row is also a `TableRow` and the only `tr` in `thead`, so that would have deleted the header/body separator. See the corrected decision in design.md.
- [x] 3.3 Verify `TableFooter`'s `border-t` still reads as the single separator above a footer row, now that the last body row has no rule. Confirmed on the anatomy example: exactly one line between the last data row and "Total".

## 4. Docs

- [x] 4.1 Replace the hand-rolled `className="text-right tabular-nums"` with `align="right"` in `apps/docs/src/content/table.tsx` and in `apps/docs/src/examples/table/02-columna-numerica.tsx`, so the documented pattern is the prop. Also covered `03-integracion-completa.tsx`, which had the same boilerplate.
- [x] 4.2 Update the usage guidance in `apps/docs/src/content/table.tsx` that currently tells consumers to apply `tabular-nums` by hand, pointing at `align="right"` instead. Also refreshed the "Divisorias de fila" and "Contenedor" anatomy notes, which the last-row and `flush` changes made stale.
- [x] 4.3 Add an example showing a `Table` with `flush` inside a `Card`, since that is the composition the prop exists for.

## 5. Verification

- [x] 5.1 Render the docs table examples and confirm numeric columns are right-aligned with digits lining up between rows.
- [x] 5.2 Confirm a default `Table` (no `flush`, no `align`) still renders with its own border, left-aligned cells, and unchanged spacing.
- [x] 5.3 Confirm a `flush` Table inside a `Card` shows a single border — the Card's — with no rounded corners or rule doubling at the last row.
- [x] 5.4 Review the header restyle across the docs site's existing table examples, confirming the smaller `label` token still reads clearly and no header wraps unexpectedly. Checked Básico, Columna numérica, Integración completa, Dentro de una Card and the anatomy figure; also confirmed the header/body separator survives the last-row change.
- [x] 5.5 Run `tsc --noEmit` on `packages/components` and `apps/docs`, and rebuild the package so the registry picks up the new props. Registry now reports `table: 6 own prop(s)` (was 3).
