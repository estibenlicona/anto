## 1. Select

- [x] 1.1 Add `SelectItem` to `select.tsx`, wrapping `RadixSelect.Item` with the same classes and `ItemIndicator` currently inlined in `Select`'s `options.map`
- [x] 1.2 Add `SelectTrigger` to `select.tsx`, wrapping `RadixSelect.Trigger` + `RadixSelect.Value` + `RadixSelect.Icon` with the same classes currently inlined in `Select`
- [x] 1.3 Refactor `Select` to render `SelectTrigger` and one `SelectItem` per option instead of the inline JSX
- [x] 1.4 Export `SelectTrigger` and `SelectItem` from `select.tsx` and re-export from `packages/components/src/index.ts`
- [x] 1.5 Verify `Select` renders and behaves identically (keyboard navigation, loading state, error state) to before the refactor

## 2. Combobox

- [x] 2.1 Add `ComboboxItem` to `combobox.tsx`, wrapping `CommandItem` with the same classes currently inlined in `Combobox`'s `options.map`
- [x] 2.2 Add `ComboboxTrigger` to `combobox.tsx`, wrapping the trigger `button` (selected chips / placeholder / chevron) currently inlined in `Combobox`
- [x] 2.3 Refactor `Combobox` to render `ComboboxTrigger` and one `ComboboxItem` per option instead of the inline JSX
- [x] 2.4 Export `ComboboxTrigger` and `ComboboxItem` from `combobox.tsx` and re-export from `packages/components/src/index.ts`
- [x] 2.5 Verify `Combobox` renders and behaves identically (filtering, multi-select chips, backspace-removes-last-chip) to before the refactor

## 3. Pagination

- [x] 3.1 Add `PaginationPrevious` and `PaginationNext` to `pagination.tsx`, wrapping the existing prev/next `button`s and their `navButtonClasses`
- [x] 3.2 Add `PaginationItem` to `pagination.tsx` (props: `page`, `active`, `onSelect`), wrapping the existing page-number `button`
- [x] 3.3 Add `PaginationEllipsis` to `pagination.tsx`, wrapping the existing `…` `span`
- [x] 3.4 Refactor `Pagination` to compose `PaginationPrevious`, `PaginationItem`, `PaginationEllipsis`, `PaginationNext` from `getPageItems` instead of the inline JSX
- [x] 3.5 Export the four parts from `pagination.tsx` and re-export from `packages/components/src/index.ts`
- [x] 3.6 Verify `Pagination` renders and behaves identically (ellipsis collapsing, disabled prev/next at bounds) to before the refactor

## 4. Navbar

- [x] 4.1 Add `NavbarBrand` to `navbar.tsx` (props: `product`, `apps`, `variant`, `onNavigate`), wrapping the brand mark + app-switcher `DropdownMenu` block
- [x] 4.2 Add `NavbarSearch` to `navbar.tsx` (props: `onSearch`, `variant`), wrapping the search button block
- [x] 4.3 Add `NavbarUtilities` to `navbar.tsx` (props: `utilities`, `notifications`, `user`, `userMenu`, `variant`, plus the existing notification/account handlers), wrapping the utility links + `NotificationMenu` + account `Menu` block
- [x] 4.4 Refactor `Navbar` to compose `NavbarBrand`, `NavbarSearch`, `NavbarUtilities` in the same fixed order, keeping the shared `openPanel` coordination (`panelProps`) at the `Navbar` level since both `NavbarUtilities`' notification and account panels need it
- [x] 4.5 Export the three parts from `navbar.tsx` and re-export from `packages/components/src/index.ts`
- [x] 4.6 Verify `Navbar` renders and behaves identically (responsive collapse under 1120px/960px, single-open-panel coordination, skip link) to before the refactor

## 5. Sidebar

- [x] 5.1 Add `SidebarItem` to `sidebar.tsx` (props matching `SidebarNavItem` plus `active`, `collapsed`, `density`, `onNavigate`), wrapping the existing per-item `li`/`a`/`Tooltip` block
- [x] 5.2 Add `SidebarGroup` to `sidebar.tsx` (props: `label`, `collapsed`, `children`), wrapping the existing group heading + `ul` block
- [x] 5.3 Refactor `Sidebar` to render one `SidebarGroup` per group, each containing one `SidebarItem` per item, instead of the inline JSX
- [x] 5.4 Export `SidebarGroup` and `SidebarItem` from `sidebar.tsx` and re-export from `packages/components/src/index.ts`
- [x] 5.5 Verify `Sidebar` renders and behaves identically (three-signal active item, badge saturation at 99+, collapse persistence, auto-collapse under 1120px) to before the refactor

## 6. DateField

- [x] 6.1 Add `DateFieldCalendar` to `date-field.tsx` (props: `selected`, `onSelect`, `minDate`, `maxDate`), wrapping the existing `Popover.Root` + `DayPicker` block (using `calendarClassNames`/`calendarComponents` from `date-calendar.tsx`)
- [x] 6.2 Refactor `DateField` to render `DateFieldCalendar` behind its calendar-toggle button, converting the ISO string to/from `Date` via the existing `parseIsoDate`/`toIsoDate` at the `DateField` boundary
- [x] 6.3 Export `DateFieldCalendar` from `date-field.tsx` and re-export from `packages/components/src/index.ts`
- [x] 6.4 Verify `DateField` renders and behaves identically (manual ISO entry, calendar selection, min/max disabled days) to before the refactor

## 7. DateRangeField

- [x] 7.1 Add `DateRangeFieldCalendar` to `date-range-field.tsx` (props: `selected: DateRange`, `onSelect`, `minDate`, `maxDate`), wrapping the existing `Popover.Root` + `DayPicker` `mode="range"` block
- [x] 7.2 Refactor `DateRangeField` to render `DateRangeFieldCalendar` behind its calendar-toggle button, converting ISO strings to/from `Date`/`DateRange` at the `DateRangeField` boundary
- [x] 7.3 Export `DateRangeFieldCalendar` from `date-range-field.tsx` and re-export from `packages/components/src/index.ts`
- [x] 7.4 Verify `DateRangeField` renders and behaves identically (manual entry of both ends, read-mode abbreviated format, calendar range selection) to before the refactor

## 8. FileUploader

- [x] 8.1 Export the existing (currently private) `FileUploaderRow` function from `file-uploader.tsx`, keeping its current `item`/`onRemove` signature unchanged
- [x] 8.2 Re-export `FileUploaderRow` from `packages/components/src/index.ts`
- [x] 8.3 Verify `FileUploader` renders and behaves identically (per-row status, progress bar, error message, removal) to before the change

## 9. Docs and registry

- [x] 9.1 Run the registry generation script in `packages/components/registry` and confirm the new exported parts (`SelectTrigger`, `SelectItem`, `ComboboxTrigger`, `ComboboxItem`, `PaginationPrevious`, `PaginationNext`, `PaginationItem`, `PaginationEllipsis`, `NavbarBrand`, `NavbarSearch`, `NavbarUtilities`, `SidebarGroup`, `SidebarItem`, `DateFieldCalendar`, `DateRangeFieldCalendar`, `FileUploaderRow`) appear with their prop docs
- [x] 9.2 Run the full `packages/components` test/build/typecheck suite and confirm no regressions across the eight refactored components
