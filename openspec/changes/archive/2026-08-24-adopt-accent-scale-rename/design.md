## Context

- `PeopleStatsCards.tsx` define `SENIORITY_TONES: Record<number, AccentTone> = {1:"slate",2:"blue",3:"teal",4:"purple"}` y lo pasa a `DistributionCard` como `tone`; `SeniorityCard` (tuip) usa `accentTones[index]` — dos fuentes para el mismo color, hoy coinciden por construcción manual.
- `SquadTeamStatsCards.tsx` exporta `MIX_TONES = { bau: "slate", transformation: "blue" }`; lo consumen el resumen del equipo, la columna Capacidad del listado de células y `HoursBySprintPanel` (vía `segmentFillClass`).
- tuip exporta `accentTones` y `AccentTone` desde `@tuya-ui/components`.

## Decisions

1. **Tono por índice, no por mapa**: `toneForSeniority(level: Seniority) = accentTones[level - 1] ?? accentTones[0]` en `PeopleStatsCards` (o en `PersonAdapter` si otro consumidor aparece). Es exactamente lo que hace `SeniorityCard`, así que card y medidor coinciden por definición.
2. **`MIX_TONES = { bau: "sky", transformation: "violet" }`**. Alternativa `sky/blue` (traducción literal) descartada por ser vecinos; `sky/magenta` descartada porque magenta es el matiz de Experto en la misma pantalla de Personas.
3. **Tests**: en vez de esperar literales, esperar `segmentFillClass({ tone: accentTones[i] })` — el test deja de romperse con cada retoque de paleta y sigue verificando que card y listado comparten clase.

## Risks / Trade-offs

- Orden de aplicación: primero `retune-accent-scale` en tuip y su `.tgz`; este change no compila contra el paquete viejo. Se aplican en la misma sesión.
