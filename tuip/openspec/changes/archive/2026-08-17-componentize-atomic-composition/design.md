## Context

`packages/components/src` already has two established atomic-composition idioms in the codebase to follow, rather than invent:

- **Stateless part, shared value read from context** — `Table` (`table.tsx`) puts `density` on a `DensityContext.Provider` in `Table`, and `TableHead`/`TableCell` read it with `useContext`. No coordination is needed beyond a read-only value.
- **Radix-backed compound export** — `Modal` (`modal.tsx`) and `Popover` (`popover.tsx`) export their Radix-wrapped sub-parts (`ModalHeader`, `ModalBody`, `ModalFooter`, `PopoverTrigger`, `PopoverContent`) directly; the parts don't need a custom context because Radix's own `Root` already provides the shared state (open/close, focus trap) to any descendant.

The eight components in scope for this change (`Select`, `Combobox`, `Pagination`, `Navbar`, `Sidebar`, `DateField`, `DateRangeField`, `FileUploader`) split cleanly across these two idioms:

- `Select` and `Combobox` already wrap Radix primitives (`@radix-ui/react-select`, `cmdk`/`@radix-ui/react-popover`) internally — their new atomic parts follow the Modal/Popover idiom, thinly re-exporting the underlying Radix item/trigger already used inside the current monolith.
- `Pagination`, `Sidebar`'s items, `Navbar`'s zones, and `FileUploader`'s row have no Radix root under them today — they're plain markup with local state. Their atomic parts follow the Table idiom (or need no shared context at all, when a part has no state to share).
- `DateField`/`DateRangeField` already factor calendar rendering through shared helpers in `date-calendar.tsx` (`calendarClassNames`, `calendarComponents`, `parseIsoDate`, `toIsoDate`); the new `DateFieldCalendar`/`DateRangeFieldCalendar` parts wrap the existing `Popover.Root` + `DayPicker` block already in each file into an exported component, they don't add new date logic.

See proposal.md for the motivation (why this remaining group is out of step with the rest of the catalog) and specs/component-library/spec.md for the requirements each part must satisfy.

## Goals / Non-Goals

**Goals:**
- Every part is a real export, not a documentation-only convention: `import { SelectItem } from "@tuya-ui/components"` must work.
- The refactor is invisible to today's consumers: same props, same rendered output, same behavior for every existing scenario in `specs/component-library/spec.md`.
- Each part reuses the exact internal building block the monolith already renders (e.g. `SelectItem` wraps `RadixSelect.Item`, not a new abstraction over it) — no new state-management pattern is introduced beyond what `Table`/`Modal` already establish.

**Non-Goals:**
- Not decomposing components that already export parts (`Table`, `Modal`, `Accordion`, `Tabs`, `Drawer`, `Menu`, `Popover`, `Stepper`, `ActivityTimeline`, `NotificationMenu`, `CommandPalette`) — out of scope, already satisfy the catalog-wide requirement.
- Not extracting a shared `FormField` (label/error wrapper) atom across `Select`/`Combobox`/`DateField`/`DateRangeField`, even though the four repeat similar label+error markup — that's a separate, cross-cutting refactor with its own design trade-offs, not implied by "expose this component's own parts."
- Not changing any prop, default, or DOM output of the eight top-level components.
- Not adding new components beyond the named parts listed in the proposal.

## Decisions

**One file per component, parts co-located with the monolith.** Each new part is added to its existing file (`select.tsx`, `combobox.tsx`, etc.), not split into a new `select/` directory. Matches how `Table`, `Modal`, `Drawer` already keep their parts in one file each — the codebase has no precedent for a per-component folder, and none of these components is large enough (all under 260 lines) to need one.

**`SelectItem`/`ComboboxItem` wrap the Radix item, `Select`/`Combobox` map `options` to them internally.** Alternative considered: keep `options.map(...)` rendering the raw `RadixSelect.Item` JSX inline (as today) and have `SelectItem` be a separate, parallel export with duplicated markup. Rejected — that risks the two drifting out of sync (a style fix applied to one and not the other), which is exactly the failure mode Table avoids by having `TableHead`/`TableCell` be the single implementation `Table` itself doesn't re-implement.

**`NavbarBrand`/`NavbarSearch`/`NavbarUtilities` take the same data shapes Navbar already threads to them (`NavbarAppRef[]`, the `onSearch` handler, `NavbarUtilityLink[]`), not new prop shapes.** Keeps `Navbar`'s own render body a straightforward composition of the three, and keeps the parts individually meaningful (e.g., `NavbarSearch` alone needs `onSearch` and nothing else) rather than needing the full `NavbarProps` surface.

**`SidebarGroup`/`SidebarItem` mirror the existing `SidebarNavGroup`/`SidebarNavItem` data shapes as props, with `Sidebar` still owning collapse state.** `SidebarItem` needs `collapsed` (for the icon-only rendering and tooltip) and `density` from its ancestor; since `Sidebar` already threads `collapsed` down through closures rather than context (see `sidebar.tsx`), the same pattern carries over — no new context is introduced for a single boolean and a density enum, consistent with `Table`'s choice to only reach for context because rows can number in the hundreds (not applicable here, sidebars have at most two groups of seven items per the documented cap).

**`DateFieldCalendar`/`DateRangeFieldCalendar` take `selected`, `onSelect`, `minDate`, `maxDate`** (single date vs. range typed per component), i.e. the same props already passed to the inline `DayPicker` today — not the full field props (`label`, `error`, `value` as ISO string). The calendar part operates on `Date`/`DateRange` objects, matching `DayPicker`'s own vocabulary; ISO-string parsing (`parseIsoDate`/`toIsoDate`) stays the field's responsibility, called before handing a `Date` to the calendar part.

**`PaginationItem` is a page-number button, not a generic "any child" wrapper.** Alternative considered: a fully generic `PaginationItem` that accepts arbitrary children (link, button, anything). Rejected as over-abstraction for a component whose one documented use is page numbers (per the existing "Opciones del componente Pagination" requirement) — `PaginationItem` takes `page`, `active`, and `onSelect`, matching what `Pagination` already computes per item via `getPageItems`.

**`FileUploaderRow` keeps its existing signature** (`item: FileUploaderItem`, `onRemove?: () => void`) — it is already implemented as a private function in `file-uploader.tsx` today; this change only exports it, it does not redesign it.

## Risks / Trade-offs

- **[Risk] Exporting Radix-wrapped parts (`SelectItem`, `ComboboxItem`) couples the public API to Radix's own prop names (`value`, `disabled`), so a future swap of the underlying primitive would be a breaking change for anyone using the atomic parts directly.** → Mitigation: this is the same trade-off `Modal`/`Popover`/`Drawer` already accepted by exporting `Dialog`-backed and `Popover`-backed parts; staying consistent with that precedent is more valuable than avoiding the coupling on just these two components. Documented as a known trade-off, not fixed by this change.
- **[Risk] Eight components refactored in one change increases the surface for a behavioral regression slipping through (e.g. Sidebar's three-signal active-item styling, Navbar's single-open-panel coordination, Pagination's ellipsis logic).** → Mitigation: tasks.md sequences the eight independently (no shared code between them beyond what already exists), and each task requires confirming the "sigue funcionando igual" scenario for that component from specs/component-library/spec.md before moving to the next.
- **[Trade-off] Not extracting the shared `FormField` label/error pattern (see Non-Goals) leaves near-duplicate label/error JSX in `Select`, `Combobox`, `DateField`, `DateRangeField` after this change, same as before.** Accepted: this change's contract is "expose each component's own parts," not "deduplicate across components" — folding that in would blur the change's scope and its non-breaking guarantee.
