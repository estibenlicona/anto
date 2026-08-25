## 1. Breadcrumb: background-adaptive color

- [x] 1.1 Add `variant?: "light" | "dark"` to `BreadcrumbProps` in `packages/components/src/breadcrumb.tsx`, defaulting to `"light"`.
- [x] 1.2 Add a local tone helper deriving link, current-page and separator classes from `variant`, following `Navbar`'s `getNavbarTone` pattern (dark → `text-neutral-inverse` for all three groups; light → today's existing tokens unchanged).
- [x] 1.3 Apply the derived classes in place of the hardcoded `text-neutral-subtle` / `text-neutral-default` classes on the separator, current-page `<span>` and level `<a>`.
- [x] 1.4 Confirm no border is introduced on either variant (none exists today; this stays true).

## 2. Docs: Canvas border removal

- [x] 2.1 Remove the `border border-neutral-default` class from the `<figure>` in `apps/docs/src/components/Canvas.tsx`, keeping `overflow-hidden rounded-control` and the dotted background pattern that still visually distinguishes the example from the page.
- [x] 2.2 Spot-check a few component pages (not just Breadcrumb) to confirm the example frame still reads as separated from the surrounding page without the border.

## 3. Docs content: Breadcrumb page

- [x] 3.1 Document the new `variant` prop in `apps/docs/src/content/breadcrumb.tsx` (props table / usage notes as the file's existing structure requires).
- [x] 3.2 Add or update an example demonstrating `variant="dark"` on a dark background so the adaptive behavior is visible in the docs.

## 4. Verification

- [x] 4.1 Render `Breadcrumb` with `variant="light"` (default) and confirm it's pixel-identical to today's output.
- [x] 4.2 Render `Breadcrumb` with `variant="dark"` on a dark background and confirm links, current-page label and separators are legible.
- [x] 4.3 Run the component library's existing lint/build checks to confirm no type errors from the new prop.
