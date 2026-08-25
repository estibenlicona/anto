## Why

The catalog has no way to label an item as a member of a set, where color tells the members apart without asserting anything about them. The two components that look closest both refuse the job for good reasons:

- `Badge` is a *status* label. Its variants are the system's status roles, it renders an indicator dot, and it carries `role="status"`. Labelling effort sizes with it (`XS`…`XL`) would force a status reading — `variant="danger"` on `XL` says "XL is bad" — and would announce a size to assistive technology as if it were a live status change.
- `Chip` requires `onRemove`; it is a removable filter token, not a label.

The catalog already recognizes this gap, but has only solved it privately. `NavbarAppRef.color` takes a free-form color string, documented as "consumer data, not a system role — a set of apps needs to be told apart from each other by a color each one owns […] a semantic role (danger/warning/…) would incorrectly imply meaning here." That is exactly the need here, solved inline for one component and unavailable to anything else.

The immediate consumer is the admin "Parámetros del modelo" screen, which shows effort sizes `XS · S · M · L · XL` and wants color to distinguish them at a glance.

## What Changes

- Add a `Tag` component: a small solid-filled label whose color is chosen by the consumer to distinguish one member of a set from another, and which asserts nothing about the item.
- Give it a `color` prop named by hue (`gray`, `green`, `blue`, `amber`, `red`, `purple`) rather than by status role, so a consumer picking a color is never also making a status claim. Each hue resolves to an existing primitive scale — no new color tokens.
- Render it on the `subtle` tint under the `default` text step — a pairing every role already defines and the token contrast check already covers — and give a set of short labels a shared minimum width so they render at one size.
- Omit the status dot and `role="status"`: a `Tag` is read as its own text, not announced as a state.
- Exclude `brand` from the available colors, on the same grounds `Badge` already documents — that role is reserved for a view's primary action.
- Register it in the component registry and give it a docs page with usage guidance that says plainly when to reach for `Tag` versus `Badge`.
- No **BREAKING** changes: `Tag` is additive; `Badge` and `Chip` are untouched.

## Capabilities

### New Capabilities

(none — this extends the existing component-library capability)

### Modified Capabilities

- `component-library`: adds `Tag` to the catalog and defines its behavior — categorical color that carries no status meaning, solid fill, and a text label that never depends on color alone.

## Impact

- `packages/components/src/tag.tsx` — new component; exported from the package index.
- `packages/components/registry/definitions.ts` — new registry entry, so `Tag` is installable and appears in the generated registry and AI skill.
- `apps/docs/src/content/tag.tsx`, `apps/docs/src/content/index.ts`, `apps/docs/src/examples/tag/` — docs page, registration and examples.
- Unblocks the follow-up `admin-shell` change in the sibling app (tabs on the Parámetros screen, plus adopting `Table`'s `flush`/`align`), which needs `Tag` to label the size column.
