## Why

El modelo de balance de carga es correcto pero la pantalla que lo muestra pide más de lo que un Líder de Expertise tiene en una pasada de dos minutos. Cinco señales son un vocabulario que hay que aprender, y la del medio —**Revisar**— no dice qué hacer: no es una decisión de carga ni es "está bien", así que la fila se queda ahí sin resolverse. La fila tampoco dice **cuánto** se desvía alguien: "30 SP · habitual 22" obliga a hacer la resta mentalmente, y el umbral contra el que se juzga esa resta sólo se ve entrando al dashboard. Y el listado sólo sabe hablar del sprint en curso: para mirar el sprint pasado de todo el chapter hay que abrir a cada persona, una por una.

El rediseño que el usuario aprobó como referencia resuelve las tres: **cuatro señales** en vez de cinco, **la desviación y su tolerancia en la propia fila**, y un **navegador de sprint** que mueve el listado entero de un sprint a otro.

## What Changes

- **BREAKING — La señal pasa de cinco valores a cuatro.** Se retira **Revisar** y **Balanceado** se renombra **Carga habitual**. Lo que hoy queda en Revisar cae a *Posible sobreasignación* / *Posible subasignación* según su dirección, o a *Carga habitual* si no hay concurrencia. La escala de agregación se recalibra: dos evidencias concordantes —o una fuerte— ya alcanzan la señal accionable; evidencias en direcciones opuestas quedan en *Carga habitual*.
- **BREAKING — El modificador de célula deja de bajar la señal.** Pasa a ser una **anotación** junto a ella ("la célula se comporta igual"): sin escalón intermedio, bajar un peldaño escondería a una célula entera desviada. El Líder de Expertise ve el caso y decide.
- **La capacidad se lee también en horas.** El Calendario de sprints gana **Horas por sprint**; la capacidad de cada colaborador se expresa como `FTE disponible × horas por sprint`, con el descuento por festivos y ausencias aprobadas al lado ("72 h · −8 h por ausencias"). Nadie reporta horas: se derivan de los días que ya se miden.
- **La desviación y su tolerancia viajan en la fila.** La columna pasa a *Demanda vs habitual* y muestra "30 SP · habitual 22 · **+36 %**", con la barra marcando el habitual y el pie diciendo "Tolerancia ±25 %" cuando se sale de ella y "Dentro de la tolerancia" cuando no.
- **BREAKING — El listado gana navegador de sprint.** La franja del breadcrumb lleva `‹ S18 · 17 ago – 30 ago ›` con la marca del sprint en curso, y la columna Sprint desaparece de la tabla: el sprint es del listado entero, no de cada fila. `GET /dedication/collaborators` acepta `sprint`.
- **Los indicadores de cabecera pasan a las cuatro señales** con su punto de color: *Posible sobreasignación* · *Posible subasignación* · *Carga habitual* · *No evaluables*. La subasignación cambia de rol informativo a **advertencia**: es una decisión de carga, no un dato de contexto.
- **La toolbar se simplifica**: el filtro de célula pasa de desplegable a **chips en línea**, se retira el filtro por señal —las tarjetas ya separan por señal— y a la derecha aparece el conteo "13 de 13 personas".
- **La columna se llama Foco** y se lee como un medidor de cuatro tramos con "2 iniciativas · 4 HUs" debajo, en vez de "WIP 4": el WIP es jerga que la fila no necesita explicar, "abiertas" no distingue nada porque es la única clase de HU que se cuenta, y el medidor deja barrer la columna sin leer cifra por cifra.
- **La columna de célula muestra las iniciativas del sprint**, no la iniciativa activa de la célula: chips con las que tocó, y "+N" cuando son varias.
- **El dashboard, la ficha y el badge heredan el vocabulario nuevo**, para que las cuatro superficies digan lo mismo.

### Fuera de alcance

- El modelo de evidencias, sus seis fuentes y sus umbrales no cambian: cambia cómo se agregan en señal y cómo se rotulan, no qué se mide.
- El snapshot sellado, la ventana de histórico y el mínimo de sprints siguen igual.
- El backend .NET sigue fuera; el contrato lo sirve el mock.
- El mapeo épica ↔ iniciativa sigue pendiente: los chips de iniciativa del sprint muestran la épica cuando no está mapeada, como hoy.

## Capabilities

### New Capabilities

Ninguna. El módulo existe; este change corrige cómo se lee.

### Modified Capabilities

- `real-dedication`: **Señal de balance de capacidad** pasa a cuatro valores y el modificador de célula deja de bajarla; **Capacidad del sprint en FTE** gana la lectura en horas; **Balance de carga de los colaboradores** cambia indicadores, columnas, toolbar y gana el navegador de sprint; **Dashboard de balance de un colaborador** hereda el vocabulario nuevo.
- `admin-shell`: el **Calendario de sprints** gana el campo *Horas por sprint*.
- `api-mocking`: el **Handler de mock para la dedicación real** acepta `sprint` y sirve las horas y la señal de cuatro valores; el **Handler de mock para la configuración de sprints** gana el campo nuevo; el **Handler de mock para el detalle de una persona** cambia lo que viaja en la identidad DevOps.
- `people`: el indicador **Dedicación real** de la ficha habla las cuatro señales.

## Impact

- **Contrato de API** — `GET /dedication/collaborators` acepta `sprint` y deja de aceptar `signal` como filtro; `BalanceSignal` pierde `Review` y renombra `Balanced` → `Usual`; `CapacityDto` gana las horas; `GET/PUT /admin/sprint-config` gana `hoursPerSprint`. Es un acuerdo con quien implemente el backend.
- **Frontend** — `features/dedication`: `balanceSignal.ts` (agregación y vocabulario), `DedicationAdapter`, `CollaboratorsTable`, `BalanceStatsCards`, `DedicationContainer`, `useCollaboratorDedication`, `BalanceSignalIcon` y `BalanceSignalBadge`, `DemandBar` y `CapacityFteBar`; `features/admin-shell` y `AdminSprintsPage`; `features/people` (indicador de la ficha); `mocks/handlers/dedication.*` y `sprint-config.handlers`.
- **Lo que cambia de significado** — "Revisar" sale del vocabulario; "Balanceado" pasa a "Carga habitual"; entran "tolerancia", "horas por sprint" y "HUs abiertas"; "WIP" sale de la interfaz aunque siga en el contrato.
- **Riesgo de lectura** — con cuatro señales, más gente cae en las dos accionables: el badge de navegación contará más. Es la intención, no un efecto secundario.
- **Supuesto anotado** — el artefacto rotula el breadcrumb "Plataforma / Capacidad"; se conserva **"Plataforma / Dedicación real"** porque *Capacidad* ya nombra la sección del sidebar y, en este modelo, el FTE. Si se quiere el rótulo del artefacto, es un cambio de una línea.
