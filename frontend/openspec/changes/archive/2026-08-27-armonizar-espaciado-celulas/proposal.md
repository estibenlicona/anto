## Why

La vista de células (`/app/lead/celulas`) mezcla hoy dos medidas de separación: 8px (`gap-2`) entre el resumen y el listado, y 16px (`gap-4`) entre las cards del resumen. Ausencias ya resolvió esa mezcla en `compactar-vista-ausencias` unificando todo a 12px (`gap-3`), y su design dejó anotado que replicarlo en células era un ajuste aparte porque la spec archivada de células fija los 8px. Ese ajuste es este change: los módulos de Capacidad deben leerse igual, y hoy células se ve más apretada entre bloques y más suelta entre cards que ausencias.

## What Changes

- La separación vertical entre los bloques del contenido de la vista de células (resumen → listado) sube de 8px (`gap-2`) a 12px (`gap-3`).
- La separación entre las tres cards del resumen baja de 16px (`gap-4`) a 12px (`gap-3`).
- Toda la vista queda con una única medida de separación, la misma que ausencias.
- No cambia nada más: ni la franja del breadcrumb, ni el contenido de las cards, ni la tabla, ni las columnas del grid del resumen (`sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1.2fr]`).

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `squads-list`: el requisito "La vista usa un espaciado vertical compacto" (8px entre resumen y listado) se reemplaza por "La vista usa una única medida de separación" (12px entre bloques y entre cards), con la misma redacción que `absences-month-view`.

## Impact

- `src/features/squads/SquadsContainer.tsx`: contenedor raíz `gap-2` → `gap-3`.
- `src/features/squads/components/SquadsStatsCards.tsx`: grid del resumen `gap-4` → `gap-3`.
- Tests: ninguno afirma hoy sobre esas clases (`SquadsStatsCards.test.tsx` sólo consulta `.gap-hug`, que es interno de `DistributionCard`). Se añaden asserts mínimos sobre las clases de separación para que el requisito quede cubierto, como corresponde a un requisito de spec.
- No se toca el shell, `SquadsList`, los drawers, hooks, servicios ni el contrato con el backend.
- Fuera de alcance, por decisión de este change: el detalle de célula (`SquadDetailContainer`, `gap-6` entre encabezado, cards y pestañas; `SquadTeamStatsCards`, `gap-4` entre cards). Su anatomía —encabezado con `h1` visible, cards y pestañas— no tiene equivalente en ausencias y comparte la medida `gap-6` con el detalle de persona y la Torre de control; armonizarlo sería otra regla para las pantallas de detalle, no ésta. También fuera: el listado de Personas (`PeopleContainer`), que sigue en 8px + 16px y cuya spec `people-list` fija los 8px; es el mismo ajuste de dos líneas y puede ir en un change gemelo.
