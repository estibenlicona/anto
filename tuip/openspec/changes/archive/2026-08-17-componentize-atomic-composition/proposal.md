## Why

Most compound components in `@tuya-ui/components` already follow an atomic-composition pattern — `Table` exposes `TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`, `Modal` exposes `ModalHeader`/`ModalBody`/`ModalFooter`, and `Accordion`, `Tabs`, `Drawer`, `Menu`, `Popover`, `Stepper`, `ActivityTimeline`, `NotificationMenu` and `CommandPalette` all do the same. A remaining group of components is still shipped as a single monolithic function with no exported sub-parts: `Select`, `Combobox`, `Pagination`, `Navbar`, `Sidebar`, `DateField`, `DateRangeField` and `FileUploader`. Consumers who need a layout these components don't anticipate (a custom trigger, a custom pagination control set, a differently laid-out sidebar item) have to fork the component instead of recomposing it. Extending the atomic-composition convention that already covers most of the catalog to this remaining group closes that gap.

## What Changes

- Add a catalog-wide requirement that every compound component in the catalog exposes its internal structural parts as separately importable, named components, codifying the pattern `Table`, `Modal`, `Accordion`, `Tabs`, `Drawer`, `Menu`, `Popover`, `Stepper`, `ActivityTimeline`, `NotificationMenu` and `CommandPalette` already follow.
- Decompose the remaining monolithic components into exported atomic parts, keeping today's top-level component as a composed convenience wrapper built from those same parts so existing usage keeps working:
  - `Select` → `SelectTrigger`, `SelectItem`
  - `Combobox` → `ComboboxTrigger`, `ComboboxItem`
  - `Pagination` → `PaginationPrevious`, `PaginationNext`, `PaginationItem`, `PaginationEllipsis`
  - `Navbar` → `NavbarBrand`, `NavbarSearch`, `NavbarUtilities`
  - `Sidebar` → `SidebarGroup`, `SidebarItem`
  - `DateField` → `DateFieldCalendar`
  - `DateRangeField` → `DateRangeFieldCalendar`
  - `FileUploader` → `FileUploaderRow`
- Document, per component, which exported identifiers are its atomic parts, so consumers know what can be recomposed versus what is an internal implementation detail.
- No **BREAKING** changes: existing top-level imports and props keep working as today; the atomic parts are additive exports.

## Capabilities

### New Capabilities

(none — this extends the existing component-library capability)

### Modified Capabilities

- `component-library`: adds a catalog-wide atomic-composition requirement and per-component requirements for the exported atomic parts of Select, Combobox, Pagination, Navbar, Sidebar, DateField, DateRangeField and FileUploader.

## Impact

- Code: `packages/components/src/select.tsx`, `combobox.tsx`, `pagination.tsx`, `navbar.tsx`, `sidebar.tsx`, `date-field.tsx`, `date-range-field.tsx`, `file-uploader.tsx`, plus `packages/components/src/index.ts` to export the new atomic parts.
- Registry/docs generation (`packages/components/registry`) needs to pick up the new exported identifiers so they appear in generated API docs.
- No dependency or runtime API changes; purely additive exports plus internal refactors of the eight listed components to be built from those exports.
