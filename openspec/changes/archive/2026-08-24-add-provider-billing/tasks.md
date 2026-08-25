## 1. Mock y contrato

- [x] 1.1 `features/billing/services/billingService.ts`: `BillingDto`, `BillingLineDto`, `BillingStatus`, `AdjustmentReason`, `BillingPeriodRowDto { providerId, providerName, externalCount, billing | null }`; `listPeriod(period)`, `generate(period)`, `get(id)`, `adjustLine(id, personId, adj)`, `removeAdjustment(id, personId)`, `setStatus(id, status)`.
- [x] 1.2 `people.handlers.ts` seeds: Andrés → TATA, Paula → GFT (externos).
- [x] 1.3 `mocks/handlers/billing.{seeds,handlers}.ts`: generar desde snapshots, ajustes, estado, totales en el handler, `getBillingSnapshot`, `resetBillingMock`; registrar en `index.ts`.
- [x] 1.4 Tests del handler: listar período (null donde no hay cierre), generar idempotente, líneas congeladas, ajuste válido/400, estado válido/400, 404.

## 2. Adapters y hooks

- [x] 2.1 `BillingAdapter`: etiquetas de estado y motivo, `money()` es-CO sin decimales, `periodLabel("2026-08") → "agosto 2026"`, períodos disponibles (en curso + 5).
- [x] 2.2 `useBillingPeriod(period)` (filas + stats derivadas), `useBilling(id)`, `useBillingMutations` (generate, adjust, removeAdjustment, setStatus) con `MutationResult`.
- [x] 2.3 Tests de adapter y hooks contra el mock real.

## 3. Listado

- [x] 3.1 `BillingStatsCards` (total del mes · pendientes de aprobar · externos facturados), `BillingList` (`Select` de período, `Table flush`, `Badge` de estado, enlace neutro al detalle, `Menu` Abrir/Aprobar/Reabrir), primario "Generar cierres del mes".
- [x] 3.2 `BillingContainer` + `LeadBillingPage`; ruta `facturacion` (+ `?period=`); nav "Facturación" en Capacidad + `leadRouteTitles`; `ApproveBillingDialog` compartido.
- [x] 3.3 Tests: lista (estados y menú), container con el mock real (generar crea borradores y actualiza cards), nav.

## 4. Detalle

- [x] 4.1 `BillingLinesTable` (líneas, ajuste con signo y motivo, pie con subtotal/ajustes/total), `AdjustLineDrawer` + `adjustmentValidation.ts` (monto ≠ 0, motivo obligatorio), quitar ajuste.
- [x] 4.2 `BillingDetailContainer` + `LeadBillingDetailPage`; ruta `facturacion/:id`; breadcrumb "<proveedor> · <período>"; Aprobar (confirmación) / Reabrir; sólo lectura aprobado; estado vacío 404.
- [x] 4.3 Tests: drawer (validación y submit), detalle con el mock real (ajustar recalcula totales; aprobar bloquea y reabrir desbloquea).

## 5. Verificación

- [x] 5.1 `npx vitest run`, typecheck, lint (sólo baseline); prettier.
- [x] 5.2 Navegador: mes anterior (aprobado + borrador con ajuste), mes en curso → generar, abrir GFT, ajustar una línea, aprobar, reabrir; cambiar de período.
- [x] 5.3 Anotar en `proposal.md` las brechas de tuip.
