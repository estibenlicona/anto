# Backend: separar la pertenencia a una línea de expertise del chapter

## Why

`backend-modulo-lineas-expertise` (archivado) reutilizó `Person.ChapterId`/`AssignToChapter`/`RemoveFromChapter`/`GetByChapterAsync` — ya existentes de antes, sin pantalla que los consumiera — como el mecanismo de pertenencia a una línea de expertise. Es un error: el propio contrato distingue los dos conceptos. `PersonDetailDto` (capability `people`, `Detalle de persona`) trae **dos pares de campos separados** — `chapterName`/`chapterLeadName` y `expertiseLineName`/`expertiseLineLeadName` — precisamente porque "chapter" es el alcance de autorización (qué personas ve un Líder de Expertise; el "scope por chapter (claims)" que casi todos los módulos anteriores dejan pendiente) y "línea de expertise" es una agrupación de disciplina con su propio maestro, sin relación con ese alcance. Confundir los dos deja sin poder implementarse correctamente `GET /people/{id}/detail`, que necesita responder ambos por separado — y es la razón por la que este arreglo aparece justo antes de proponer Detalle de persona.

## What Changes

- **`Person` gana `ExpertiseLineId` (`Guid?`, nuevo campo) con `AssignToExpertiseLine`/`RemoveFromExpertiseLine`** — mismo patrón exacto que `ChapterId`/`AssignToChapter`/`RemoveFromChapter`, que quedan **intactos** y reservados para cuando exista el ajuste de seguridad de scope por chapter.
- **`IPersonRepository` gana `GetByExpertiseLineAsync`**, espejo de `GetByChapterAsync` ya existente.
- **Los nueve use cases y el mapeo de Líneas de expertise pasan de `ChapterId`/`AssignToChapter`/`RemoveFromChapter`/`GetByChapterAsync` a `ExpertiseLineId`/`AssignToExpertiseLine`/`RemoveFromExpertiseLine`/`GetByExpertiseLineAsync`** — ningún endpoint, DTO ni regla de negocio cambia; sólo el campo de `Person` que la pertenencia usa por debajo.
- **Las semillas de Líneas de expertise pasan a `AssignToExpertiseLine`.**
- **Migración nueva**: columna `ExpertiseLineId` en `People`, con su índice — `ChapterId` no se toca.
- Fuera de alcance: el propio `Detalle de persona` (cambio siguiente) y el ajuste de scope por chapter, que sigue pendiente.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — corrige una implementación interna de `openspec/specs/expertise-lines/spec.md` sin cambiar ningún requirement ni el contrato. El cambio declara `skip_specs`.)

## Impact

- `backend/src`: Domain (`Person` gana `ExpertiseLineId`/`AssignToExpertiseLine`/`RemoveFromExpertiseLine`; `IPersonRepository` gana `GetByExpertiseLineAsync`), Application (nueve use cases y `ExpertiseLineMappings` de Líneas de expertise repuntados), Infrastructure (columna e índice nuevos, `PersonRepository.GetByExpertiseLineAsync`, semillas).
- `backend/tests`: los tests de Líneas de expertise que armaban sus fixtures con `AssignToChapter`/`ChapterId` pasan a `AssignToExpertiseLine`/`ExpertiseLineId`.
- Sin cambios al contrato: `backend/oas.json` no cambia — esto es una corrección interna, no un ajuste de superficie.
- Migración nueva (columna `ExpertiseLineId` en `People`, nula, sin dato que migrar — las tres líneas sembradas se resiembran con el campo correcto).
