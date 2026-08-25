## 1. Adopción

- [x] 1.1 Reinstalar el paquete de tuip publicado por `retune-accent-scale` (`pnpm install --force`, borrar `node_modules/.vite`).
- [x] 1.2 `PeopleStatsCards`: quitar `SENIORITY_TONES`; tono por `accentTones[seniority - 1]`.
- [x] 1.3 `SquadTeamStatsCards`: `MIX_TONES = { bau: "sky", transformation: "violet" }`; comentario con el porqué.
- [x] 1.4 Tests `PeopleStatsCards.test` y `SquadsList.test`: clases esperadas derivadas de `segmentFillClass`/`accentTones`.

## 2. Verificación

- [x] 2.1 `npx vitest run`, typecheck, lint (sólo baseline), prettier.
- [x] 2.2 Navegador: Personas (card de distribución y medidores de las filas con la misma escala celeste→magenta), detalle de persona (horas por sprint BAU/Iniciativa), Células (columna Capacidad y resumen del equipo).
