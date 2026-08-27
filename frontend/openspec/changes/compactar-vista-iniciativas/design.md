## Context

`InitiativesContainer` apila hoy sus bloques con `gap-6`, empezando por un encabezado inline (no hay componente `InitiativesHeader`): `h1` "Iniciativas", párrafo de descripción y, a la derecha, el `Button` primario "Nueva iniciativa" a tamaño normal. `LeadInitiativesPage` es un one-liner sin `h1` propio, así que el único encabezado de nivel 1 de la pantalla es el visible. `InitiativesStatsCards` pinta un grid `gap-4` con tres cards: la de activas (con la escala de tallas) y dos `Metric` genéricas (`label` / cifra / `foot`) cuyos pies son frases explicativas.

El mecanismo del shell ya existe y está especificado en `lead-shell-page-actions`: `useLeadBreadcrumbActions(node)` publica un `ReactNode` en la franja del breadcrumb mientras el componente está montado y lo limpia al desmontar; fuera del provider es un no-op. Ausencias, backlog y facturación ya lo consumen; este change lo consume igual y no lo toca. Ver proposal.md — Why.

Diferencia con ausencias: aquí sube un solo botón, no un bloque de dos controles, así que es el caso más simple del patrón (el mismo que células y personas).

## Goals / Non-Goals

**Goals:**
- Recuperar el alto del encabezado para las cards y la tabla, sin perder la acción de crear.
- Dejar un único `h1`, `sr-only`, coincidente con el breadcrumb.
- Misma disposición, mismo tamaño de botón y mismo espaciado (`gap-3`) que ausencias y células, para que las vistas de listado del chapter lead se lean igual.
- Que los pies de las cards digan un dato y no una explicación.

**Non-Goals:**
- Tocar el shell (`LeadBreadcrumbContext`, layout del chapter lead).
- Tocar `InitiativesList`, `InitiativeFormDrawer`, `StatusConfirmDialog`, hooks, servicio, adaptador o mocks.
- La pantalla de evaluación y su `EvaluationHeader`.
- Extraer un componente compartido de "listado de módulo" a partir de las pantallas que ya siguen el patrón.

## Decisions

**1. El botón se publica solo, sin envoltorio, y pasa a `size="small"`.**
`useLeadBreadcrumbActions` acepta cualquier `ReactNode`; con un único control no hace falta el `div flex gap-2` que usa ausencias para agrupar navegador + botón. Se conserva el icono `plus`, bajado a 16 como en "Registrar ausencia" (icono a 16 con botón small). Alternativa descartada: dejar el botón como fila propia sobre las cards, alineado a la derecha — gasta justo la fila que este change quiere recuperar y deja iniciativas distinta de las demás.

**2. El encabezado se borra inline; no hay componente que eliminar.**
A diferencia de ausencias (`AbsencesHeader` → `AbsencesMonthNav`), aquí no sobrevive ningún control aparte del botón, así que se retira el `div` completo del JSX y se deja el comentario habitual ("Sin encabezado de módulo: el nombre de la pantalla ya lo da el breadcrumb…") junto al `useLeadBreadcrumbActions`, como en los otros contenedores.

**3. `LeadInitiativesPage` pasa de one-liner a `div` con `h1` `sr-only` "Gestionar Iniciativas".**
Mismo patrón y mismo comentario que `LeadAbsencesPage`. El texto es el del breadcrumb definido en `chapter-lead-shell` ("Plataforma / Gestionar Iniciativas"). Se añade `LeadInitiativesPage.test.tsx` que afirme que es único y `sr-only`; espera a que cargue el listado (`findByText` de una iniciativa semilla, p. ej. "Kafka Migration") para no dejar peticiones a medias.

**4. `Metric` conserva `foot: string`; cada card arma su referencia con datos.**
Lo más simple es mantener `Metric` tal cual y pasarle desde `InitiativesStatsCards` el texto ya armado a partir de `stats.active` y `stats.total`, con la concordancia resuelta en el mismo sitio ("FTE de N activas" / "FTE de 1 activa", "de N iniciativas" / "de 1 iniciativa"). La unidad "FTE" deja de ir como sufijo pegado a la cifra y baja al pie, igual que en la card de impacto de ausencias: arriba la cifra sola, abajo lo que la hace legible, y los tres pies quedan a la misma altura. Alternativa descartada: quitar los pies sin reemplazo — la card de activas seguiría con pie y las otras dos quedarían con hueco o más bajas; el grid de tres perdería la anatomía común.

**5. `gap-3` como única medida de separación.**
Contenedor raíz `gap-6` → `gap-3` y grid de cards `gap-4` → `gap-3`, la misma regla que `absences-month-view` y `squads-list`. El `gap-5` interior de la card de activas (entre la cifra y la escala de tallas) y el `gap-1` de cada columna de talla son anatomía interna de una card, no separación entre piezas de la vista, y no cambian. El `py` de la franja y del `<main>` es del shell y no cambia.

**6. Los tests del contenedor montan `LeadBreadcrumbProvider` con una sonda que pinta `actions`.**
No es opcional: el primer test de `InitiativeContainers.test.tsx` hace clic en "Nueva iniciativa", que pasa a vivir en lo publicado. Sin la sonda el botón no se renderiza y el test falla. Se replica `BreadcrumbActionsProbe` de `AbsencesContainer.test.tsx` dentro de `renderAt`; `renderEvaluation` no lo necesita (la evaluación publica `trailing`, no `actions`, y ya funciona sin provider).

## Risks / Trade-offs

- [Quitar los pies explicativos deja sin decir que sólo las activas cuentan como demanda] → Aceptado: es la decisión del usuario para toda la app (sin textos tipo tutorial). El rótulo "FTE DEMANDADO" y el pie "FTE de N activas" siguen atando la cifra a las activas.
- [`getByText("de 7 iniciativas")` en `InitiativesComponents.test.tsx` encontraría dos nodos] → Se ajusta el test a `getAllByText` con longitud 2 (o se acota con `within` a cada card), y se añaden los asserts de los pies nuevos.
- [Cuarta copia del patrón botón-en-franja (células, personas, ausencias, ahora iniciativas)] → Sigue siendo una línea por contenedor; más barata que una abstracción. Si alguien la extrae después, este contenedor es un consumidor más.
- [La spec archivada `initiatives` del `openspec/` raíz sigue describiendo el encabezado] → Está fuera de este planning home; se deja anotado en el proposal para conciliarla aparte, como se hizo con ausencias.
