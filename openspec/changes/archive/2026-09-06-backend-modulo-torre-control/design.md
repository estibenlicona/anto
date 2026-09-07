# Diseño — Backend: módulo Torre de control

## Context

Ver proposal.md. Forma objetivo en `backend/oas.json` (`CapacityOverviewDto`, `OverviewPersonDto`/`OverviewAllocationDto`, `OverviewSquadDto`). Las reglas de pantalla viven en `openspec/specs/control-tower/spec.md`; las fórmulas de FTE ya viven en código, no en un mock aparte — `Application/Common/FteMath.cs` documenta explícitamente que este módulo "responderá la misma pregunta" que Células, y `Application/Mappings/SquadAggregates.cs` ya calcula, por célula, exactamente los campos que `OverviewSquadDto` necesita (`AllocatedFte`, `BauFte`, `TransformationFte`, `PeopleAvailableFte` ↔ `teamAvailableFte`, `MemberCount`).

## Goals / Non-Goals

**Goals**
- La ruta en 🟢, con los mismos umbrales de margen y "al tope" que ya rige el spec y que Células ya aplica por célula.
- Cero código nuevo de cálculo de FTE: sólo orquestar `FteMath`/`SquadAggregates` a escala de chapter en vez de por célula.

**Non-Goals**
- El drawer de reasignación (aplica sobre `PUT/POST/DELETE /squads/{id}/allocations` y `/allocations/{id}`, ya 🟢).
- Filtros o paginación — el contrato no los declara, es una vista de resumen.
- Scope por chapter (claims) — igual que los doce módulos anteriores.

## Decisions

1. **El FTE del chapter se calcula con `FteMath` directamente sobre todas las personas y todas las asignaciones, sin pasar por `SquadAggregates`.** `chapterFte = FteMath.AvailableFteOf(todas las personas)`; `bauFte = FteMath.FteOfPercentages(todas las asignaciones, BauPercentage)`; `transformationFte` análogo con `TransformationPercentage`; `freeFte = chapterFte − bauFte − transformationFte`. Es la misma asimetría documentada en `FteMath`: el asignado no mira el `availableFte` de cada persona, así que `freeFte` puede en teoría ser negativo si el chapter está sobre-asignado — se responde tal cual, no se acota a 0, porque ocultarlo escondería justo la situación que el indicador existe para mostrar.

2. **Una persona tiene margen sin célula o con dedicación menor al 100 %; las al 100 % no viajan en `people`.** `marginPercentage = 100` sin asignación, `100 − dedicationPercentage` con asignación parcial. Orden: primero las sin célula (por nombre), luego las de dedicación parcial por margen descendente (por nombre en empate) — literal del spec, sin agregar un tercer criterio no pedido.

3. **`squads` trae todas las células, en tres grupos: sin equipo, al tope, resto por menor margen.** "Al tope" ⇔ `AllocatedFte >= TeamAvailableFte` **y** `MemberCount > 0` — una célula sin equipo tiene ambos en 0 y no debe contarse dos veces como "sin equipo" y "al tope". El margen de una célula (para ordenar el grupo "resto") es `TeamAvailableFte − AllocatedFte`, ascendente (la más cerca de llenarse aparece primero); empate por nombre. `squadsAtCapacity`/`squadsWithoutTeam` cuentan sobre el total de células, con la misma definición que ordena la lista — nunca una cifra distinta de la que se ve.

4. **Cada célula usa `SquadAggregates.Build` una sola vez para todas, igual que `GetSquadsUseCase`.** No se reimplementa el agregado por célula: se construye una vez con todas las asignaciones/personas/iniciativas del chapter y se lee por `Id`, mismo patrón ya establecido.

## Risks / Trade-offs

- [`freeFte` puede ser negativo] → es el comportamiento correcto de la fórmula asimétrica ya documentada en `FteMath`; ocultarlo sería mentir sobre la sobreasignación.
- [Sin scope por chapter] → igual que los doce módulos anteriores.

## Migration Plan

Sin datos que migrar y sin tabla nueva: todo se deriva en cada petición. Orden: Application (`ChapterCapacityOverviewCalculator`, DTOs, un use case) → WebApi (endpoint + ejemplos) → tests → smoke → `ENDPOINTS.md`. Rollback: quitar el endpoint; ningún otro módulo depende de Torre de control.

## Open Questions

(ninguna)
