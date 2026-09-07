# Diseño — Separar la pertenencia a una línea de expertise del chapter

## Context

Ver proposal.md. Investigación confirmada contra el frontend: `frontend/src/features/people/services/personDetailService.ts` (comentario explícito: *"La línea de expertise sigue existiendo y sigue teniendo su líder, pero no decide alcance — por eso son dos pares de campos y no uno"*), `frontend/src/mocks/handlers/chapters.ts` (Chapter: entidad propia de alcance/autorización, resuelta por `oid` de Entra del líder) y `frontend/src/mocks/handlers/expertise-lines.handlers.ts` (línea de expertise: maestro y membresía propios, independientes de `chapterId`).

## Goals / Non-Goals

**Goals**
- `Person.ExpertiseLineId` como el único mecanismo de pertenencia a una línea, espejo exacto de `ChapterId` en forma pero independiente en dato.
- Cero cambio de contrato, cero cambio de comportamiento observable de `backend-modulo-lineas-expertise` — sólo el campo que usa por debajo.

**Non-Goals**
- Construir el scope por chapter (claims) — sigue pendiente, ahora con el campo correcto esperándolo sin usar.
- `Detalle de persona` — cambio siguiente, que si esto no se corrige no puede responder `chapterName`/`expertiseLineName` como campos genuinamente distintos.

## Decisions

1. **`ExpertiseLineId` es un espejo literal de `ChapterId`, no una reinterpretación.** Mismo tipo (`Guid?`), mismo patrón de métodos (`AssignToExpertiseLine`/`RemoveFromExpertiseLine` calcan `AssignToChapter`/`RemoveFromChapter` — validan `Guid.Empty`, asignan, `MarkUpdated()`), mismo patrón de repositorio (`GetByExpertiseLineAsync` calca `GetByChapterAsync`). No se reutiliza ni se renombra `ChapterId`: se queda exactamente como está, para el día en que el scope por chapter se construya sobre él sin sorpresas.
2. **Ningún endpoint, DTO, validación ni mensaje de Líneas de expertise cambia.** Es una sustitución mecánica: donde un use case decía `person.ChapterId`, `person.AssignToChapter(...)`, `person.RemoveFromChapter()` o `personRepository.GetByChapterAsync(...)`, ahora dice lo mismo con `ExpertiseLine` en el nombre. El comportamiento observado por el contrato es idéntico al que ya se probó en `backend-modulo-lineas-expertise`.
3. **Las tres líneas sembradas se resiembran con el campo correcto** — no hay dato de producción que migrar, así que no hace falta un backfill: basta con que las semillas usen `AssignToExpertiseLine` y con recrear la base local.

## Risks / Trade-offs

- [Se toca un módulo ya archivado] → el cambio es aislado y mecánico (sustituir un campo por otro del mismo tipo y forma); los tests existentes de Líneas de expertise verifican que el comportamiento no cambió, sólo el campo de soporte.

## Migration Plan

Una columna nueva (`People.ExpertiseLineId`, nula) con su índice; `ChapterId` no se toca. Orden: Domain (`Person` + `IPersonRepository`) → Application (nueve use cases + mapeo, sustitución mecánica) → Infrastructure (columna, repositorio, migración, semillas) → tests → smoke. Rollback: quitar la columna nueva; `ChapterId` queda intacto y `backend-modulo-lineas-expertise` vuelve a su estado (incorrecto) anterior.

## Open Questions

(ninguna)
