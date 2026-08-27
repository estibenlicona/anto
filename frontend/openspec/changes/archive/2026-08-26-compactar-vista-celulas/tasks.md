## 1. Shell: acciones en la franja del breadcrumb

- [x] 1.1 En `LeadBreadcrumbContext.tsx`, añadir `actions: React.ReactNode | null` al valor y `setActions`; exponer los setters por un contexto estable (o hook que sólo consume setters) para que el publicador no se re-renderice al publicar; añadir `useLeadBreadcrumbActions(node)` que publica mientras está montado y limpia al desmontar; fuera del provider sigue siendo no-op
- [x] 1.2 En `ChapterLeadLayout.tsx`, convertir la franja del breadcrumb en `flex items-center justify-between gap-4` con `LeadBreadcrumb` a la izquierda y, sólo si hay `actions`, un contenedor a la derecha que las pinte
- [x] 1.3 En `ChapterLeadLayout.test.tsx`: caso con una ruta stub que publica un botón → el botón aparece dentro de la franja del breadcrumb; caso de navegar a otra ruta → el botón desaparece; confirmar que los tests existentes de breadcrumb siguen en verde

## 2. Células: retirar el encabezado y publicar la acción

- [x] 2.1 En `SquadsContainer.tsx`, dejar de renderizar `SquadsHeader` (quitar import) y publicar con `useLeadBreadcrumbActions` un `Button` primario `size="small"` "Nueva célula" con `iconBefore` `cell` y `onClick={openCreate}`; cambiar el `gap-6` raíz por `gap-4`
- [x] 2.2 Eliminar `src/features/squads/components/SquadsHeader.tsx` (confirmar con grep que no tiene otros consumidores)
- [x] 2.3 En `SquadsContainer.test.tsx`: envolver el render con `LeadBreadcrumbProvider` y una sonda que pinte `actions`; reemplazar el assert del `heading` "Células" por asserts de ausencia del título/descripción visibles y de que el botón "Nueva célula" publicado existe; actualizar el comentario de cabecera que menciona "encabezado"

## 3. Página: encabezado accesible

- [x] 3.1 En `LeadSquadsPage.tsx`, envolver `SquadsContainer` con un `h1` `sr-only` con el texto "Gestionar Células" (mismo patrón que `LeadPeoplePage`) y reemplazar el comentario que explicaba la ausencia del `h1`
- [x] 3.2 Añadir (o ajustar si existe) un test de página que afirme un único `heading` nivel 1 "Gestionar Células"

## 4. Verificación

- [x] 4.1 `pnpm test` (suites de squads, layout y router) en verde y `pnpm lint` sin errores
- [x] 4.3 Ajuste tras la revisión: `gap-2` en la raíz de `SquadsContainer`; `py-2` en la franja del breadcrumb y en el `<main>` de `ChapterLeadLayout`; specs y design actualizados
- [x] 4.2 Revisar en el navegador `/app/lead/celulas`: sin título visible, botón a la derecha y a la altura del breadcrumb (juzgar si `size="small"` queda bien), cards primero, separación de 16px; comprobar carga, error, "Sin resultados" y vacío inicial; entrar al detalle y volver para ver que el botón se retira y reaparece
