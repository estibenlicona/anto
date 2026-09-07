# Diseño — Backend: módulo Líneas de expertise

## Context

Ver proposal.md. Formas objetivo en `backend/oas.json` (`ExpertiseLineDto`, `ExpertiseLineDetailDto`, `LineLeadDto`, `LinePersonDto`/`LinePersonAllocationDto`, `LineCapacityDto`, `RosterPersonDto`, `UpsertExpertiseLineRequest`, `SetLineLeadRequest`, `AddLinePeopleRequest`, enum `ExpertiseLineStatus`). Las reglas de pantalla viven en `openspec/specs/expertise-lines/spec.md`.

El lado de `Person` ya existe: `ChapterId` (`Guid?`, sin FK — mismo patrón que `Allocation.SquadId`), `AssignToChapter(Guid)`/`RemoveFromChapter()` y `IPersonRepository.GetByChapterAsync(chapterId)`, con su columna, su índice y su migración ya aplicados. Existe además `UseCases/People/AssignPersonToChapter` con sus propios endpoints `PUT/DELETE /people/{id}/chapter`, pero esas rutas están fuera del contrato fijo (`ENDPOINTS.md`, sección "Existente en .NET sin consumidor") — no se tocan ni se reutilizan como endpoints, sólo se reutiliza el método de dominio que ya escriben.

## Goals / Non-Goals

**Goals**
- Las 10 rutas en 🟢, con las validaciones de unicidad, transferencia de lead y capacidad exactas del spec.
- Cero cambios en `Person`/`Infrastructure` de Personas — todo lo que ese lado necesita ya existe.

**Non-Goals**
- Tocar o migrar `/people/{id}/chapter` (PUT/DELETE) — quedan como están, fuera del contrato.
- Scope por chapter (claims) — igual que los trece módulos anteriores.

## Decisions

1. **`ExpertiseLine` es el único agregado nuevo; la pertenencia de una persona vive enteramente en `Person.ChapterId`.** No hay tabla puente ni colección de miembros en `ExpertiseLine` — el conteo y el listado de personas de una línea se resuelven en cada petición con `IPersonRepository.GetByChapterAsync(lineId)`, igual que `Allocation` resuelve su célula por `SquadId` sin navegación. *Alternativa descartada*: guardar una lista de `PersonId` en `ExpertiseLine` — duplicaría lo que `Person.ChapterId` ya de por sí garantiza (una persona pertenece a lo sumo a una línea, porque el campo es escalar) y abriría la puerta a que los dos lados se desincronizaran.

2. **Nombre único entre las líneas activas; código único entre todas, incluidas las archivadas.** Es literal del spec: el código es una etiqueta que no debe cambiar de significado aunque la línea se archive, así que dos líneas — una activa y una archivada — nunca comparten código; el nombre sí puede repetirse con una archivada, porque ésa ya no está en juego. El código se normaliza a mayúsculas al crear y al editar, nunca se compara sin normalizar antes.

3. **Designar lead mueve a la persona a la línea y le quita el lead a cualquier otra línea que lo tuviera, sin error.** `SetExpertiseLineLeadUseCase` llama `person.AssignToChapter(lineId)` (que ya cubre "mover desde la que tuviera": el campo es escalar) y además busca, entre todas las líneas, una cuyo `LeadId` sea esa persona y, si la encuentra y no es la misma línea, le limpia el lead. La pantalla ya impide elegir a alguien que lidera otra línea (selector deshabilitado), pero el servidor no depende de que el cliente respete esa regla — la corrige en silencio, sin 400, porque no es un dato inválido sino un estado que el propio sistema puede resolver sin ambigüedad.

4. **Tres transiciones de estado se tratan como error aunque el contrato no las enumere, con el mismo criterio que ya rige otros agregados del backend**: archivar una línea con personas (dice cuántas hay que mover primero, con el mensaje del spec), archivar una ya archivada, y reactivar una que no está archivada. Es el mismo trato que `Assessment.Close` (cerrar dos veces) o `SprintSnapshot.Seal` (sellar dos veces): el contrato no lista todos los 400 de cada agregado, pero una transición inválida sigue siendo un error real, no un no-op silencioso.

5. **Quitar al lead de su propia línea es 400, con el mismo criterio de la decisión 4.** `RemoveExpertiseLinePersonUseCase` compara `personId` contra `line.LeadId` antes de tocar nada; si coinciden, 400 con el mensaje del spec ("designar otro lead primero, o quitarle el rol"). Dejarlo pasar dejaría la línea con un lead que ya no le pertenece.

6. **La capacidad de una línea reutiliza `FteMath` exactamente como Torre de control, con una sola diferencia deliberada: acá el FTE libre se acota a 0.** `allocatedFte = FteMath.FteOfPercentages` sobre la dedicación vigente de cada persona de la línea (0 si no tiene asignación); `availableFte = FteMath.AvailableFteOf` sobre esas mismas personas; `freeFte = Math.Max(0, availableFte − allocatedFte)` — literal del spec de esta capability ("el FTE libre se muestra en cero en vez de en negativo"), a diferencia de Torre de control donde el mismo cálculo se deja negativo a propósito. Dos specs, dos reglas explícitas y distintas sobre el mismo número: ninguna es un error, cada una es lo que su propia pantalla pide.
   `unallocatedPercentage = freeFte / availableFte × 100`, o 0 cuando `availableFte` es 0 — sin dividir por cero.

7. **`ExpertiseLineDto` (listado) trae sólo `peopleCount`/`availableFte`; el desglose completo (`allocatedFte`/`freeFte`/`unallocatedPercentage`) sólo viaja en `LineCapacityDto`, dentro del detalle.** Es lo que el propio esquema del contrato ya distingue — no una omisión: el índice compara líneas a simple vista con dos números, el detalle explica de dónde salen.

8. **`GET /expertise-lines/people` (roster) resuelve el nombre de la línea de cada persona con las líneas ya cargadas, sin `N+1`**: una sola pasada trae todas las personas y todas las líneas, arma un diccionario `Id → Name` y lo cruza contra el `ChapterId` de cada persona.

## Risks / Trade-offs

- [Tres 400 no declarados en el contrato (archivar/reactivar dos veces, quitar al lead)] → mismo criterio ya aplicado en otros agregados del backend a doble transición inválida; ninguno inventa una regla que el spec no pida.
- [`freeFte` acotado a 0 acá pero no en Torre de control] → deliberado, cada spec lo pide distinto sobre el mismo cálculo base.
- [Sin scope por chapter] → igual que los trece módulos anteriores.

## Migration Plan

Una tabla nueva (`ExpertiseLines`), vacía salvo semillas de desarrollo; ninguna migración sobre `People` — `ChapterId` ya existe. Orden: Domain (`ExpertiseLineStatus` + `ExpertiseLine`) → Application (`LineCapacityCalculator`, DTOs, ocho use cases) → Infrastructure (configuración EF + repositorio + migración + semillas) → WebApi (endpoints + ejemplos) → tests → smoke → `ENDPOINTS.md`. Rollback: quitar las 10 rutas y la tabla nueva; `Person.ChapterId` queda intacto porque no le pertenece a este cambio.

## Open Questions

(ninguna)
