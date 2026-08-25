## Context

`SegmentedBar` vive en `progress.tsx`, junto a `Progress`. Hoy `SegmentedBarSegment.role` es obligatorio y solo acepta los 4 roles de estado (`roleClasses`). El vocabulario categórico (`CategoricalColor`, `gray`/`green`/`blue`/`amber`/`red`/`purple`) ya existe en `@/lib/categorical-color.ts` y ya lo consumen `Avatar` y `Tag` con el mismo patrón: un `Record<CategoricalColor, string>` de clases escritas literal. Ver proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Un segmento puede colorearse por rol de estado o por color categórico, mutuamente excluyentes.
- Mismo tratamiento visual (`bg-*-bold`) que ya usa `Avatar` para su fill sólido, para que un segmento categórico y un `Avatar`/`Tag` del mismo color se vean consistentes entre sí.

**Non-Goals:**
- No se migra el uso existente de `role` a `color` en ningún consumidor actual — ambos vocabularios coexisten indefinidamente, cada uno para su caso de uso (estado vs. categoría).
- No se cambia `Progress` (la barra de un solo valor) — solo `SegmentedBar`.

## Decisions

**`role` y `color` como campos separados y opcionales, no una unión discriminada por tag explícito**: `SegmentedBarSegment` pasa a tener `role?: SegmentedBarRole` y `color?: CategoricalColor`, ambos opcionales. En runtime, si `color` está presente se usa ese; si no, se usa `role`; si no se especifica ninguno, es un error de tipos de TypeScript (al menos uno de los dos debe declararse) resuelto con una unión de dos formas: `{ role: SegmentedBarRole; color?: never }` | `{ role?: never; color: CategoricalColor }`. Esto evita en tiempo de compilación el caso ambiguo "ambos a la vez" que describe el spec, sin necesitar una validación en runtime que solo se dispararía en desarrollo.

**Reutilizar el `Record<CategoricalColor, string>` de `avatar.tsx`, no importarlo**: cada componente ya declara su propio mapa literal (misma razón documentada en `avatar.tsx`: Tailwind necesita el nombre completo de la clase en el código fuente de cada archivo, un mapa compartido importado desde otro módulo igual requiere que la clase completa aparezca en texto en ese módulo). `progress.tsx` declara su propio `categoricalColorClasses: Record<CategoricalColor, string>` con las mismas seis clases `bg-*-bold` que ya usa `avatar.tsx`.

## Risks / Trade-offs

- [Confusión entre `role` y `color` para un consumidor nuevo] → Mitigado por el tipo discriminado (TypeScript obliga a elegir uno) y por la doc del componente, que muestra un ejemplo de cada uso.
