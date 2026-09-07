# Tareas — Backend: módulo Ausencias

## 1. Domain

- [x] 1.1 Crear `ValueObjects/AbsenceType.cs` (catálogo cerrado estilo `PersonRole`: `Vacation`/Vacaciones, `Leave`/Permiso, `SickLeave`/Incapacidad, con `ValidValues` y `From`) y `ValueObjects/AbsenceStatus.cs` (`Requested`/Solicitada, `Approved`/Aprobada, `Rejected`/Rechazada). Verificar con `AbsenceTypeTests` y `AbsenceStatusTests`: los valores en el orden del contrato y `From` inválido lanza listando los válidos.
- [x] 1.2 Crear `Entities/Absence.cs` (`AggregateRoot`): ctor (personId no vacío, tipo, rango con fin ≥ inicio, marcas de media jornada) que nace `Requested`; guardas de la media jornada (las dos marcas iguales, sólo `Leave`, sólo un día) y del rango sin días hábiles, con los mensajes del mock. Verificar con `AbsenceTests`: nace Solicitada, fin anterior al inicio lanza, sábado suelto lanza, y las tres combinaciones inválidas de media jornada lanzan su mensaje.
- [x] 1.3 `Absence.Approve()` y `Absence.Reject(reason)`: aprobar sólo desde Solicitada; rechazar desde Solicitada o Aprobada exigiendo motivo no vacío; una Rechazada no cambia de estado. Verificar con `AbsenceTests`: aprobar dos veces lanza, rechazar una aprobada la deja Rechazada con el motivo, rechazar sin motivo lanza, y una Rechazada rechaza cualquier transición.
- [x] 1.4 Crear `Interfaces/IAbsenceRepository.cs` (`IRepository<Absence>` más `GetByPersonAsync` para el solape). Verificar: build.

## 2. Application — aritmética

- [x] 2.1 Crear `Common/BusinessDayMath.cs`: `CountBusinessDays(start, end, startsHalfDay, endsHalfDay)` (lunes a viernes, sin festivos; cada extremo marcado descuenta 0.5 sólo si cae en día hábil; un rango de un solo día descuenta una vez), `MonthBounds(month)` (null si no es `YYYY-MM`), `ClampRange(...)` y `BusinessDaysInMonth(...)`. Verificar con `BusinessDayMathTests` contra los números del mock: una semana L–V da 5, un fin de semana da 0, un permiso de un día con media jornada da 0.5, un rango de 3 días con los dos extremos a media da 2, y un mes tipo da sus días hábiles.
- [x] 2.2 `BusinessDayMath` para el recorte contra un mes: la marca de media jornada se aplica sólo cuando el extremo del tramo es el extremo real de la ausencia. Verificar con `BusinessDayMathTests`: una ausencia con las dos marcas que cruza el fin de mes suma, entre los dos meses, exactamente los días hábiles del rango completo — no medio día menos.

## 3. Application — DTOs, contexto y use cases

- [x] 3.1 DTOs del contrato en `DataTransferObjects/AbsenceDtos.cs`: `AbsencesMonthDto`, `AbsenceDto`, `AbsenceSquadImpactDto`. Verificar: un test que serializa a JSON y comprueba los nombres `monthBusinessDays`, `businessDaysInMonth`, `startsHalfDay`, `endsHalfDay`, `providerName`, `rejectReason`, `squadImpacts`, `dedicationPct`, `fteImpact`.
- [x] 3.2 Crear `Absences/AbsenceContext.cs` (patrón `InitiativeContext`): se construye desde personas, compañías y asignaciones; resuelve nombre, proveedor (nulo si es de planta) y `ToDto(absence, month)` con los días del rango, los días dentro del mes y los impactos por célula (días en el mes ÷ días del mes × FTE disponible × dedicación/100, sin redondear). Verificar con `AbsenceContextTests`: persona en dos células reparte 60/40, persona sin asignación responde `squadImpacts` vacío, y persona de proveedor trae su nombre.
- [x] 3.3 `GetAbsencesByMonth` (400 si el mes falta o no es `YYYY-MM`; devuelve las que tocan el mes ordenadas por fecha de inicio, con `monthBusinessDays`). Verificar con `AbsenceUseCaseTests`: mes inválido lanza 400 con el mensaje, una ausencia que sólo toca parcialmente el mes aparece, y una fuera del mes no.
- [x] 3.4 `CreateAbsence` con su validador (400: persona inexistente y solape con otra no rechazada de la misma persona; las demás guardas vienen del dominio traducidas a 400). Verificar con `AbsenceUseCaseTests`: nace Solicitada, solape con una Solicitada o Aprobada lanza, solape con una Rechazada **no** lanza, persona inexistente lanza.
- [x] 3.5 `UpdateAbsenceStatus` con el cuerpo `{ status, reason? }`: 404 si no existe; 400 con estado inválido, aprobación de algo que no está Solicitado, cambio sobre una Rechazada, o rechazo sin motivo. Verificar con `AbsenceUseCaseTests`: los cuatro 400 con su mensaje, y aprobar y luego rechazar deja Rechazada con el motivo.
- [x] 3.6 Registrar los tres use cases y el validador en `Application/DependencyInjection` bajo `// Absences`. Verificar: build y el test de DI que ya resuelve el contenedor.

## 4. Infrastructure

- [x] 4.1 `AbsenceConfiguration` (tabla `Absences`; `StartDate`/`EndDate` como `DateOnly`; tipo y estado con converter a string ≤20; `RejectReason` nulable ≤500; índice por `PersonId`) y `AbsenceRepository`; `DbSet` en `ApplicationDbContext` y registro en DI. Verificar con un test sobre Sqlite en memoria: guardar una ausencia con media jornada y motivo, releerla y obtener los mismos valores.
- [x] 4.2 Semillas: cinco ausencias relativas al mes en curso, por nombre de persona con asignación — vacaciones aprobadas, incapacidad aprobada que cruza el fin de mes, permiso de media jornada solicitado, vacaciones solicitadas y permiso rechazado con motivo. Verificar: `dotnet run` y `GET /absences?month=<mes actual>` devuelve las cinco.

## 5. WebApi y contrato

- [x] 5.1 `AbsencesEndpoints`: `GET /absences` (query `month`), `POST /absences` (201) y `PUT /absences/{id}/status`; `Produces` con 200/201, 400 y 404. Verificar: Swagger lista las tres operaciones bajo `/api/v1/absences`.
- [x] 5.2 `Swagger/Examples/AbsencesExamples.cs` con el mes, la ausencia, el alta y el cambio de estado. Verificar: Swagger muestra los ejemplos.
- [x] 5.3 Corregir `backend/oas.json`: `UpdateAbsenceStatusRequest` pasa a `{ status, reason? }` con `reason` descrito como obligatorio al rechazar. Verificar: `npx @redocly/cli lint backend/oas.json` sin errores y `node backend/tools/contract-coverage.mjs` sigue 88/88.

## 6. Verificación

- [x] 6.1 `dotnet build` + `dotnet test` en verde (solo las 9 fallas pre-existentes de `RestClientBehaviorTests`).
- [x] 6.2 Smoke con InMemory (`curl -sk`, `Idempotency-Key` en POST y PUT): `GET /absences?month=<actual>` con las cinco semillas, sus días y sus impactos; sin `month` y con `month=2026-13` → 400; `POST` válido → 201 en Solicitada; `POST` con fin anterior al inicio, con media jornada de vacaciones, con media jornada de tres días, sobre un sábado, con persona inexistente y solapando otra → 400 con su mensaje; `PUT status` aprobando → 200 y el impacto del mes la incorpora; aprobar la ya aprobada → 400; rechazar la aprobada con motivo → 200 y deja de contar; rechazar sin motivo → 400; tocar la rechazada → 400; id inexistente → 404.
- [x] 6.3 `backend/ENDPOINTS.md`: Ausencias 3🟢 con las reglas al día, total 42→45, y corregir la nota que hoy dice que los días hábiles excluyen festivos —son lunes a viernes, sin festivos— dejando anotado que el scope por chapter sigue pendiente.
