## Context

See proposal.md — Why. The constraints that shape the approach:

- `Table` already threads `density` to `TableHead`/`TableCell` through a `DensityContext`, because a consumer composing rows by hand should not repeat a table-wide setting on every cell. Alignment is the opposite shape: it varies *per column*, so it cannot ride that context.
- `TableToolbar` also carries `rounded-surface border border-neutral-default` and is designed to sit immediately above a `Table`. Whatever solves the double border for `Card` must not silently change how `TableToolbar` + `Table` compose today.
- The `label` token (`packages/tokens/src/typography.ts`) is already documented as "Column heading and other small caps rubrics" and already carries `letterSpacing: 0.09em` at 12px semibold. The design-system mockups use the same treatment (`text-transform:uppercase; letter-spacing:.09em`) plus `text-align:right` and `font-variant-numeric:tabular-nums` for numeric columns.

## Goals / Non-Goals

**Goals:**
- Make the alignment convention the spec already states something the component can express, so a correct table is the easy one to write.
- Let a `Table` sit inside a bordered container without visual double-framing.

**Non-Goals:**
- No column-definition API (an `columns={[{align}]}` config object). `Table` is deliberately a hand-composed set of primitives; introducing a parallel declarative column model would create two ways to build the same table.
- Not inferring alignment from cell content (e.g. "looks numeric → right-align"). A column of years or IDs is numeric-looking but reads as a label; only the author knows which is which.
- Not changing `density`, sorting behavior, or the `TableToolbar` composition.

## Decisions

- **`align` is a prop on `TableHead`/`TableCell`, repeated per cell, not a context or a column config.** Alignment varies by column while `density` is uniform, so `DensityContext` is the wrong mechanism — a context can't hold a per-column value without an index. Repeating `align="right"` on the cells of one column is the honest cost of a hand-composed table, and it matches how the consumer already repeats `<TableCell>` itself. Considered and rejected: a `columns` prop on `Table` (introduces a second, competing way to define a table) and auto-detection from content (guesses wrong on IDs, years, codes).
- **`align="right"` applies `tabular-nums` as part of the same prop, not as a separate `numeric` flag.** The spec ties the two together ("a la derecha con cifras tabulares") and the mockups do the same. Splitting them into two props would let a consumer produce the half-correct state the convention exists to prevent — right-aligned with proportional figures that still don't line up.
- **A `flush` boolean on `Table`, rather than removing the border unconditionally.** A standalone `Table` on a page canvas still needs its own surface chrome — that is the current, correct default, and `TableToolbar` above a table depends on it. `flush` is opt-in for the nested case. Considered and rejected: dropping the border from `Table` and pushing it onto every consumer (breaks every standalone table), and detecting the parent container (not possible in CSS/React without a wrapper contract).
- **The last-row rule is removed by `TableBody` scoping the rule off its own last row (`[&>tr:last-child]:border-b-0`), not by `TableRow` carrying `last:border-b-0`.** A CSS-level `last:` variant is the right mechanism — it stays correct when rows are conditionally rendered, where a JS index check would have to be recomputed by the consumer who composes the rows. But it cannot live on `TableRow`: the header row is also a `TableRow`, and it is the only `tr` inside `thead`, so `:last-child` matches it too and would delete the rule separating the header from the body. Scoping the variant to `tbody`'s children targets exactly the row that doubles up against the container border, and leaves the header's own rule — the one doing real work — alone.
- **`TableFooter` keeps its own `border-t`.** With the last body row's rule gone, the footer's top border becomes the single line separating totals from data, so it is doing real work rather than doubling up.

## Risks / Trade-offs

- [The `TableHead` restyle changes every existing table's header appearance, including ones nobody revisits] → This is the intended correction — the token is already designated for column headings — but it is a visible change beyond the tables that prompted it. The 12px `label` token is smaller than today's 14px `text-body-sm`, so headers get visually lighter; verified against the docs site's existing table examples during implementation rather than assumed.
- [`align` must be repeated on the header and on every cell of a column; forgetting one produces a column whose header and body disagree] → Accepted as the cost of hand-composed primitives; the docs example shows header and cells carrying the same `align` so the pattern is copied correctly.
- [A consumer could set `flush` on a table that is *not* inside a bordered container, leaving it with no edges at all] → `flush` defaults to `false` and its purpose is stated on the prop; this is the same trust model as every other styling prop in the catalog.
