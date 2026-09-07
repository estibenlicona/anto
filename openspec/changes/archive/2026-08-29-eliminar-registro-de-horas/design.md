## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **Todo lo de horas vive en dos sitios, y en ninguno hay backend.** En `features/people` el detalle recibe del mock `realFte`, `currentReport` (`CurrentHoursReportDto`) y `sprints` (`SprintHoursDto[]`); `PersonDetailAdapter` deriva de ahí `hoursWithinTolerance`, `expectedHours` y `overReportingStreak`; los consumen `PersonDetailStatsCards` (dos de las tres tarjetas y el mapa `REPORT_STATUS`), `HoursBySprintPanel`, `PersonAssignmentPanel` (la señal "Reporta más de lo asignado") y `PersonDetailContainer` con `usePersonDetailMutations().validateHours`. En Admin, `SprintConfig` lleva `hoursPerWeek` y `toleranceHours`, que el mock valida y la página edita junto a dos tarjetas que explican el reporte de horas. El backend .NET no tiene entidades ni endpoints de horas.
- **El mock de detalle mezcla lo que se va con lo que se queda.** `personDetail.seeds.ts` siembra `HOURS_BY_PERSON`, `SPRINTS`, `SPRINT_HOURS`, `TOLERANCE` y las fechas del sprint actual junto a las identidades DevOps y las bandas de costo, y `computePersonDetail` calcula el FTE real a partir de las horas validadas.
- **La spec ya apunta a DevOps.** `backlog` dice que "sólo lo clasificado cuenta como FTE real"; el indicador de horas era un puente provisional que nunca se conectó.
- **Decisiones ya tomadas con el usuario:** se retira también el calendario (horas por semana y tolerancia), y *Asignado vs real* pasa a ser *Asignado*.

## Goals / Non-Goals

**Goals:**

- Que la ficha no muestre ninguna cifra que no tenga origen: sin horas, sin FTE real inventado.
- Dejar el contrato del detalle y el de la configuración de sprints con sólo lo que existe.
- Que la retirada sea completa —código, mocks, pruebas, specs y doc— y no un `display: none`.

**Non-Goals:**

- Derivar el FTE real de los items de DevOps.
- Tocar el ajuste *Horas extra* de prefacturas, ni el icono `hours-log`.
- Cambiar el calendario de sprints más allá de quitarle lo que era de horas.

## Decisions

- **Retirar, no ocultar.** Se borran tipos, campos, seeds, handlers, componentes y pruebas. Dejar `currentReport` en `null` o la tarjeta detrás de una bandera mantendría vivo un contrato que nadie va a servir y obligaría a seguir sembrándolo. *Alternativa considerada:* esconder con una feature flag "hasta que exista el reporte" — descartada porque el reporte de horas no está previsto: el camino es DevOps.
- **`Asignado` conserva la barra y lo libre.** La tarjeta muestra `FTE asignado / FTE disponible`, la barra de dedicación y "<n> FTE libre" (o "1.0 FTE libre" sin célula). Desaparecen el marcador del real sobre la barra, "Real último sprint" y la diferencia en puntos. La lectura que queda —cuánto tiene y cuánto le sobra— es la que el Chapter Lead usa para asignar; la que se pierde —cuánto trabajó— vuelve con DevOps. *Alternativa:* quitar la tarjeta entera y dejar sólo DevOps — descartada por el usuario: lo asignado es el dato de capacidad de la ficha.
- **Dos indicadores, sin relleno.** La fila pasa de tres tarjetas a dos; no se inventa una tercera. La rejilla usa las mismas columnas del sistema (`sm:grid-cols-2`) y en `lg` las dos tarjetas comparten el ancho. La spec de `people` dice "dos indicadores" y el escenario nuevo lo fija.
- **La columna izquierda queda con Asignación.** Sin *Horas por sprint*, la izquierda tiene un solo panel y la derecha dos (Stacks, Ficha). Se mantiene la disposición `xl:grid-cols-[7fr_5fr]`: reordenar paneles para "equilibrar" sería un rediseño que este change no pide, y Asignación es el panel más ancho de la página.
- **La señal de la asignación se reduce a SFIA.** `PersonAssignmentPanel` deja de recibir `overReportingStreak`; la fila de señales muestra una. Se mantiene el componente de señal para que la lectura de SFIA no cambie de forma.
- **Contrato del detalle.** `PersonDetailDto` pierde `realFte`, `currentReport` y `sprints`; se borran `SprintHoursDto`, `CurrentHoursReportDto` y `HoursReportStatus`; `personDetailService.validateHours` y `usePersonDetailMutations.validateHours` desaparecen (el hook queda sólo con `linkIdentity`). `PersonDetailAdapter` pierde `sprints`, `expectedHours`, `overReportingStreak`, `hoursWithinTolerance` y su tipo `PersonDetailSprint`.
- **Mock del detalle.** Se borran `HOURS_BY_PERSON`, `SPRINTS`, `SPRINT_HOURS`, `TOLERANCE`, `CURRENT_SPRINT`, `CURRENT_SPRINT_CLOSES_AT`, `CURRENT_SPRINT_SUBMITTED_AT` y las funciones `sprintsOf`, `currentReportOf`, `realFteOf`; el handler deja de registrar `POST /people/:id/hours/:sprint/validate`. Las semillas que quedan (identidades, usuarios de DevOps, bandas, SFIA requerido, cargos pedidos, contratos) no cambian.
- **Configuración de sprints.** `SprintConfig = { weeks, sprintsPerQuarter }`. El handler quita `hoursPerWeek` y `toleranceHours` de la validación y del estado inicial; un `PUT` con sólo esos dos campos válidos responde `200`. La página deja los dos campos y quita las tarjetas "Reporte de horas por sprint" y "Dashboard de capacidad · convierte horas → FTE"; la de "Roadmap" se queda porque describe el calendario, no las horas. *Alternativa:* conservar `hoursPerWeek` "por si sirve para FTE" — descartada: el FTE de la plataforma es dedicación declarada, no horas.
- **El doc de roles se corrige, no se reescribe.** Se quitan las menciones al reporte de horas (rol Colaborador, funciones y pantalla `/app/lead/horas` del Líder de Expertise, función del Líder Técnico, fila del calendario) sin cambiar el resto del documento.

## Risks / Trade-offs

- **[Las pruebas del detalle dependen de fixtures con horas]** → `fixtures.ts`, `PersonDetailAdapter.test`, `PersonDetailComponents.test`, `PersonDetailContainer.test`, `usePersonDetail.test` y `personDetail.handler.test` se actualizan en el mismo change; el test "validar horas…" del contenedor se borra. Es trabajo mecánico pero extenso: por eso va en tareas separadas por archivo.
- **[Alguien todavía lee `realFte` fuera de personas]** → No hay consumidores fuera de `features/people` y el mock (verificado por búsqueda). TypeScript lo confirma al compilar tras quitar el campo del DTO.
- **[El Admin "Estado de la plataforma" nombra el calendario]** → Sólo lo nombra como parámetro; no lista sus campos. No cambia.
- **[Pérdida de lectura para el Chapter Lead]** → La ficha deja de responder "¿cuánto trabajó?". Es deliberado y la spec lo dice; la respuesta vuelve cuando el FTE real salga de DevOps.

## Migration Plan

1. Contrato y adapter: quitar horas del DTO, del servicio, de las mutaciones y del adapter, con sus pruebas.
2. Mock del detalle: seeds, cálculo y endpoint de validación, con sus pruebas.
3. Pantalla: tarjetas, panel de horas, señal de asignación, contenedor, con sus pruebas y fixtures.
4. Calendario de sprints: contrato, mock, hook, página y pruebas.
5. Doc de roles, lint, suite completa y verificación visual en `pnpm dev:mock`.

Sin rollback especial: revertir el change devuelve el mock de horas tal como estaba.
