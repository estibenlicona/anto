## 1. Backlog: retirar el encabezado y publicar el resumen

- [x] 1.1 Crear `src/features/backlog/components/BacklogDaySummary.tsx` con el texto "N clasificadas hoy · quedan M de T" extraído de `BacklogHeader` (prop `summary: BacklogSummary`), conservando las cifras en `<b>` con `tabular-nums` y color por defecto sobre `text-body-sm text-neutral-subtle`, y a su derecha el `Progress` (`label="Progreso del día"`, `value={summary.progressPercentage}`) dentro de un envoltorio `w-32 shrink-0` (su `className` no anula el `w-full` de fábrica), todo en una fila `flex h-8 items-center gap-2` con el texto en `whitespace-nowrap`; sin título ni descripción
- [x] 1.2 En `BacklogContainer.tsx`, dejar de renderizar `BacklogHeader` y publicar con `useLeadBreadcrumbActions(summary ? <BacklogDaySummary summary={summary} /> : null)`, con un comentario que explique por qué no hay encabezado y por qué el nodo es `null` sin resumen
- [x] 1.3 En `BacklogContainer.tsx`, cambiar el `gap-5` de la raíz por `gap-3` y el `gap-4` del grid `lg:grid-cols-[22rem_1fr]` por `gap-3`; no tocar los paddings ni gaps interiores de `BacklogQueue`, `CurrentStoryPanel` ni `DecisionCards`
- [x] 1.4 Eliminar `src/features/backlog/components/BacklogHeader.tsx` (confirmar con grep que no queda ningún consumidor ni import de `Progress` huérfano)

## 2. Página: encabezado accesible

- [x] 2.1 En `src/pages/LeadBacklogPage/LeadBacklogPage.tsx`, envolver `BacklogContainer` en un `div` con un `h1` `sr-only` "Gestionar Backlog" (mismo patrón que `LeadPeoplePage`)
- [x] 2.2 Crear `src/pages/LeadBacklogPage/LeadBacklogPage.test.tsx` que afirme un único `heading` nivel 1 con ese texto (mismo patrón que `LeadAbsencesPage.test.tsx`)

## 3. Tests

- [x] 3.1 En `BacklogContainer.test.tsx`, envolver el render con `LeadBreadcrumbProvider` y una sonda `BreadcrumbActionsProbe` que pinte `actions` (mismo patrón que `PeopleContainer.test.tsx`), para que `findByText(/clasificadas hoy/)` y los asserts del texto actualizado tras clasificar sigan encontrando el resumen; no cambiar el contenido de esos asserts
- [x] 3.2 En `BacklogContainer.test.tsx`, añadir un caso que afirme que el texto del resumen y el `progressbar` "Progreso del día" se renderizan dentro de la sonda (`within(getByTestId("breadcrumb-actions"))`) y que no existe ningún `heading` "Backlog"
- [x] 3.3 En `BacklogComponents.test.tsx`, sustituir el `describe("BacklogHeader")` por `describe("BacklogDaySummary")`, conservando los asserts del texto "2 clasificadas hoy · quedan 8 de 10" y del `progressbar` "Progreso del día"

## 4. Verificación

- [x] 4.1 `pnpm test` (suites de backlog y de páginas) en verde y `pnpm lint` sin errores nuevos
- [x] 4.2 Revisar en el navegador `/app/lead/backlog`: sin título ni descripción visibles, texto del resumen y barra estrecha en una sola línea a la derecha de la franja y a la altura del breadcrumb, cola y panel como primer bloque del contenido; clasificar, saltar, rechazar y deshacer una historia y confirmar que texto y barra de la franja se actualizan; comprobar la primera carga (franja sólo con breadcrumb) y el estado de error; salir a otro módulo y ver que el texto se retira
- [x] 4.3 Comparar `/app/lead/backlog` con `/app/lead/personas`, `/app/lead/celulas` y `/app/lead/ausencias` en la misma sesión: misma altura de franja, misma separación de 12px entre bloques (medir vertical y horizontal entre cola y panel); confirmar que la franja no crece de altura con la barra, juzgar si texto + barra pesan demasiado frente al breadcrumb y ajustar el ancho de la barra si hace falta (Decisión 1 del design)
