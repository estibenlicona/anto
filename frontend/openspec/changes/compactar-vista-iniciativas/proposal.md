## Why

La vista de iniciativas (`/app/lead/iniciativas`) es la única pantalla de listado del chapter lead que conserva encabezado de módulo propio: un título "Iniciativas", una descripción de dos líneas que explica qué es una iniciativa y qué cuenta como demanda, y el botón "Nueva iniciativa" en esa misma fila. Células, personas, ausencias, backlog y facturación ya retiraron ese bloque (`compactar-vista-celulas`, `compactar-vista-personas`, `compactar-vista-ausencias`) y suben su acción a la franja del breadcrumb del shell; iniciativas repite lo que el breadcrumb ya dice ("Gestionar Iniciativas") y empuja las cards y la tabla una fila hacia abajo. Además mezcla dos medidas de separación —24px (`gap-6`) entre bloques y 16px (`gap-4`) entre cards— cuando las demás vistas ya unificaron todo a 12px (`gap-3`).

## What Changes

- Se retira el encabezado visible del módulo: título "Iniciativas" y descripción "Las solicitudes del negocio y la capacidad que requieren. Sólo las activas cuentan como demanda.". Las cards de resumen pasan a ser lo primero que se ve en el contenido, y la tabla va inmediatamente después.
- El botón primario "Nueva iniciativa" sube a la franja del breadcrumb del shell, alineado a la derecha y a la altura del breadcrumb, con el mecanismo `useLeadBreadcrumbActions` que ya existe; pasa a `size="small"` como en las demás pantallas.
- Se retiran los pies explicativos de las cards "FTE DEMANDADO" ("FTE esperado que suman las iniciativas activas.") y "SIN EVALUAR" ("Sin talla no entran a la demanda."). Son prosa que explica la pantalla, del mismo tipo que se retiró en ausencias. En su lugar cada pie lleva una referencia con datos, como las cards hermanas: la unidad con el conteo de activas en la primera ("FTE de N activas") y la relación con el total en la segunda ("de N iniciativas"). Decisión tomada al proponer el change en línea con lo pedido —sin textos descriptivos tipo tutorial—; si se prefiere conservar esos pies, es el único punto que se retira sin afectar al resto.
- La página gana un `h1` `sr-only` "Gestionar Iniciativas" —hoy `LeadInitiativesPage` es un one-liner y el único `h1` es el visible del encabezado—, siguiendo el patrón de `LeadAbsencesPage`, `LeadPeoplePage` y `LeadSquadsPage`.
- Toda la vista queda con una única medida de separación de 12px (`gap-3`): el contenedor pasa de `gap-6` a `gap-3` y el grid de cards de `gap-4` a `gap-3`, igual que ausencias y células.

### Fuera de alcance

- La pantalla de evaluación de una iniciativa (`InitiativeEvaluationContainer`, `EvaluationHeader`): tiene encabezado propio con nombre, estado y resultado en vivo, que es contenido, no un título de módulo; su `gap-5` es de una pantalla de detalle, como el detalle de célula o de persona.
- Los estados vacíos del listado ("Todavía no hay iniciativas", "Sin resultados") y sus descripciones: ausencias conservó los suyos y aquí orientan una acción, no explican la pantalla.
- El drawer de alta/edición, el diálogo de cambio de estado, hooks, servicio, adaptador y mocks.

## Capabilities

### New Capabilities
- `initiatives-list-view`: disposición de la vista de listado de iniciativas — qué bloques la componen y en qué orden, dónde vive la acción de crear, cómo se mantiene el encabezado accesible sin título visible, qué dicen los pies de las cards de resumen y la única medida de separación de la vista. Mismo corte que `absences-month-view` y `squads-list`.

### Modified Capabilities
<!-- Ninguna en este planning home. `lead-shell-page-actions` ya describe la
     franja del breadcrumb y no cambia: esta vista sólo la usa. -->

## Impact

- `src/features/initiatives/InitiativesContainer.tsx`: deja de renderizar el bloque de título + descripción + botón; publica el botón con `useLeadBreadcrumbActions`; `gap-6` → `gap-3`.
- `src/features/initiatives/components/InitiativesStatsCards.tsx`: grid `gap-4` → `gap-3`; las dos cards `Metric` cambian su pie por la referencia con datos (el componente `Metric` gana el dato que necesita cada pie).
- `src/pages/LeadInitiativesPage/LeadInitiativesPage.tsx`: pasa de one-liner a `div` con `h1` `sr-only` "Gestionar Iniciativas" más el contenedor. Nuevo `LeadInitiativesPage.test.tsx`.
- Tests: `InitiativeContainers.test.tsx` hace clic en "Nueva iniciativa", que pasa a vivir en lo publicado, así que `renderAt` necesita `LeadBreadcrumbProvider` y una sonda que pinte `actions` (mismo patrón que `AbsencesContainer.test.tsx`). `InitiativesComponents.test.tsx` afirma hoy `getByText("de 7 iniciativas")`, que con el nuevo pie de "SIN EVALUAR" aparecería dos veces; se ajusta y se añaden asserts sobre los nuevos pies y las clases de separación.
- No se toca el shell (`LeadBreadcrumbContext`, layout del chapter lead), ni `InitiativesList`, ni el drawer, el diálogo, los hooks, el servicio ni el contrato con el backend.
- Nota de specs: la spec archivada `initiatives` del `openspec/` raíz del repo (fuera de este planning home) todavía describe "un encabezado con el título 'Iniciativas', su descripción y el botón"; queda superada por `initiatives-list-view` en lo que a disposición se refiere, igual que pasó con ausencias. Conciliarla es un ajuste documental aparte.
