## Context

`Breadcrumb` (`packages/components/src/breadcrumb.tsx`) currently hardcodes `text-neutral-subtle` / `text-neutral-default` for its links, current-page label and separators — tokens meant for a light surface. It has no border today; the border the request originally pointed at turned out to belong to `Canvas` (`apps/docs/src/components/Canvas.tsx`), the docs site's shared example frame, confirmed with the user (see proposal.md - Why).

`Navbar` already solves the same "adapt to background" problem: a `variant?: "dark" | "light"` prop feeds a single `getNavbarTone(variant)` helper that every zone of the bar derives its text/interactive classes from, rather than each zone recomputing its own light/dark branch.

## Goals / Non-Goals

**Goals:**
- Give `Breadcrumb` a background-adaptive color mode using the same shape of API (`variant`) and derivation pattern (`Navbar`'s tone helper) already established in the catalog, so the two components read as one system rather than two separate approaches.
- Keep the default (`"light"`) visually identical to today's output — zero change for existing callers.

**Non-Goals:**
- No border is being added to `Breadcrumb` — none exists today, and the design does not introduce one under either variant.
- Not building a general "surface context" mechanism (e.g. inherited from a React context/provider) that every component reads automatically. `Navbar` doesn't do this either — the design stays consistent with the explicit-prop pattern already in the catalog rather than introducing a new mechanism for one component.

## Decisions

- **Reuse the `variant?: "light" | "dark"` shape from `Navbar`, not a boolean `dark` prop.** `Navbar` and other catalog components already use this two-value string enum for background adaptation; matching it keeps the prop name and values predictable across components instead of introducing a second convention (e.g. `dark?: boolean`) for the same concept.
- **A local tone helper, not a shared cross-component utility.** `Navbar`'s `getNavbarTone` is `Navbar`-specific (it also derives interactive/hover classes irrelevant to Breadcrumb). Breadcrumb gets its own small helper returning just the three token groups it needs (link, current-page, separator), rather than factoring out a premature shared abstraction across two components with different surfaces (nav bar chrome vs. inline text).
- **Dark variant reuses `text-neutral-inverse` for both link and separator tones, no separate "muted-on-dark" step.** `Navbar`'s own design notes document that no semantic text token reads legibly on a dark surface besides `-inverse` — every other neutral step is dark-toned, meant for light surfaces. Breadcrumb's dark variant follows the same documented simplification: separators/non-current links use `text-neutral-inverse` at reduced visual weight only via `hover:` state changes, not a distinct dimmer token that doesn't exist for dark surfaces.
- **`Canvas`'s border is simply deleted, not replaced with a different visual separator.** The `docs-site` spec's "Vista previa visual de componente" requirement only demands the example be "visualmente distinguido del fondo de la página" — `Canvas`'s dotted radial-gradient background already provides that distinction independent of the border, so no `docs-site` spec delta or replacement styling is needed.

## Risks / Trade-offs

- [Removing `Canvas`'s border changes the framing of every component's docs example, not just Breadcrumb's] → Accepted explicitly by the user after being told this is site-wide, not Breadcrumb-scoped; the dotted background pattern preserves the separation the docs-site spec requires.
- [A future component needing background adaptation might reach for a third, slightly different convention if the pattern isn't documented] → Out of scope for this change; `Navbar`'s existing convention plus this change together are the reference to follow, no new documentation artifact is being created here.
