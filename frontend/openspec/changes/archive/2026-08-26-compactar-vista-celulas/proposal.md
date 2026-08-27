## Why

La vista de células (`/app/lead/celulas`) abre con un encabezado de módulo —título "Células" y una línea descriptiva— que repite lo que el shell ya dice: el breadcrumb muestra "Gestionar Células" y la entrada del menú lateral queda activa. Ese bloque, sumado a un `gap-6` entre encabezado, cards de resumen y tabla, empuja la tabla hacia abajo y en el primer pantallazo entran menos filas de las que podrían. La pantalla es de consulta frecuente: cuanto más listado quepa sin scroll, mejor.

## What Changes

- Se retira el encabezado visible del módulo (título "Células" y descripción). Las cards de resumen pasan a ser lo primero que se ve en el contenido.
- La acción "Nueva célula" sube a la franja del breadcrumb del shell, alineada a la derecha y a la misma altura que el breadcrumb. El estado vacío inicial ("Todavía no hay células") conserva su propio botón, como hoy.
- El shell del chapter lead gana un mecanismo para que una pantalla publique acciones en la franja del breadcrumb (mismo modelo con el que hoy una pantalla de detalle publica su nombre como último nivel). La franja renderiza esas acciones a la derecha; sin acciones publicadas, se ve como hoy.
- La página conserva un `h1` sólo para lectores de pantalla con el mismo texto que el breadcrumb ("Gestionar Células"), siguiendo el patrón ya usado en `LeadPeoplePage`.
- El espaciado vertical entre bloques del contenido (resumen → listado) baja de `gap-6` a `gap-4`, para una vista más compacta.

## Capabilities

### New Capabilities
- `lead-shell-page-actions`: la franja del breadcrumb del shell del chapter lead admite acciones publicadas por la pantalla activa, alineadas a la derecha, que desaparecen al salir de esa pantalla.
- `squads-list`: disposición de la vista de listado de células — qué bloques la componen, en qué orden, dónde vive la acción de crear y cómo se mantiene el encabezado accesible sin título visible.

### Modified Capabilities
<!-- No hay specs previas en openspec/specs; nada que modificar. -->

## Impact

- `src/features/chapter-lead-shell/LeadBreadcrumbContext.tsx`: el contexto pasa a llevar también `actions`; nuevo hook para publicarlas.
- `src/layouts/ChapterLeadLayout/ChapterLeadLayout.tsx`: la franja del breadcrumb pasa a ser breadcrumb a la izquierda + acciones a la derecha.
- `src/features/squads/SquadsContainer.tsx`: deja de montar `SquadsHeader`; publica el botón "Nueva célula" en la franja; espaciado raíz.
- `src/features/squads/components/SquadsHeader.tsx`: se elimina (sin otros consumidores).
- `src/pages/LeadSquadsPage/LeadSquadsPage.tsx`: `h1` sr-only "Gestionar Células".
- Tests: `ChapterLeadLayout.test.tsx` (acciones en la franja), `SquadsContainer.test.tsx` (asserts sobre el encabezado; necesita el provider del shell para ver el botón).
- No se toca `SquadsList`, ningún servicio, hook de datos, adaptador ni contrato con el backend.
- Fuera de alcance: el módulo de Personas tiene el mismo encabezado (`PeopleHeader`); con el mecanismo del shell ya hecho, replicarlo es un change corto aparte.
