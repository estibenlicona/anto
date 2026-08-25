## Why

`Breadcrumb` renders its links and separators with fixed light-surface neutral tokens (`text-neutral-subtle`, `text-neutral-default`), so it only reads legibly on a light background. Other Tuya CA products place navigation chrome — headers, sidebars — on a dark surface (see `Navbar`'s `variant="dark" | "light"` pattern), and Breadcrumb currently has no way to follow. Separately, the docs site frames every live component example inside a bordered `Canvas` (`apps/docs/src/components/Canvas.tsx`); on the Breadcrumb page that outer frame reads as if it belonged to the component itself, so it's being removed from `Canvas` to stop implying Breadcrumb has a border it doesn't.

## What Changes

- Add a `variant?: "light" | "dark"` prop to `Breadcrumb`, following the same tone-derivation pattern `Navbar` already uses (`getNavbarTone`): on `variant="dark"`, links, the current-page label and separators resolve to `text-neutral-inverse`/its muted counterpart instead of the light-surface tokens, so the component stays legible on a dark background. Defaults to `"light"` (today's behavior), so existing usage is unaffected.
- Remove the `border` (and its rounded-corner clipping tied to that border) from the docs site's shared `Canvas` component (`apps/docs/src/components/Canvas.tsx`), which wraps every component's live examples — not Breadcrumb-specific. The dotted background pattern already used inside `Canvas` keeps the example visually distinguished from the surrounding page, satisfying the existing "lienzo distinguido" requirement without a border.
- No **BREAKING** changes: `Breadcrumb`'s new prop is optional and defaults to current behavior; `Canvas`'s border removal is a visual-only docs-site tweak with no prop or API change.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `component-library`: `Breadcrumb` gains a `variant` prop that adapts its text/separator colors to a light or dark background.

## Impact

- `packages/components/src/breadcrumb.tsx` — add `variant` prop and tone derivation.
- `apps/docs/src/components/Canvas.tsx` — drop the border wrapper class (affects the example frame on every component page, not just Breadcrumb's).
- `apps/docs/src/content/breadcrumb.tsx` — document the new `variant` prop and, if useful, add a dark-background example.
