## Context

`BillingContainer` apila hoy sus bloques con `gap-6`, empezando por un encabezado inline: a la izquierda un `h1` "Prefacturas" con un `Select` etiquetado "Período" alineado por `items-end` y una descripción debajo; a la derecha los botones "Generar el esperado del mes" (secondary) y "Registrar prefactura" (primary) a tamaño medio. `LeadBillingPage` es un one-liner sin `h1` propio. El período vive en `?period=YYYY-MM` (sin parámetro para el mes en curso), validado sólo por forma (`PERIOD_RE`); `availablePeriods(anchor)` da el mes en curso y los cinco anteriores, y hoy alimenta las opciones del `Select`.

El mecanismo del shell ya está construido (`compactar-vista-celulas`): `useLeadBreadcrumbActions(node)` publica un `ReactNode` en la franja del breadcrumb mientras el componente está montado; fuera del provider es un no-op. `compactar-vista-ausencias` ya publicó un bloque con dos controles (navegador de mes + botón) y dejó `AbsencesMonthNav` como componente propio. Este change consume ambas cosas; no toca el shell. Ver proposal.md — Why.

El `Select` del sistema de diseño pinta la etiqueta siempre visible encima del trigger y no reenvía `aria-label`: no hay forma de ponerlo en la franja sin la etiqueta flotando ni de dejarlo sin nombre accesible. Eso es lo que hace que hoy se vea mal y lo que descarta "el mismo select, en la franja".

## Goals / Non-Goals

**Goals:**
- Recuperar el alto del encabezado para la tabla, sin perder el cambio de período ni las dos acciones.
- Que el período se lea como en Ausencias: un navegador de mes en la franja, no un campo de formulario.
- Un único `h1`, `sr-only`, coincidente con el breadcrumb.
- Misma disposición, espaciado y tamaño de controles que en las otras pantallas compactadas.

**Non-Goals:**
- Tocar el shell (`LeadBreadcrumbContext`, `ChapterLeadLayout`).
- Tocar `BillingList` (el filtro por proveedor sigue en la barra de la tabla), `BillingStatsCards`, drawers, diálogo, hooks, servicio o mocks.
- Cambiar el rango de meses disponibles ni dónde vive el período (`?period=`).
- Cambiar el aspecto o el comportamiento de Ausencias: la extracción de `MonthNav` es un refactor sin efecto visible allí.

## Decisions

**1. Navegador de mes en la franja, no un `Select` sin etiqueta.**
El período de Facturación es el mismo tipo de control que el mes de Ausencias: decide de qué mes es todo lo que se muestra, cards incluidas. Usar el mismo control hace que las dos pantallas mensuales del lead se lean igual, y elimina el problema de la etiqueta (el valor "Agosto 2026" se nombra a sí mismo). Alternativas descartadas: (a) `Select size="small"` sin `label` con un `<label class="sr-only" htmlFor>` externo — funciona técnicamente, pero deja en la franja una caja de formulario junto a botones, y en Ausencias el mismo problema ya se resolvió con navegador; (b) un `Menu` con los seis meses — sin estado de selección visible en el sistema de diseño y sin precedente. Si el usuario prefiere ver los seis meses de un vistazo, (a) es el camino de vuelta y cuesta una tarde.

**2. `MonthNav` compartido en `src/shared/components/`, extraído de `AbsencesMonthNav`.**
`compactar-vista-ausencias` avisó que con una cuarta pantalla convenía reconsiderar la duplicación; el navegador es exactamente lo que se repite. `MonthNav` recibe `title`, `onPrevious`, `onNext` y los opcionales `previousDisabled`, `nextDisabled`; conserva el markup actual (chevron girado, `minWidth` inline de 128px, `aria-label` "Mes anterior"/"Mes siguiente"). `AbsencesMonthNav` se queda con su firma (`monthTitle`, `onPreviousMonth`, `onNextMonth`) delegando en `MonthNav`, así el contenedor y los tests de Ausencias no cambian. Alternativa descartada: copiar el markup a `BillingPeriodNav` — es la cuarta copia del patrón, y esta vez la duplicación es un componente entero, no cuatro líneas.

**3. Rango acotado con los extremos deshabilitados; `availablePeriods` define el rango.**
El `Select` no dejaba salir del mes en curso y los cinco anteriores; el navegador tampoco debe. `nextDisabled = period >= anchor` y `previousDisabled = period <= oldest`, con `oldest` = último elemento de `availablePeriods(anchor)`; la comparación lexicográfica de `YYYY-MM` es correcta. Deshabilitar, y no ocultar, deja claro que hay un tope. Un `?period=` con forma válida pero fuera del rango se sigue aceptando como hoy (el backend lo valida sólo por forma); en ese caso el navegador simplemente permite volver hacia el rango. No se añade clamping: es un caso que hoy tampoco se maneja y no es lo que este change arregla.

**4. Saltar de mes reutiliza la aritmética que ya existe.**
`availablePeriods` ya construye claves `YYYY-MM` con `Date.UTC`; se añade en `BillingAdapter` un `shiftPeriod(period, delta)` con esa misma base (no se importa `shiftMonth` de Ausencias para no acoplar módulos por un helper de tres líneas). `onPeriodChange` se conserva tal cual: sigue borrando el parámetro cuando el destino es el mes en curso.

**5. Título con inicial mayúscula sin tocar `periodLabel`.**
`periodLabel` devuelve "agosto 2026" y las cards lo usan a mitad de frase ("Prefacturas · agosto 2026"), donde la minúscula es correcta. El navegador necesita "Agosto 2026" como Ausencias. Se añade `periodTitle(period)` en el adaptador (capitaliza la inicial de `periodLabel`) en vez de cambiar `periodLabel` y su test.

**6. Un solo nodo publicado: `flex items-center gap-2` con navegador, botón secundario y botón primario.**
Mismo contenedor que en Ausencias, con el navegador primero. Los botones pasan a `size="small"` e icono 16 (`calibration` y `document`), y conservan `isLoading`/`disabled` tal cual. El nodo se reconstruye en cada render del contenedor —como en Ausencias—, lo que sólo re-renderiza la franja (ver la nota de los dos contextos en `LeadBreadcrumbContext`).

**7. `LeadBillingPage` pasa a `div` con `h1` `sr-only` "Prefacturación".**
Es el título que `leadRouteTitles` da al breadcrumb. Se añade `LeadBillingPage.test.tsx` que afirme que es único, con el mismo molde que `LeadPeoplePage.test.tsx`.

**8. Los tests del contenedor montan `LeadBreadcrumbProvider` con la sonda de `actions`.**
No es opcional: el test de generar el esperado hace clic en "Generar el esperado del mes", que pasa a vivir en lo publicado. Se replica la sonda de `PeopleContainer.test.tsx`. El test "el período se lee en el encabezado, no entre los filtros del listado" se reescribe como "el período vive en la franja del breadcrumb, no entre los filtros de la tabla" (busca el navegador dentro de la sonda y comprueba que no hay `combobox` "Período"). El de "sigue al mes en curso" lee el título del navegador.

## Risks / Trade-offs

- [La franja queda cargada: breadcrumb + navegador + dos botones] → Es el bloque más ancho de las pantallas compactadas (~620px a la derecha). En el ancho mínimo del shell de escritorio cabe; se verifica en la revisión manual y, si aprieta, el `minWidth` del título es un cambio de una línea. La alternativa (fila propia en el contenido) contradice el objetivo.
- [Llegar al mes más viejo cuesta cinco clics; el `Select` era un salto] → Aceptado: la revisión de prefacturas se hace sobre el mes en curso y el anterior; los extremos son excepcionales. El enlace con `?period=` sigue permitiendo el salto directo.
- [Refactor en Ausencias (`AbsencesMonthNav` → `MonthNav`) mientras `compactar-vista-ausencias` sigue abierto] → El cambio no altera markup ni `aria-label`; los tests de Ausencias corren sin tocarse y sirven de red. Se ejecutan en la verificación.
- [Perder la descripción deja sin explicar qué se compara] → Las cards ya lo dicen ("Esperado vs prefacturado", "Novedades del período") y el detalle de cada prefactura desarrolla la comparación; mismo criterio que en las otras pantallas.
