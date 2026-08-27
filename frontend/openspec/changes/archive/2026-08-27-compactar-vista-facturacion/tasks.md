## 1. Navegador de mes compartido

- [x] 1.1 Crear `src/shared/components/MonthNav.tsx` con el markup de `AbsencesMonthNav` (chevron girado, `minWidth` inline de 128px, `aria-label` "Mes anterior"/"Mes siguiente") y las props `title`, `onPrevious`, `onNext`, `previousDisabled?`, `nextDisabled?`; los deshabilitados van al `disabled` del `Button` correspondiente
- [x] 1.2 Reescribir `src/features/absences/components/AbsencesMonthNav.tsx` para que delegue en `MonthNav` conservando su firma (`monthTitle`, `onPreviousMonth`, `onNextMonth`); no tocar `AbsencesContainer` ni sus tests
- [x] 1.3 Crear `src/shared/components/__test__/MonthNav.test.tsx`: título visible, clic en cada flecha llama a su callback, y con `previousDisabled`/`nextDisabled` el botón correspondiente queda deshabilitado y no dispara el callback

## 2. Adaptador: helpers del período

- [x] 2.1 En `BillingAdapter.ts`, añadir `periodTitle(period)` (inicial mayúscula sobre `periodLabel`, "Agosto 2026") y `shiftPeriod(period, delta)` (mismo cálculo por `Date.UTC` que `availablePeriods`); `periodLabel` y `availablePeriods` no cambian
- [x] 2.2 En `billingHooks.test.ts`, cubrir `periodTitle("2026-08") === "Agosto 2026"` y `shiftPeriod` cruzando año en ambos sentidos ("2026-01" → "2025-12", "2025-12" → "2026-01")

## 3. Facturación: retirar el encabezado y publicar los controles

- [x] 3.1 En `BillingContainer.tsx`, eliminar el bloque de encabezado (h1 "Prefacturas", descripción, `Select` de período y fila de botones) y la importación de `Select`; dejar un comentario que explique por qué no hay encabezado ni selector (el período decide todo lo que se muestra y vive en la franja, como el mes en Ausencias)
- [x] 3.2 En `BillingContainer.tsx`, publicar con `useLeadBreadcrumbActions` un `div` `flex items-center gap-2` con, en orden: `MonthNav` (`title={periodTitle(period)}`, `onPrevious`/`onNext` vía `shiftPeriod` y `onPeriodChange`, `nextDisabled={period >= anchor}`, `previousDisabled={period <= último de periods}`), el `Button` secondary `size="small"` "Generar el esperado del mes" (icono `calibration` a 16, mismo `isLoading`/`disabled`) y el `Button` primary `size="small"` "Registrar prefactura" (icono `document` a 16, mismo `disabled`/`onClick`)
- [x] 3.3 En `BillingContainer.tsx`, cambiar el `gap-6` de la raíz por `gap-2`; confirmar que `onPeriodChange` sigue borrando el parámetro cuando el destino es el mes en curso

## 4. Página: encabezado accesible

- [x] 4.1 En `LeadBillingPage.tsx`, envolver `BillingContainer` en un `div` con un `h1` `sr-only` "Prefacturación" (mismo patrón que `LeadPeoplePage`)
- [x] 4.2 Crear `src/pages/LeadBillingPage/LeadBillingPage.test.tsx` que afirme un único `heading` nivel 1 con ese texto y clase `sr-only`, esperando a que el listado cargue (mismo molde que `LeadPeoplePage.test.tsx`, con `MemoryRouter` en `/app/lead/facturacion` y el reset del mock de billing)

## 5. Tests del contenedor

- [x] 5.1 En `BillingContainers.test.tsx`, envolver `renderList` con `LeadBreadcrumbProvider` y una sonda `BreadcrumbActionsProbe` que pinte `actions` (mismo patrón que `PeopleContainer.test.tsx`), para que "Generar el esperado del mes", "Registrar prefactura" y el navegador existan en el DOM
- [x] 5.2 Reemplazar el test "el período se lee en el encabezado, no entre los filtros del listado" por "el período vive en la franja del breadcrumb, no entre los filtros de la tabla": el navegador ("Mes anterior"/"Mes siguiente") y los dos botones están dentro de la sonda, no hay `combobox` "Período" ni `heading` "Prefacturas"
- [x] 5.3 Reescribir "el período del listado sigue al mes en curso" para leer el título del navegador (contiene el año de `CURRENT_PERIOD`) y afirmar que "Mes siguiente" está deshabilitado y "Mes anterior" habilitado
- [x] 5.4 Añadir un test de cambio de mes: clic en "Mes anterior" actualiza el título del navegador y la card "Prefacturas · <mes>" al mes anterior, y el listado vuelve a cargar ese período; clic en "Mes siguiente" vuelve al mes en curso
- [x] 5.5 Añadir un test del extremo antiguo: `renderList("?period=<quinto mes anterior>")` deja "Mes anterior" deshabilitado y "Mes siguiente" habilitado
- [x] 5.6 Confirmar que el test de generar el esperado sigue en verde buscando el botón dentro de la sonda, y que el de "Registrar prefactura" (si lo hay) hace lo propio

## 6. Verificación

- [x] 6.1 `pnpm test` (suites de billing, absences, shared y páginas) en verde y `pnpm lint` sin errores nuevos; confirmar con grep que `Select` ya no se importa en `BillingContainer.tsx`
- [x] 6.2 Revisar en el navegador `/app/lead/facturacion`: sin título, descripción ni selector visibles; navegador de mes y los dos botones a la derecha de la franja y a su altura, en ese orden; cards primero y tabla inmediatamente después con 8px entre ellas; comprobar carga, error y período sin personas externas
- [x] 6.3 En el navegador: retroceder cinco meses y confirmar que "Mes anterior" se deshabilita en el más antiguo y "Mes siguiente" en el mes en curso; que `?period=` acompaña cada cambio y desaparece en el mes en curso; que recargar abre el mismo mes; salir al detalle de una prefactura y a otro módulo y ver que los controles se retiran
- [x] 6.4 Comparar `/app/lead/facturacion` con `/app/lead/ausencias` en la misma sesión: mismo navegador, mismo alto de franja, misma separación y mismo tamaño de botón; juzgar si la franja con navegador + dos botones queda holgada al ancho mínimo del shell de escritorio y, si aprieta, reducir el `minWidth` del título

## 7. Ajustes posteriores (pedidos tras la revisión)

- [x] 7.1 Renombrar la pantalla a "Prefacturación": entrada del sidebar, título de ruta/breadcrumb, `h1` accesible, "Volver a Prefacturación" del detalle y tests
- [x] 7.2 En `BillingContainer.tsx`, búsqueda y paginación en cliente sobre las filas del período (persona/proveedor/célula, página a 1 al cambiar búsqueda, filtro, tamaño o período) y pasar `search`/`page`/`pageSize`/`total`/`totalPages` a la lista
- [x] 7.3 En `BillingList.tsx`, `SearchField` junto al filtro de proveedor en la barra, `PaginationBar` en el pie con filas, y estado "Sin resultados" cuando hay búsqueda o filtro activos
- [x] 7.4 Igualar gaps a `gap-3`: contenedor (`gap-2` → `gap-3`) y grid de cards (`gap-4` → `gap-3`)
- [x] 7.5 Tests: `BillingComponents.test.tsx` (props nuevas, "Sin resultados", pie con/sin filas) y `BillingContainers.test.tsx` (búsqueda acota y vacía; paginación presente)
