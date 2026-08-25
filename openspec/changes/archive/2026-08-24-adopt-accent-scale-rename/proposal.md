## Why

tuip cambia la escala de acento que viste los niveles de seniority (change `retune-accent-scale`): los matices pasan de `slate · blue · teal · purple` a `sky · blue · violet · magenta` (celeste → azul → violeta → magenta), con valores por tema. La app referencia los nombres viejos en dos mapas locales y tres tests, así que deja de compilar al reinstalar el paquete. Además, el spec de Personas promete que "un cambio de matiz en la escala llega con la sola actualización del paquete" y hoy no se cumple: `PeopleStatsCards` mapea seniority → tono a mano.

## What Changes

- **Seniority sin mapa local**: `PeopleStatsCards` toma el tono de cada nivel de `accentTones[index]` (el orden de la escala que exporta tuip, el mismo que usa `SeniorityCard`), en vez de `SENIORITY_TONES`. Un cambio futuro de matiz o de nombre en tuip ya no toca la app.
- **Mix BAU / Transformación**: `MIX_TONES` (`SquadTeamStatsCards`, reutilizado por `HoursBySprintPanel` y la columna Capacidad de Células) pasa de `slate · blue` a **`sky · violet`**: con la escala nueva `sky` y `blue` son vecinos y se confundirían; primero y tercero se distinguen sin tomar el último (que es el de Experto).
- Tests que afirman clases (`bg-accent-slate-fill`, `bg-accent-teal-fill`) pasan a las nuevas (`PeopleStatsCards.test`, `SquadsList.test`) o, mejor, a derivarlas de `segmentFillClass`.
- Reinstalar el paquete publicado por tuip (`pnpm install --force`, limpiar `.vite`) y revisar en navegador Personas, detalle de persona (horas por sprint), Células (columna Capacidad y resumen del equipo) y la evaluación de iniciativas (no usa acento; sólo comprobar que nada más cambió).

### Fuera de alcance

- Cambiar la paleta en sí (vive en tuip).
- La paleta de tallas de Iniciativas (categórica, no ordinal).

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `people`: "Resumen del módulo de Personas" — la card deriva el tono de cada nivel del orden de la escala del sistema, sin mapa local (cumple el escenario "Un cambio de matiz en la escala llega solo").

## Impact

- `features/people/components/PeopleStatsCards.tsx` (+ test), `features/squads/components/SquadTeamStatsCards.tsx` (`MIX_TONES`), `features/squads/components/__test__/SquadsList.test.tsx`, `features/people/components/detail/HoursBySprintPanel.tsx` sin cambio (lee `MIX_TONES`).
- `package.json` sin cambio (mismo `file:` al `.tgz`); requiere el paquete de tuip ya publicado con `retune-accent-scale`.
