## 1. Application

- [x] 1.1 DTOs del contrato en `DataTransferObjects/ControlTowerDtos.cs`: `CapacityOverviewDto`, `OverviewPersonDto`/`OverviewAllocationDto`, `OverviewSquadDto`. Verificar: un test que serializa a JSON y comprueba los nombres exactos del contrato (`chapterFte`, `bauFte`, `transformationFte`, `freeFte`, `peopleUnassigned`, `peoplePartial`, `squadsAtCapacity`, `squadsWithoutTeam`, `marginPercentage`, `teamAvailableFte`).
- [x] 1.2 Crear `ControlTower/ChapterCapacityOverviewCalculator.cs`: el FTE del chapter con `FteMath` sobre todas las personas y asignaciones (sin pasar por `SquadAggregates`); las personas con margen (sin célula o dedicación < 100 %, ordenadas sin célula primero y luego por margen descendente); las células (todas, con `SquadAggregates.Build` una sola vez, ordenadas sin equipo primero, luego al tope —`AllocatedFte >= TeamAvailableFte` con `MemberCount > 0`—, luego el resto por menor margen); los cinco conteos (`peopleTotal`, `peopleUnassigned`, `peoplePartial`, `squadsAtCapacity`, `squadsWithoutTeam`) con la misma definición que ordena las listas. Verificar con tests: persona al 100 % no aparece en `people`; célula sin equipo no cuenta como "al tope"; chapter sin personas responde ceros sin excepciones; nadie con margen responde `people` vacío; `freeFte` negativo cuando el chapter está sobre-asignado no se acota a 0.
- [x] 1.3 `GetChapterCapacityOverviewUseCase` (`GET /chapter/capacity-overview`), sin parámetros. Verificar con test: el DTO resultante trae los mismos números que devuelve el calculador sobre el mismo fixture.
- [x] 1.4 Registrar el use case en `Application/DependencyInjection` bajo `// Torre de control`. Verificar: build.

## 2. WebApi

- [x] 2.1 `ControlTowerEndpoints`: `GET /chapter/capacity-overview` con su `Produces` (200). Verificar: Swagger lista la operación bajo `/api/v1/chapter`.
- [x] 2.2 `Swagger/Examples/ControlTowerExamples.cs` con una persona sin célula, una de dedicación parcial, una célula sin equipo y una al tope. Verificar: Swagger muestra el ejemplo.

## 3. Verificación

- [x] 3.1 `dotnet build` + `dotnet test` en verde (sólo las fallas pre-existentes de `RestClientBehaviorTests`).
- [x] 3.2 Smoke con Postgres local (`curl -sk`): `GET /chapter/capacity-overview` trae `chapterFte`/`bauFte`/`transformationFte`/`freeFte` coherentes con las semillas, `people` con las personas sembradas sin célula o parciales (ninguna al 100 %), `squads` con las cinco células sembradas en el orden esperado (sin equipo, al tope, resto), y los cinco conteos coherentes con esas listas.
- [x] 3.3 `backend/ENDPOINTS.md`: la fila de Torre de control a 🟢, total del resumen actualizado.
