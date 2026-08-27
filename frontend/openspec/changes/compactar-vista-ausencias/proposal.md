## Why

La vista de ausencias (`/app/lead/ausencias`) abre con un encabezado de módulo —título "Ausencias" y dos líneas de descripción— que repite lo que el shell ya dice: el breadcrumb muestra "Gestionar Ausencias" y la entrada del menú lateral queda activa. Ese bloque, más un `gap-6` entre encabezado, resumen y tabla, empuja el listado hacia abajo. Es la tercera y última pantalla de listado del chapter lead que conserva encabezado propio, después de `compactar-vista-celulas` y `compactar-vista-personas`; dejarla como está rompe la consistencia de los tres módulos de Capacidad.

## What Changes

- Se retira el encabezado visible del módulo (título "Ausencias" y su descripción). Las cards de resumen pasan a ser lo primero que se ve en el contenido.
- El navegador de mes (mes anterior / título del mes / mes siguiente) **y** la acción "Registrar ausencia" suben juntos a la franja del breadcrumb del shell, alineados a la derecha y a la misma altura que el breadcrumb, con el mecanismo `useLeadBreadcrumbActions` que ya existe. El navegador queda a la izquierda del botón, en el mismo orden que hoy.
- Se retira el `Alert` informativo del pie ("La ausencia se registra una sola vez, acá…"). Decisión del usuario al proponer el change: el aviso sobre factura y ajuste de capacidad deja de mostrarse en esta vista.
- Se retira el pie de la card "Impacto en capacidad" ("Sólo cuentan las ausencias aprobadas. La célula que más pierde es …"). Decisión del usuario al proponer el change. Se retira la línea entera, incluida su variante para meses sin nada aprobado ("Ninguna ausencia aprobada este mes descuenta capacidad."): dejar sólo esa rama haría aparecer el pie justo en el mes en que menos aporta.
- La página gana un `h1` `sr-only` "Gestionar Ausencias" —hoy `LeadAbsencesPage` no envuelve nada y el único `h1` es el visible del encabezado—, siguiendo el patrón de `LeadPeoplePage` y `LeadSquadsPage`.
- El espaciado vertical entre bloques del contenido baja de `gap-6` a `gap-2`, igual que en células y personas.

## Capabilities

### New Capabilities
- `absences-month-view`: disposición de la vista mensual de ausencias — qué bloques la componen, en qué orden, dónde viven el navegador de mes y la acción de registrar, y cómo se mantiene el encabezado accesible sin título visible.

### Modified Capabilities
<!-- Ninguna. `lead-shell-page-actions` ya describe la franja del breadcrumb y no
     cambia: esta vista sólo la usa, publicando un bloque con dos controles en
     vez de un solo botón, que es algo que la spec ya admite. -->

## Impact

- `src/features/absences/AbsencesContainer.tsx`: deja de montar `AbsencesHeader`; publica navegador + botón con `useLeadBreadcrumbActions`; `gap-6` → `gap-2`; se elimina el `Alert` del pie.
- `src/features/absences/components/AbsencesHeader.tsx`: se elimina; el navegador de mes se conserva como componente propio para poder publicarlo (`AbsencesMonthNav` o equivalente), sin el título ni la descripción.
- `src/features/absences/components/AbsencesStatsCards.tsx`: la card de impacto pierde su línea de pie; las otras dos cards no cambian.
- `src/pages/LeadAbsencesPage/LeadAbsencesPage.tsx`: pasa de un one-liner a un `div` con `h1` `sr-only` "Gestionar Ausencias" más el contenedor.
- Tests: `AbsencesContainer.test.tsx` (el assert del `heading` "Ausencias" desaparece; los clics de "Mes anterior"/"Mes siguiente" pasan a buscar los botones publicados, así que el render necesita el provider del shell y una sonda; se retira el test del aviso del alcance). Nuevo `LeadAbsencesPage.test.tsx`. `AbsencesStatsCards.test.tsx` pierde los asserts del pie de la card de impacto.
- No se toca el shell (`LeadBreadcrumbContext`, `ChapterLeadLayout`), ni `AbsencesTable`, los drawers, los hooks, el servicio ni el contrato con el backend. El mes sigue viviendo en `?mes=YYYY-MM`.
- Fuera de alcance: el resto de pantallas del lead sin encabezado propio (Backlog, Facturación, Competencias) y cualquier cambio en el flujo de aprobación/rechazo.
