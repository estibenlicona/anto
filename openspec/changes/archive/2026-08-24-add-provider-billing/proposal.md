## Why

Las personas externas del chapter tienen proveedor y costo mensual, pero nadie cierra el mes: el Chapter Lead arma a mano, por proveedor, qué personas facturan, con qué novedades (días no laborados, ingresos a mitad de mes) y por cuánto. Hace falta un lugar donde ese cierre quede registrado, se apruebe y sirva de respaldo frente a la factura que llega del proveedor.

Mock-first, como el resto del módulo de Capacidad, y con tuip: `Table`, `Card`, `DistributionCard`, `Badge`, `Drawer`, `Input`, `Textarea`, `Menu`, `SegmentedControl`, `Select`.

## What Changes

- **Navegación**: entrada **Facturación** en el grupo "Capacidad" del Chapter Lead (`/app/lead/facturacion`), breadcrumb "Facturación de proveedores"; detalle en `/app/lead/facturacion/:id`.
- **Listado de cierres** (por período): selector de mes (`SegmentedControl` de los últimos meses o `Select`), tres cards (total del mes, proveedores con cierre pendiente, personas externas facturadas) y una tabla con una fila por proveedor: proveedor, personas externas, ajustes, total, estado (`Badge`: Borrador · Aprobado · Sin cierre) y menú ⋮ (Abrir · Aprobar · Reabrir). Único primario: **Generar cierres del mes** (crea en borrador un cierre por cada proveedor con externos).
- **Detalle de un cierre**: encabezado (proveedor, período, estado, total) y tabla de líneas, una por persona externa del proveedor: nombre y cargo, célula, costo mensual, ajuste (monto con signo), nota, total de línea. Acción por línea **Ajustar** (drawer: monto ± y motivo obligatorio: días no laborados · ingreso parcial · retiro · otro) y quitar el ajuste. Pie con subtotal, ajustes y total. Primario **Aprobar cierre** (confirmación); un cierre aprobado es de sólo lectura hasta **Reabrir**.
- **Modelo (mock)**: `Billing { id, providerId, providerName, period: "YYYY-MM", status: Draft|Approved, lines[], subtotal, adjustments, total, approvedAtUtc }`; `BillingLine { personId, personName, position, squadName, monthlyCost, adjustment: { amount, reason, note } | null, total }`. Generar toma las personas externas vigentes del mock de personas (snapshot) y su `monthlyCost`; las líneas quedan congeladas al generar (un cambio de costo después no toca un cierre existente).
- **Monto**: costo mensual fijo por persona externa + ajustes manuales con motivo. No depende de horas ni de dedicación (decisión del usuario).

### Fuera de alcance

- Tarifas por proveedor en Admin; la factura del proveedor como documento; exportar a Excel/PDF; facturación de internos; horas validadas como base.

## Capabilities

### New Capabilities
- `provider-billing`: cierres mensuales por proveedor con líneas por persona externa, ajustes con motivo, aprobación y reapertura.

### Modified Capabilities
- `chapter-lead-shell`: "Navegación lateral del rol Chapter Lead" gana la entrada "Facturación".
- `api-mocking`: handler nuevo de facturación (períodos, generar, detalle, ajustar línea, aprobar/reabrir) que toma externos y costos del snapshot de personas.

## Impact

- Frontend nuevo: `features/billing/{services/billingService.ts, adapters/BillingAdapter.ts, hooks/{useBillingPeriod,useBillingMutations,useBilling}.ts, components/{BillingStatsCards,BillingList,BillingLinesTable,AdjustLineDrawer,ApproveBillingDialog}.tsx, components/adjustmentValidation.ts, BillingContainer.tsx, BillingDetailContainer.tsx}`; páginas `LeadBillingPage`, `LeadBillingDetailPage`; rutas y nav.
- Mocks: `billing.handlers.ts` + `billing.seeds.ts`; `index.ts`. `people.handlers.ts` sin cambios (usa `getPeopleSnapshot`/`getCompaniesSnapshot`); las seeds de personas ganan dos externos más para que haya al menos dos proveedores con gente.
- Specs: `provider-billing` (nueva), `chapter-lead-shell`, `api-mocking`.
- tuip: sin cambios. Brechas anotadas al implementar, ninguna bloqueante: (1) no hay un campo de moneda —el monto del ajuste va en un `Input type="number"` con el prefijo en el `hint` y el formato en pesos sólo al mostrarlo; (2) `Table` no tiene fila de totales —el pie (subtotal/ajustes/total) es un `div` propio bajo la tabla; (3) `Drawer` sólo ofrece `sm`/`lg`.
