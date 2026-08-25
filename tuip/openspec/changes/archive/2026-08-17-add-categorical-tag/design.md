## Context

See proposal.md — Why. The constraints that shape the approach:

- The token system has seven primitive color scales, and every one of them is named by **role**: `neutral`, `brand`, `danger`, `warning`, `success`, `info`, `discovery`. There is no hue-named or index-named categorical palette to draw from.
- Every status role already exposes a `bold` background paired with an `onBold` text color derived for contrast (`semantic-colors.ts` generates `onBold` per role), so a solid-filled label with legible text needs no new tokens.
- `Badge` occupies the adjacent space and defines the boundary this component must not blur: status roles, an indicator dot, `role="status"`, subtle fill with dark text.
- `Navbar` already documents the underlying idea — a color that is "consumer data, not a system role" — but implements it as a free-form `color: string` on one prop of one component.

## Goals / Non-Goals

**Goals:**
- Let a consumer distinguish members of a set by color without the API making them assert a status while doing it.
- Reuse the existing palette; adding a component should not require expanding the token system.

**Non-Goals:**
- Not a free-form `color: string` like `NavbarAppRef.color`. That prop exists because each external app owns a brand color the design system cannot know. Sizes, categories and priorities inside our own product have no such external owner, and an open string would let any inaccessible value through.
- Not replacing or absorbing `Badge`. The two stay separate; this change adds the missing half of the distinction rather than generalizing one component to cover both.
- Not adding new color primitives, and not offering `brand`.
- No removable/interactive behavior — that is `Chip`.

## Decisions

- **The `color` prop is named by hue (`gray`, `green`, `blue`, `amber`, `red`, `purple`), not by role.** This is the crux. The component exists precisely because the color means nothing, so the API must not make the consumer type a meaning to get one. `<Tag color="red">XL</Tag>` says "give XL the red one"; `<Tag variant="danger">XL</Tag>` would say "XL is dangerous" — a claim the author never intended and reviewers would have to keep re-litigating. Hue names are usually a smell in a design system, and they are the right call in exactly this case: when there is no semantic to name, naming the appearance is the honest option. Considered and rejected: reusing the status role names (imports the meaning we are trying to shed) and index-based slots like `color={1..6}` (nothing tells an author which index they already used for `M`, so stability across a set becomes guesswork).
- **Each hue resolves internally to an existing primitive scale** — `gray→neutral`, `green→success`, `blue→info`, `amber→warning`, `red→danger`, `purple→discovery`. The role-named token stays an implementation detail behind the hue-named prop, which is what keeps the consumer-facing vocabulary free of meaning while the palette stays single-sourced. The mapping is one lookup table, the same shape `Badge` already uses for its variants.
- **Tinted fill via `bg-{role}-subtle` + `text-{role}-default` (steps 100 and 800).** The first cut used the solid `bold` fill with `on-bold` text; it was replaced with a lighter, more vivid-reading tint on request. Two intermediate steps were evaluated and rejected: a `400` background needs new semantic tokens (the preset states outright that "primitives are never Tailwind utilities") and drops white text to 2.33–3.24:1, and a `600` text step is not exposed as a text token at all — only as `border` and `icon` — and measures 3.28:1 on `warning` over the tint. The 100/800 pairing already exists, needs no new tokens, and clears 4.5:1 on all six colors (7.06:1 at worst), so `verify-tokens.ts` passes untouched and no exception has to be carved into the `design-tokens` contrast requirement.
- **A minimum width so a set of labels renders at one size.** Left to fit their content, "XS" and "L" become visibly different pills down a table column, which suggests the two are different kinds of thing rather than two values of one. The label centers inside the minimum and a longer one grows past it, so the constraint never clips.
- **Pill shape (`rounded-pill`), not `Badge`'s square `rounded-control`.** This is not a free choice: `Badge`'s own docs already tell readers that a membership label "eso es un Tag, no un Badge — se distinguen también por forma, píldora en vez de cuadrada". The commitment predates this change and is already published, so `Tag` honors it rather than contradicting the page that sends people here. With both components now sharing the same `subtle` tint, shape carries more weight than it did under the original solid-fill plan: together with the absent status dot and the heavier text, it is what separates the two, so it is load-bearing rather than decorative.
- **No indicator dot and no `role="status"`.** `Badge` has both because it reports a state that can change; announcing a size as a status region is simply wrong. A `Tag` is its text.
- **The text label is required, not optional.** A color-only tag would make color the sole carrier of meaning, which fails for anyone who cannot distinguish the hues — and would also make the six-color ceiling a hard limit on how many categories can exist. Requiring text means the color is always redundant reinforcement.

## Risks / Trade-offs

- [Hue-named props age badly if the palette is ever re-themed — a "green" that stops being green makes the API a lie] → Accepted, and bounded: the hues map to role scales that a re-theme would shift together, and the label's job is to differ from its neighbours rather than to be a specific green. Worth revisiting only if the system ever gains a true categorical palette, at which point the prop can gain neutral names without changing the component's contract.
- [Six colors is a ceiling; a set with more members than that will reuse colors] → Acceptable because the text label always identifies the item; a repeated color degrades the at-a-glance grouping but never the meaning. Documented rather than engineered around.
- [Consumers may reach for `Tag` where `Badge` is correct, since solid color is eye-catching] → Mitigated by making the distinction an explicit documentation requirement in the spec, not just a note — the docs page has to state when each applies.
