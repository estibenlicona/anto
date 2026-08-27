## 1. Ausencias: retirar el encabezado y publicar los controles

- [x] 1.1 Crear `src/features/absences/components/AbsencesMonthNav.tsx` con el navegador de mes extraído de `AbsencesHeader` (props `monthTitle`, `onPreviousMonth`, `onNextMonth`), conservando el markup, los comentarios y los `aria-label` "Mes anterior"/"Mes siguiente"
- [x] 1.2 En `AbsencesContainer.tsx`, dejar de renderizar `AbsencesHeader` y publicar con `useLeadBreadcrumbActions` un bloque `flex items-center gap-2` con `AbsencesMonthNav` y, a su derecha, el `Button` primario `size="small"` "Registrar ausencia" (icono `calendar` a 16, `onClick={openRegister}`), con un comentario que explique por qué no hay encabezado
- [x] 1.3 En `AbsencesContainer.tsx`, cambiar el `gap-6` de la raíz por `gap-3` y eliminar el `Alert` informativo del pie
- [x] 1.4 Eliminar `src/features/absences/components/AbsencesHeader.tsx` (confirmar con grep que no queda ningún consumidor)
- [x] 1.5 En `AbsencesStatsCards.tsx`, eliminar la línea de pie de la card "Impacto en capacidad" (las dos ramas), bajar al pie la referencia contra el FTE del chapter y llevar el grid de cards a `gap-3`

## 2. Página: encabezado accesible

- [x] 2.1 En `LeadAbsencesPage.tsx`, envolver `AbsencesContainer` en un `div` con un `h1` `sr-only` "Gestionar Ausencias" (mismo patrón que `LeadPeoplePage`)
- [x] 2.2 Crear `src/pages/LeadAbsencesPage/LeadAbsencesPage.test.tsx` que afirme un único `heading` nivel 1 con ese texto

## 3. Tests

- [x] 3.1 En `AbsencesContainer.test.tsx`, envolver el render con `LeadBreadcrumbProvider` y una sonda que pinte `actions` (mismo patrón que `PeopleContainer.test.tsx`), para que "Mes anterior"/"Mes siguiente" y "Registrar ausencia" existan
- [x] 3.2 En `AbsencesContainer.test.tsx`, retirar el assert del `heading` nivel 1 "Ausencias", retirar el test "el aviso del alcance no habla de fases del plan" y el assert de "La célula que más pierde es"; confirmar que el test de navegación entre meses sigue en verde con los botones publicados
- [x] 3.3 En `AbsencesStatsCards.test.tsx`, sustituir los asserts del pie de la card de impacto por asserts de su ausencia (ambas ramas), dejando intactos los de la cifra y la referencia al FTE del chapter

## 4. Verificación

- [x] 4.1 `pnpm test` (suites de absences y de páginas) en verde y `pnpm lint` sin errores nuevos (siguen los dos fallos previos y ajenos: `App.test.tsx` importa un `./App` inexistente y `httpClient` sin baseURL)
- [x] 4.2 Revisar en el navegador `/app/lead/ausencias`: sin título ni descripción visibles, navegador de mes y botón a la derecha de la franja y a su altura, cards primero y tabla inmediatamente después, sin el aviso del pie ni la línea de la card de impacto; comprobar carga, error y mes sin ausencias; cambiar de mes y confirmar que `?mes=` acompaña y que recargar abre el mismo mes; salir a otro módulo y ver que los controles se retiran
- [x] 4.3 Comparar `/app/lead/ausencias` con `/app/lead/personas` y `/app/lead/celulas` en la misma sesión: mismo alto de franja, misma separación y mismo tamaño de botón; juzgar si la franja con navegador + botón queda holgada
