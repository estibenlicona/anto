## Why

La línea de expertise —el chapter: Backend, QA, AS-400…— es la unidad de gestión que agrupa personas transversalmente a las células, y hoy no existe en la plataforma. Está asumida: `Person.chapterId` se guarda siempre en `null`, y el detalle de persona muestra la línea y su lead desde una constante fija del mock (`CHAPTER = { name: "Backend", leadName: "Esteban Licona" }`). Mientras eso siga así, la plataforma solo puede operar un chapter, la Torre de control suma el FTE de todas las personas como si fueran una sola línea, y no hay dónde responder de quién depende una persona.

Este change crea el maestro de líneas y lo pone a trabajar: una línea sabe quién la lidera, a quién agrupa y cuánta capacidad tiene. No es el CRUD lo que resuelve el problema —es que el `chapterId` deje de ser `null` y que el resto de la plataforma pueda leerlo.

## What Changes

- Nueva pantalla de Administración **Líneas** en `/app/admin/lineas`: listado de las líneas a la izquierda y el detalle de la línea abierta a la derecha, con el mismo patrón índice+detalle de la pantalla de Habilidades.
- **Línea de expertise**: nombre, código corto (el que se usa como etiqueta en listados), descripción de una línea, estado (activa | archivada) y su lead.
- **Lead de la línea**: cada línea señala a una persona registrada como su Chapter Lead. Es quien responde por la línea, así que una línea activa sin lead se marca como incompleta. El lead pertenece a la línea que lidera.
- **Personas de la línea**: desde el detalle se asignan personas a la línea y se mueven de una línea a otra. Una persona pertenece a lo sumo a una línea; puede no tener ninguna, y esas quedan visibles como "sin línea" para poder repartirlas. Mover a alguien no toca su asignación a células: son ejes distintos.
- **Resumen de capacidad por línea**: cada línea muestra su conteo de personas, su FTE disponible, cuánto de ese FTE está asignado a células y cuánto queda libre, calculado sobre las personas de la línea. Es la lectura que hace comparable una línea con otra.
- **Archivar en vez de borrar**: una línea con personas no se elimina; se archiva, y archivar exige antes vaciarla. Una línea archivada deja de ofrecerse al asignar personas pero se sigue viendo en la ficha de quien la tuvo.
- El detalle de persona **deja de leer la constante del mock**: muestra el nombre de la línea y el lead reales de la persona, o que no tiene línea asignada.
- Nueva entrada **Líneas** en el grupo "Configuración" del menú de Admin, con el icono `team`.
- Handlers de mock para las líneas, sus personas y su resumen de capacidad.

### Fuera de alcance

- Filtrar por línea el resto de las pantallas (Personas, Células, Torre de control): la Torre sigue agregando sobre todas las personas. Este change deja el dato disponible; segmentar cada pantalla es un change por pantalla.
- Permisos por línea: que un Chapter Lead solo vea la suya. Hoy no hay autorización real y los roles son `admin` y `chapter-lead` a secas.
- Jerarquías de líneas (sublíneas) e histórico de a qué línea perteneció una persona: se guarda la línea actual, no la línea en el tiempo.
- Que el Chapter Lead edite su propia línea desde `/app/lead`. La gestión es de Admin.

## Capabilities

### New Capabilities

- `expertise-lines`: maestro de líneas de expertise con su lead, las personas que agrupa, su resumen de capacidad y el ciclo activa/archivada.

### Modified Capabilities

- `admin-shell`: la navegación lateral gana la entrada "Líneas" en el grupo "Configuración" y su pantalla deja de ser placeholder.
- `people`: la persona gana la línea de expertise a la que pertenece; el detalle de persona muestra la línea y el lead reales en vez de un valor fijo.
- `api-mocking`: handlers nuevos de líneas de expertise, y el mock de detalle de persona resuelve la línea desde el maestro.

## Impact

- Frontend: nueva feature `src/features/expertise-lines` (service, adapter, hooks, contenedor y componentes), página `AdminExpertiseLinesPage`, ruta `/app/admin/lineas` y entrada de navegación en `admin-shell/navigation.ts`.
- Frontend existente: `personService` ya declara `chapterId`; `personDetailService`/`PersonDetailAdapter` ya declaran `chapterName` y `chapterLeadName` — cambian de origen, no de forma. `PersonDetailHeader` debe contemplar la persona sin línea.
- Mocks: `expertise-lines.handlers.ts` + semillas con las líneas del dominio (Backend, QA, AS-400, Frontend…), repartiendo entre ellas las personas ya sembradas y dejando algunas sin línea a propósito. `personDetail.handlers.ts` deja de usar la constante `CHAPTER` de `personDetail.seeds.ts`.
- Backend: sin cambios en este change; la pantalla trabaja contra endpoints mockeados como las demás.
- tuip: sin cambios. Se compone con `Table`, `Card`, `Tag`, `Input`, `Textarea`, `Select`, `Drawer`, `Alert` y el icono `team`, todos publicados.
