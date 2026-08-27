## Why

La vista de personas (`/app/lead/personas`) abre con un encabezado de módulo —título "Personas" y la línea "Perfiles y seniority del equipo"— que repite lo que el shell ya dice: el breadcrumb muestra "Gestionar Personas" y la entrada del menú lateral queda activa. Ese bloque, más un `gap-6` entre encabezado, cards de resumen y tabla, empuja el listado hacia abajo y en el primer pantallazo entran menos filas de las que podrían. Es la misma compactación que ya se aplicó a células (`compactar-vista-celulas`), que dejó el mecanismo del shell listo y esta réplica anotada como change corto aparte.

## What Changes

- Se retira el encabezado visible del módulo (título "Personas" y descripción). Las cards de resumen pasan a ser lo primero que se ve en el contenido.
- La acción "Nueva persona" sube a la franja del breadcrumb del shell, alineada a la derecha y a la misma altura que el breadcrumb, usando el mecanismo `useLeadBreadcrumbActions` que ya existe. El estado vacío inicial ("Todavía no hay personas") conserva su propio botón, como hoy.
- Con el `h1` visible "Personas" fuera, el `h1` `sr-only` "Gestionar Personas" que ya tiene `LeadPeoplePage` queda como el único encabezado de nivel 1 de la pantalla (hoy hay dos, y el visible no coincide con el breadcrumb).
- El espaciado vertical entre bloques del contenido (resumen → listado) baja de `gap-6` a `gap-2`, igual que en células.

## Capabilities

### New Capabilities
- `people-list`: disposición de la vista de listado de personas — qué bloques la componen, en qué orden, dónde vive la acción de crear y cómo se mantiene el encabezado accesible sin título visible.

### Modified Capabilities
<!-- Ninguna. `lead-shell-page-actions` ya describe el mecanismo de la franja del
     breadcrumb y no cambia: esta vista sólo lo usa. -->

## Impact

- `src/features/people/PeopleContainer.tsx`: deja de montar `PeopleHeader`; publica el botón "Nueva persona" con `useLeadBreadcrumbActions`; `gap-6` → `gap-2` en la raíz.
- `src/features/people/components/PeopleHeader.tsx`: se elimina (sin otros consumidores; grep confirma que sólo lo usa `PeopleContainer`).
- `src/pages/LeadPeoplePage/LeadPeoplePage.tsx`: sin cambios de código; se documenta que su `h1` `sr-only` pasa a ser el único de la pantalla. Se añade un test de página que lo afirme (hoy no existe `LeadPeoplePage.test.tsx`).
- Tests: `PeopleContainer.test.tsx` (envolver el render con `LeadBreadcrumbProvider` + sonda de `actions`; sustituir los asserts del encabezado visible).
- No se toca el shell (`LeadBreadcrumbContext`, `ChapterLeadLayout`) ni `PeopleList`, ni ningún servicio, hook de datos, adaptador o contrato con el backend.
- Fuera de alcance: el detalle de persona, el plan de carrera y otros módulos con encabezado propio.
