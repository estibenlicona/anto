## 1. Separación de la vista de células

- [x] 1.1 En `src/features/squads/SquadsContainer.tsx`, cambiar el `gap-2` del `div` raíz (`flex flex-col gap-2`) por `gap-3`
- [x] 1.2 En `src/features/squads/components/SquadsStatsCards.tsx`, cambiar el `gap-4` del grid del resumen por `gap-3`, conservando `sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1.2fr]`
- [x] 1.3 Ajustar el comentario de `SquadsContainer.tsx` / `SquadsStatsCards.tsx` si alguno menciona la medida vieja (hoy hablan de "una fila" y "arrancar arriba", no de píxeles; sólo tocar si hace falta)

## 2. Tests

- [x] 2.1 En `src/features/squads/__test__/SquadsContainer.test.tsx`, añadir un assert de que el contenedor raíz de la vista (el `div` que envuelve resumen y listado) lleva la clase `gap-3` y no `gap-2`
- [x] 2.2 En `src/features/squads/components/__test__/SquadsStatsCards.test.tsx`, añadir un assert de que el grid de las tres cards lleva la clase `gap-3` y no `gap-4`

## 3. Verificación

- [x] 3.1 `pnpm test` (suites de squads) en verde y `pnpm lint` sin errores nuevos
- [x] 3.2 Revisar en el navegador `/app/lead/celulas` y `/app/lead/ausencias` en la misma sesión: misma separación entre resumen y tabla y misma separación entre cards en las dos vistas; comprobar que en células las `DistributionCard` con leyenda en línea no se aprietan al perder 4px entre cards
- [x] 3.3 Confirmar que el detalle de célula (`/app/lead/celulas/:id`) y el listado de Personas no cambiaron (fuera de alcance, ver proposal.md — Impact)
