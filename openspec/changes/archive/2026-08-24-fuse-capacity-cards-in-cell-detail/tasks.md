## 1. La card fusionada

- [x] 1.1 En `SquadTeamStatsCards.tsx`, reemplazar la card "CAPACIDAD ASIGNADA" (métrica + `Progress brandFill`) y la `DistributionCard` "MIX BAU / TRANSFORMACIÓN" por una sola card "CAPACIDAD": `CapacityBar` con `allocated`/`available`/`unit="FTE"`, partes BAU y Transformación con `MIX_TONES`, `freeLabel="libre"` y `emptyLabel` para la célula sin equipo; el pie conserva "X% del esfuerzo va a operación" (`bauPct`).
- [x] 1.2 Pasar la grilla del resumen a 2 columnas (`sm` sigue apilando) y retirar los imports que queden sin uso (`Progress`, `DistributionCard`); `MIX_TONES` sigue exportándose desde este archivo.
- [x] 1.3 Correr el typecheck.

## 2. Pruebas

- [x] 2.1 Localizar las pruebas que cubren el resumen del detalle (suite de `SquadTeamStatsCards` o del detalle de célula) y ajustarlas: una sola card de capacidad con las cifras, el porcentaje, lo libre, las partes del mix y la lectura del pie; sin la card "MIX BAU / TRANSFORMACIÓN" aparte.
- [x] 2.2 Cubrir el caso sin equipo (0/0, sin división por cero, estado vacío de la barra) y el de ocupación al tope/por encima si el mock lo permite.
- [x] 2.3 Correr `npx vitest run src/features/squads` y el lint sobre los archivos tocados, sin regresiones frente al baseline conocido.

## 3. Verificación en pantalla

- [x] 3.1 Levantar `pnpm dev:auth`, abrir el detalle de Backend Platform y confirmar: dos cards (Equipo y Capacidad), la de Capacidad con 2.8 / 3.8 FTE, 74% por severidad, barra con BAU 1.6 y Transf. 1.2, "1.0 libre" y "57% del esfuerzo va a operación" — el 2.8 una sola vez en el resumen.
- [x] 3.2 Comparar contra la fila de Backend Platform en "Ocupación por célula" de la Torre de control: misma célula, misma forma de lectura.
- [x] 3.3 Verificar el detalle de una célula sin equipo (estado vacío de la card) y que asignar/quitar personas recalcula la card.
