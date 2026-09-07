# Design

## Contexto

`Person.ExpertiseLineId` (nullable) y `IExpertiseLineRepository` ya existen desde `backend-modulo-lineas-expertise`/`backend-fix-expertise-line-membership`. No hace falta ningún dato nuevo — sólo cablear la lectura que faltaba.

## Decisiones

1. **Un use case de una sola consulta encadenada, sin contexto compartido.** A diferencia de `PersonDetail` (que compone cinco módulos), acá sólo hace falta `IPersonRepository.GetByIdAsync` + `IExpertiseLineRepository.GetByIdAsync` — no amerita un `*Context` propio.
2. **`id`/`name` nulos cuando la persona no tiene línea, nunca 404 en ese caso.** El único 404 es persona inexistente; "sin línea" es un estado válido y es exactamente lo que el stub ya respondía por defecto.
3. **No se valida que la línea siga existiendo/activa.** Si `ExpertiseLineId` apunta a una línea archivada, el nombre se resuelve igual (una línea archivada sigue teniendo nombre) — mismo criterio que otros lugares del backend que muestran nombres de entidades archivadas sin filtrarlas.

## Plan de migración

Sin datos que migrar. Orden: Application (use case) → WebApi (endpoint) → tests → smoke → `ENDPOINTS.md`. Rollback: revertir `PeopleEndpoints.GetExpertiseLineAsync` al stub estático.
