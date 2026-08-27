## 1. Iniciativas: retirar el encabezado y publicar la acción

- [x] 1.1 En `src/features/initiatives/InitiativesContainer.tsx`, eliminar el bloque `div` con el `h1` "Iniciativas", el párrafo de descripción y el `Button` "Nueva iniciativa"
- [x] 1.2 En `InitiativesContainer.tsx`, importar `useLeadBreadcrumbActions` de `@features/chapter-lead-shell/LeadBreadcrumbContext` y publicar el `Button` primario `size="small"` "Nueva iniciativa" (icono `plus` a 16, `onClick={openCreate}`), con el comentario habitual de por qué no hay encabezado de módulo
- [x] 1.3 En `InitiativesContainer.tsx`, cambiar el `gap-6` del contenedor raíz por `gap-3`

## 2. Cards de resumen

- [x] 2.1 En `src/features/initiatives/components/InitiativesStatsCards.tsx`, llevar el grid de cards de `gap-4` a `gap-3` (sin tocar el `gap-5`/`gap-1` interiores de la card de activas)
- [x] 2.2 En la card "FTE DEMANDADO", dejar la cifra sola (retirar el sufijo "FTE" pegado al número) y poner al pie "FTE de N activas" / "FTE de 1 activa" a partir de `stats.active`, en lugar de "FTE esperado que suman las iniciativas activas."
- [x] 2.3 En la card "SIN EVALUAR", poner al pie "de N iniciativas" / "de 1 iniciativa" a partir de `stats.total`, en lugar de "Sin talla no entran a la demanda."

## 3. Página: encabezado accesible

- [x] 3.1 En `src/pages/LeadInitiativesPage/LeadInitiativesPage.tsx`, envolver `InitiativesContainer` en un `div` con un `h1` `sr-only` "Gestionar Iniciativas" (mismo patrón y comentario que `LeadAbsencesPage`)
- [x] 3.2 Crear `src/pages/LeadInitiativesPage/LeadInitiativesPage.test.tsx` que espere la carga del listado y afirme un único `heading` nivel 1 con ese texto y clase `sr-only`

## 4. Tests

- [x] 4.1 En `src/features/initiatives/__test__/InitiativeContainers.test.tsx`, envolver `renderAt` con `LeadBreadcrumbProvider` y una sonda `BreadcrumbActionsProbe` que pinte `actions` (mismo patrón que `AbsencesContainer.test.tsx`), para que "Nueva iniciativa" exista; confirmar que el test de crear sigue en verde y añadir un assert de que no hay `heading` "Iniciativas" ni el texto de la descripción
- [x] 4.2 En `src/features/initiatives/components/__test__/InitiativesComponents.test.tsx`, ajustar `getByText("de 7 iniciativas")` (ahora aparece en dos cards) y añadir asserts de los pies nuevos ("FTE de 4 activas", ausencia de "FTE esperado que suman" y de "Sin talla no entran") y de las clases de separación `gap-3` del grid
- [x] 4.3 Añadir en el test del contenedor un assert de que el contenedor raíz usa `gap-3` (y no `gap-6`)

## 5. Verificación

- [x] 5.1 `pnpm test` (suites de initiatives y de páginas) en verde y `pnpm lint` sin errores nuevos
- [x] 5.2 Revisar en el navegador `/app/lead/iniciativas`: sin título ni descripción visibles, botón "Nueva iniciativa" a la derecha de la franja y a su altura, cards primero y tabla inmediatamente después con 12px entre bloques y entre cards, pies de las cards con datos; comprobar carga, error y listado vacío (el estado vacío conserva su botón); salir a otro módulo y ver que el botón se retira
- [x] 5.3 Comparar `/app/lead/iniciativas` con `/app/lead/ausencias` y `/app/lead/celulas` en la misma sesión: mismo alto de franja, misma separación y mismo tamaño de botón
