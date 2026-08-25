## Context

Ver proposal.md — Why. Estado actual que condiciona el cómo:

- `PersonDto` no tiene stacks; `PeopleStats` trae `activeCount`, `fteAvailable/fteTarget`, `bySeniority`, `sample`. `usePeople` ya maneja `search` + `seniorities` con debounce y vuelta a página 1; `PeopleList` usa `FilterButton` para seniority.
- El detalle de persona (`personDetail.handlers.ts`) sirve `capabilities` desde `CAPABILITIES_BY_PERSON` (seeds) y `PersonCapabilitiesPanel` las pinta con `SeniorityCard hideLabel` + `Badge`.
- tuip ofrece todo lo que hace falta: `Tag` (etiqueta categórica, sin estado), `FilterButton` (multi), `Combobox multiple`, `SegmentedControl`, `Select`, `SeniorityCard`, `AvatarGroup`, `Badge`, `Drawer`, `Card`/`DistributionCard`. No hay "Tag con énfasis".
- Diseño de referencia: canvas "Stacks de Personas" — se adapta, no se calca.

## Goals / Non-Goals

**Goals:**
- Stacks como dato de la persona en el mock de personas (una sola fuente); el detalle y el backlog los leen por snapshot.
- Ninguna pieza nueva de tuip ni composición local que la imite.

**Non-Goals:**
- Mapa stack × personas; alta de stacks al catálogo desde la UI; stacks en el formulario de persona.

## Decisions

1. **Modelo en el mock de personas**: `PersonDto.stacks: { name: string; level: 1|2|3|4; isPrimary: boolean }[]`. El catálogo es una constante (`STACK_CATALOG`) en `people.handlers.ts`, expuesta por `GET /people/stacks`; `PUT /people/:id/stacks` reemplaza la lista (valida catálogo, un único principal, principal obligatorio si hay stacks). `GET /people` acepta `stack` repetido. Las `stats` suman `stackCoverage: { distinct: number; atRisk: string[] }`. Alternativa (tabla aparte de stacks por persona): más endpoints para el mismo dato.

2. **El detalle deriva, no siembra**: `computePersonDetail` reemplaza `CAPABILITIES_BY_PERSON` por los `stacks` de la persona, y por cada uno cuenta quiénes más lo tienen (`getPeopleSnapshot`), devolviendo `otherCoverers` y `coverers: {id,name}[]` (hasta 3). El DTO `PersonCapabilityDto` pasa a `PersonStackDto` (`name`, `level`, `isPrimary`, `otherCoverers`, `coverers`); el adapter conserva `busFactorOne`. Se borran `CAPABILITIES_BY_PERSON` y `defaultCapabilityFor` de las seeds.

3. **Cómo se dibuja con tuip (adaptaciones al canvas)**:
   - Chips de stack → `Tag` gris; el **principal** va primero y no lleva énfasis propio (Tag no lo admite; un color categórico mentiría); el riesgo de cobertura **no** se pinta en la fila (el canvas lo ponía en rojo): vive en la card de cobertura y en el detalle, donde hay contexto. Más de tres → `Tag` "+N".
   - Filtro → `FilterButton label="Stack"`, multi; sin fila de chips removibles (FilterButton ya muestra la selección).
   - Card de cobertura → `Card` con `text-metric` como las demás; los stacks en riesgo como `Badge variant="warning"` en fila.
   - Nivel por stack en el detalle → `SeniorityCard level={nombre del nivel} density="compact"` (con etiqueta) — la escala es la misma.
   - Quiénes lo cubren → `AvatarGroup max={3}` con `Avatar size="small"` + "N más lo cubren".
   - Drawer: `Combobox multiple` (label "Agregar del catálogo") cuyo `value` son los nombres ya presentes — elegir uno lo agrega con nivel Competente; `SegmentedControl` por fila con las cuatro opciones cortas (Princ. · Comp. · Avanz. · Exp. como `label`, nombre completo en `aria`); `Select` "Stack principal" al pie de la lista; quitar con `Button variant="subtle"` + `Icon close`; aviso con `Alert variant="warning"` inline listando los stacks que quedarían sin cobertura.
   - La columna **Rol** sale de `PeopleList` (y de su test); `ROLE` se mantiene en DTO/formulario/detalle.

4. **Estado y hooks**: `usePeople` gana `stacks`/`setStacks` (mismo patrón que seniorities, vuelve a página 1); `useStackCatalog()` (una vez); `usePersonStacksMutation()` con `MutationResult`. El drawer vive en `PersonDetailContainer` (como los demás) y al guardar refetchea el detalle y avisa por toast; el listado se refetchea solo al volver (no comparte estado).

5. **Validación pura** en `components/detail/stacksValidation.ts`: principal único y obligatorio; niveles 1–4; sin duplicados. El aviso de cobertura se calcula con `otherCoverers === 0` de los stacks actuales del detalle (no necesita llamada extra).

6. **Backlog y control-tower** no cambian: el backlog usa cargos, no stacks, para sugerir; queda anotado como mejora futura (sugerir por stack principal).

## Risks / Trade-offs

- [`Tag` sin énfasis para el principal] → el orden lo comunica y la leyenda del detalle lo nombra; si se pide más, la brecha de tuip sería un `Tag emphasis`, no un color.
- [Quitar la columna Rol toca tests existentes del listado] → se actualizan en el mismo change; Rol sigue en el formulario y el detalle.
- [La card de FTE disponible desaparece del resumen] → la Torre de control ya muestra el FTE del chapter; es donde se mira.
- [Seeds de stacks inventadas] → un bloque comentado en `people.handlers.ts`; los tests prueban reglas (filtro, PUT, cobertura), no cifras.

## Migration Plan

1. Mock (DTO, seeds, catálogo, filtro, PUT, stats, detalle derivado) + tests. 2. Servicio/adapters/hooks. 3. Listado + card + tests. 4. Panel Stacks + drawer + container + tests. 5. Verificación (suite, typecheck, lint, navegador).
