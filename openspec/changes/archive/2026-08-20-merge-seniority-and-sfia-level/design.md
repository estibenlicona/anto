## Context

`Person` hoy tiene dos value objects redundantes: `Seniority` (5 valores de texto sin escala: Junior/MidLevel/Senior/StaffEngineer/Principal) y `SfiaLevel` (4 niveles numéricos 1-4, con etiqueta Principiante/Competente/Avanzado/Experto). El propio dominio ya los trataba como una sola decisión — `Person.ChangeSeniority(Seniority, SfiaLevel)` cambia ambos juntos en un solo método, con un único evento `PersonSeniorityChangedEvent`. El Chapter Lead confirmó que no existe una escalera de seniority propia en el chapter: lo que hoy se llama "seniority" es, en la práctica, el nivel SFIA. Ver proposal.md - Why.

No hay migraciones EF ni una BD real desplegada (brecha ya documentada en cambios anteriores de Personas), así que este cambio no incluye una migración de datos real — solo el nuevo modelo y la migración del dataset en memoria/mock.

**Cambio pendiente aparte, fuera de este alcance**: `add-people-dashboard-cards` sigue abierto (pausado en las tareas 4.3/4.4, bloqueado por la extensión de `SegmentedBar` en tuip). Su código ya implementado (`GET /people/stats`, `computeStats` en el mock) incluye `bySfiaLevel` — ese campo queda obsoleto con este merge, pero se corrige en `add-people-dashboard-cards` vía `/opsx:update` después de que este cambio archive, no acá. Este cambio no toca `people.handlers.ts`'s `computeStats` más allá de lo que ya le corresponde por el merge de seniority (ver Decisions).

## Goals / Non-Goals

**Goals:**
- Un solo campo `Seniority` en `Person`, con la escala de 4 niveles que hoy tiene SFIA.
- Mismo cambio de forma reflejado en backend real, mock y frontend — el contrato es idéntico en ambos.
- Los 3 registros de ejemplo del mock migran de forma determinística (su seniority nuevo = su nivel SFIA viejo).

**Non-Goals:**
- No se migra ninguna base de datos real (no existe una desplegada).
- No se toca `add-people-dashboard-cards` — su corrección (una sola card de distribución en vez de dos, sin `bySfiaLevel`) es un `/opsx:update` aparte, después de que este cambio archive.
- No se toca la extensión de `SegmentedBar` en tuip — sigue siendo un change aparte, ya identificado.
- No se agrega ninguna escalera de seniority nueva ni configurable — el catálogo pasa a ser fijo, igual que el nivel SFIA lo era.

## Decisions

**El value object `SfiaLevel` se convierte en el nuevo `Seniority`**: mismo rango (1-4), mismas etiquetas (Principiante/Competente/Avanzado/Experto), misma forma de columna (int con conversión). El archivo `Domain/ValueObjects/SfiaLevel.cs` se renombra/reescribe como `Seniority.cs` (reemplazando el contenido del `Seniority.cs` viejo, que se elimina). `Person.Seniority` pasa a ser de este nuevo tipo; `Person.SfiaLevel` se elimina. `Person.ChangeSeniority(Seniority newSeniority)` pasa a un solo parámetro.

**Columna de BD**: una sola columna `Seniority`, tipo `int` con conversión a/desde el value object (mismo patrón que `SfiaLevel` ya usaba) — reemplaza la columna `Seniority` vieja (que era `string`, ancho 50). Como no hay BD real desplegada, no hace falta una migración EF para este cambio — el próximo `dotnet ef migrations add` sobre un entorno real ya parte del modelo nuevo.

**Migración del dataset mock/ejemplo**: cada persona de ejemplo migra su seniority al valor que hoy tiene su nivel SFIA, descartando el string viejo:

| Persona | Seniority viejo | Nivel SFIA viejo | Seniority nuevo |
|---|---|---|---|
| María González | Senior | 3 (Avanzado) | 3 (Avanzado) |
| Laura Ruiz | MidLevel | 2 (Competente) | 2 (Competente) |
| Carlos López | Principal | 4 (Experto) | 4 (Experto) |

**Catálogo `/catalogs/seniorities`**: pasa de devolver `string[]` (5 valores) a devolver `{value, label}[]` (4 niveles) — mismo shape que `/catalogs/sfia-levels` tenía. `/catalogs/sfia-levels` se elimina.

**Frontend — tipos**: `Seniority` pasa de `"Junior" | "MidLevel" | "Senior" | "StaffEngineer" | "Principal"` a `number` (1-4). `SfiaLevelOption` se renombra a algo genérico reutilizado para seniority (`{value: number; label: string}`), o simplemente se reutiliza tal cual con otro nombre de import — decisión de implementación, sin impacto en el contrato. `PersonDto`/`CreatePersonRequest`/`UpdatePersonRequest` pierden `sfiaLevel`/`sfiaLevelLabel`; `seniority` pasa a `number`, se agrega `seniorityLabel: string`.

**Formulario**: se quita el Select "Nivel SFIA" completo (`PersonFormDrawer.tsx`); el Select "Seniority" pasa a usar las opciones del nuevo catálogo, con el mismo formato de etiqueta que tenía el de SFIA (`"${value} · ${label}"`, ej. "3 · Avanzado").

**Tabla y filtro**: se quita la columna "SFIA" y el `FilterButton` "Nivel SFIA" de `PeopleList.tsx`; la columna "Seniority" muestra la etiqueta (ej. "Avanzado") en vez del string viejo; el `FilterButton` "Seniority" pasa a ofrecer los 4 niveles.

## Risks / Trade-offs

- [Es un cambio BREAKING del contrato de la API] → Aceptado explícitamente: no hay una BD real ni consumidores externos hoy, así que no hay compatibilidad hacia atrás que preservar.
- [`add-people-dashboard-cards` queda con código desalineado hasta su propio `/update`] → Documentado como seguimiento explícito, no se toca en este cambio para no mezclar dos alcances grandes en un mismo change.
- [Verificación end-to-end contra un backend real desplegado] → Sigue bloqueada por la falta de una BD real (misma brecha de siempre); se verifica con los tests de repositorio/use case sobre SQLite in-memory.
