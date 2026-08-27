## Why

La vista de facturación (`/app/lead/facturacion`) abre con un encabezado de módulo —título "Prefacturas", una descripción de dos líneas y, pegado al título, el `Select` de "Período" con su etiqueta encima— que repite lo que el shell ya dice: el breadcrumb muestra "Prefacturación" y la entrada del menú queda activa. Ese bloque, más un `gap-6` entre encabezado, cards y tabla, empuja el listado hacia abajo. Es la réplica del patrón ya aplicado en Células, Personas, Ausencias y Competencias (`compactar-vista-*`); dejarla como está rompe la consistencia entre las pantallas del lead.

El selector de período, además, está mal resuelto: es un campo de formulario (etiqueta arriba, caja de 192px, altura media) colgado con `items-end` al lado de un `h1`, así que la etiqueta flota a media altura, la caja no alinea con nada y el conjunto se lee como un formulario de una sola pregunta. Y es un control de otra clase que el filtro de proveedor de la tabla: no acota el listado, decide de qué mes es **todo** lo que la pantalla muestra, cards incluidas. Ausencias resuelve exactamente ese mismo caso con un navegador de mes (mes anterior / mes visible / mes siguiente) en la franja del breadcrumb; Facturación debe leerse igual.

## What Changes

- Se retira el encabezado visible del módulo (título "Prefacturas" y su descripción). Las cards de resumen pasan a ser lo primero que se ve en el contenido.
- El `Select` de "Período" se reemplaza por un **navegador de mes** (mes anterior / mes visible / mes siguiente), el mismo control que usa Ausencias, y sube a la **franja del breadcrumb** del shell junto con las dos acciones de la pantalla ("Generar el esperado del mes" y "Registrar prefactura"), alineados a la derecha y a la altura del breadcrumb, con `useLeadBreadcrumbActions`. Orden de izquierda a derecha: navegador, acción secundaria, acción primaria.
- El navegador queda **acotado al rango que hoy ofrece el `Select`**: el mes en curso y los cinco anteriores. "Mes siguiente" se deshabilita en el mes en curso (no hay prefacturas de meses futuros) y "Mes anterior" en el más viejo del rango. No cambia qué meses se pueden ver, sólo cómo se llega a ellos.
- El mes visible se sigue leyendo en el navegador con nombre y año ("Agosto 2026"), y las cards siguen nombrándolo ("Prefacturas · agosto 2026"), así que retirar la etiqueta "Período" no deja el mes sin nombrar.
- El mes visible sigue viviendo en `?period=YYYY-MM` (sin parámetro para el mes en curso): un enlace compartido abre el mismo mes, igual que hoy.
- Los dos botones pasan a `size="small"` con icono a 16, como en el resto de pantallas compactadas. Conservan su lógica de habilitado (sin esperado por generar / sin prefactura por registrar) y su comportamiento.
- La página gana un `h1` `sr-only` "Prefacturación" —hoy `LeadBillingPage` es un one-liner y el único `h1` es el visible del encabezado—, siguiendo el patrón de `LeadPeoplePage` y `LeadSquadsPage`.
- El espaciado entre bloques del contenido baja de `gap-6` a `gap-3`, y el grid de cards de `gap-4` a `gap-3`, para que toda la pantalla use un solo ritmo.
- La tabla gana búsqueda (persona, proveedor o célula) en la barra y paginación en el pie, en cliente sobre las filas del período, como ya exige `list-table-frame` para Facturación.
- El navegador de mes de Ausencias (`AbsencesMonthNav`) se generaliza en un componente compartido (`MonthNav`) para que Facturación no lo copie; Ausencias no cambia de comportamiento ni de aspecto.

## Capabilities

### New Capabilities
- `billing-period-view`: disposición de la vista de facturación (prefacturas del período) — qué bloques la componen, en qué orden, dónde viven el navegador de período y las dos acciones, qué rango de meses admite el navegador y cómo se mantiene el encabezado accesible sin título visible.

### Modified Capabilities
<!-- Ninguna. `lead-shell-page-actions` ya describe la franja del breadcrumb y no
     cambia: esta vista sólo la usa, publicando un bloque con tres controles,
     que es algo que la spec ya admite ("las acciones que la pantalla publique").
     `list-table-frame` tampoco cambia: la barra de filtro por proveedor de la
     tabla queda como está. -->

## Impact

- `src/features/billing/BillingContainer.tsx`: deja de renderizar el encabezado (título, descripción, `Select` de período y fila de botones); publica navegador + dos botones con `useLeadBreadcrumbActions`; `gap-6` → `gap-2`. La lectura de `?period=` y `onPeriodChange` se conservan; el navegador los alimenta con `shiftMonth`-equivalente sobre `YYYY-MM`.
- `src/features/billing/adapters/BillingAdapter.ts`: se añade un helper para el título del navegador con inicial mayúscula (`periodLabel` sigue en minúscula porque las cards lo usan a mitad de frase) y, si hace falta, uno para saltar un mes. `availablePeriods` se conserva: define el rango del navegador.
- `src/shared/components/MonthNav.tsx` (nuevo): navegador de mes compartido, extraído de `AbsencesMonthNav`, con `previousDisabled`/`nextDisabled` opcionales.
- `src/features/absences/components/AbsencesMonthNav.tsx`: pasa a delegar en `MonthNav` conservando su firma; sus consumidores y tests no cambian.
- `src/pages/LeadBillingPage/LeadBillingPage.tsx`: pasa de one-liner a `div` con `h1` `sr-only` "Prefacturación" más el contenedor.
- Tests: `BillingContainers.test.tsx` (el render del listado necesita `LeadBreadcrumbProvider` y una sonda que pinte `actions`, porque "Generar el esperado del mes" pasa a vivir ahí; el test "el período se lee en el encabezado" se reemplaza por uno del navegador en la franja; el de "sigue al mes en curso" pasa a leer el título del navegador; se añaden los de cambio de mes vía navegador y de los extremos deshabilitados). Nuevo `LeadBillingPage.test.tsx`. Nuevo `MonthNav.test.tsx` en `src/shared/components/__test__/`.
- No se toca el shell (`LeadBreadcrumbContext`, `ChapterLeadLayout`), ni `BillingList`, `BillingStatsCards`, los drawers, el diálogo de decisión, los hooks, el servicio ni el contrato con el backend (`GET …?period=`).
- Fuera de alcance: el detalle de una prefactura (`/app/lead/facturacion/:id`), el filtro por proveedor de la tabla y cualquier cambio en el flujo de generar/registrar/aprobar/objetar.
