## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **Esto corrige la lectura, no el modelo.** `dedicacion-balance-de-carga`, archivado, dejó las seis evidencias, sus umbrales, el snapshot sellado y el histórico bien puestos y probados. Este change toca **cómo se agregan en señal** y **cómo se rotulan**; no toca qué se mide. `capacityFte.ts` y `history.ts` quedan intactos; `balanceSignal.ts` cambia sólo en su tabla de agregación, su vocabulario y el papel del modificador de célula.
- **El artefacto es el destino, no una sugerencia.** El usuario aprobó un rediseño concreto y pidió seguirlo fielmente. Donde el artefacto y una regla vigente chocan, se resuelve a favor del artefacto salvo que la regla proteja algo que el artefacto no puede haber considerado; los dos casos así se anotan abajo.
- **Lo que ya existe y se reutiliza.** Los componentes `CapacityFteBar`, `DemandBar`, `BalanceSignalIcon`, `BalanceSignalBadge` y `EvidenceList`; el adapter con su formato de tres unidades; el patrón de listado (`Table` con `toolbar`, `SearchField`, `PaginationBar`); el acotado por chapter (`scope.ts`); el mock de dedicación con sus semillas de siete sprints; el `Chip` seleccionable de tuip para el filtro de célula.
- **Cuatro superficies leen la señal**: el listado, el dashboard, el indicador de la ficha y el badge de navegación. Las cuatro salen del mismo módulo, así que retirar un valor del tipo `BalanceSignal` las rompe a todas a la vez — que es lo que se quiere: el compilador enumera lo que falta actualizar.
- **Decisiones ya tomadas con el usuario:** cuatro señales (se retira *Revisar*, *Balanceado* pasa a *Carga habitual*); el modificador de célula deja de bajar la señal y pasa a ser anotación; las horas se configuran por sprint y se descuentan con las ausencias registradas; el navegador de sprint entra; el rediseño alcanza también al dashboard, la ficha y el badge.

## Goals / Non-Goals

**Goals:**

- Que cada fila del listado se resuelva sola: o pide una decisión de carga, o no. Sin un tercer estado que el lead tenga que ir a investigar.
- Que la fila diga **cuánto** se desvía y **contra qué umbral**, sin obligar a abrir el dashboard ni a hacer la resta.
- Que el listado entero se pueda mover de sprint, para revisar un cierre sin abrir trece dashboards.
- Que la capacidad se lea en la unidad que el lead usa para hablar con su gente —horas— sin que nadie tenga que reportarlas.
- Que las cuatro superficies digan lo mismo con las mismas palabras.

**Non-Goals:**

- Cambiar qué se mide: las seis evidencias, sus umbrales y sus fuentes quedan igual.
- Tocar el contrato del snapshot sellado, la ventana de histórico o el mínimo de sprints.
- Convertir las horas en un parte de trabajo: nadie las digita, se derivan.
- Hacer que el listado navegue sprints por colaborador: el navegador mueve **todas** las filas a la vez.

## Decisions

- **Cuatro señales, y el escalón que se retira es el del medio.** `BalanceSignal` pasa de `"Balanced" | "Review" | "PossibleOverload" | "PossibleUnderload" | "NotEvaluable"` a `"Usual" | "PossibleOverload" | "PossibleUnderload" | "NotEvaluable"`. Se renombra el valor y no sólo su rótulo, para que el compilador obligue a revisar cada uso en vez de dejar un `Balanced` que ya no significa lo mismo. *Alternativa:* conservar `Balanced` como identificador y cambiar sólo `SIGNAL_LABELS` — descartada: la diferencia entre "balanceado" y "dentro de la tolerancia" es real y un identificador que miente sobrevive años.

- **La escala de agregación se colapsa, no se reescribe.** La tabla pasa de cinco filas a tres:

  | Evidencias concordantes | Señal |
  | --- | --- |
  | 0, o 1 no fuerte | Carga habitual |
  | 1 fuerte, o ≥ 2 | Posible sobre/subasignación según la dirección |
  | ≥ 1 en cada dirección | Carga habitual |

  El umbral de las señales fuertes baja de tres evidencias a dos: sin escalón intermedio, exigir tres dejaría en "habitual" a alguien con dos evidencias concurrentes, que es exactamente el caso que antes se llamaba "Revisar" y que sí merece una mirada. `STRONG_MIN_EVIDENCES` pasa de 3 a 2 y `REVIEW_MIN_EVIDENCES` desaparece. *Alternativa:* dejar el umbral en 3 — descartada: convertiría el retiro de *Revisar* en una amnistía, no en una simplificación.

- **Las direcciones opuestas caen a "Carga habitual", no a la señal dominante.** Antes el techo era *Revisar*, que ya no existe. Elegir la dirección mayoritaria daría una señal accionable a alguien cuyas evidencias se contradicen, que es peor que no decir nada. La explicación sigue mostrando las dos direcciones. *Alternativa:* un quinto estado sólo para este caso — descartada: reintroduce por la ventana el escalón que se sacó por la puerta.

- **El modificador de célula deja de restar y pasa a anotar.** `squadContext: "SameDirection"` deja de descontar una evidencia y viaja como marca junto a la señal. Con cinco señales, restar una evidencia bajaba un peldaño sin borrar información; con cuatro, el único peldaño disponible es *Carga habitual*, y mandar ahí a una célula entera desviada esconde justo lo que hay que ver. La anotación aparece en el tooltip del listado, en la tarjeta de Balance y en *Por qué esta señal*. *Alternativa:* conservar el descuento — descartada por el usuario y por el efecto anterior; el artefacto muestra a los dos colaboradores de la célula baja contados en el indicador de subasignación.

- **Las horas son una lectura, no un dato.** El Calendario gana `hoursPerSprint` (80 por defecto, 20–400) y el DTO de capacidad gana `availableHours` y `deductedHours`, calculados como `availableFte × hoursPerSprint` y `(contractualFte − availableFte) × hoursPerSprint`, redondeados al entero. Se calculan en el handler y no en el componente, para que la ficha, el listado y el dashboard no puedan discrepar. La regla "la plataforma no registra horas" queda intacta: nadie las pide ni las guarda; se derivan de los días que ya se miden. *Alternativa:* derivarlas en el adapter a partir del FTE y un parámetro del cliente — descartada: pondría el factor en dos sitios y el mock dejaría de ser el contrato.

- **El sprint sube del renglón a la pantalla.** `GET /dedication/collaborators` acepta `sprint`; la respuesta declara el sprint elegido, si es el en curso, y si hay anterior y siguiente. El navegador vive en la franja del breadcrumb —donde ya vive la acción de actualizar— y el sprint elegido viaja en la URL como en el dashboard. La columna Sprint desaparece: repetir el mismo nombre trece veces gasta la columna más ancha de la tabla en un dato constante. Un `sprint` desconocido cae al en curso, como ya hace el detalle. *Alternativa:* un `Select` de sprints en la toolbar — descartada: la toolbar filtra el conjunto, y el sprint no filtra: cambia de qué se está hablando.

- **El filtro por señal se retira y el de célula baja a marcas en línea.** Con cuatro indicadores arriba, filtrar por señal es redundante: la tarjeta ya dice quiénes son y son pocos. Las células son entre tres y seis por chapter, así que caben como `Chip` seleccionables y ahorran un clic frente al desplegable. El conteo "13 de 13 personas" a la derecha da el estado del filtro sin leer la tabla. *Alternativa:* conservar los dos `FilterButton` — descartada: el artefacto los reemplaza, y el desplegable para cuatro opciones es un clic de más.

- **La desviación y la tolerancia viven en la columna de demanda.** La fila muestra "30 SP · habitual 22 · +36 %" con el porcentaje en el rol de color de la señal, y debajo "Tolerancia ±25 %" o "Dentro de la tolerancia". El umbral que se muestra es el de la **evidencia de demanda** (`DEMAND_DEVIATION_PCT`), no el de la señal: la señal sigue saliendo de la concurrencia. Se rotula *tolerancia* y no *umbral* porque es la palabra con la que se habla de un rango aceptable. Para que la columna no insinúe un veredicto de un solo indicador, el icono de balance queda en su propia columna y el tooltip dice cuántas evidencias lo sostienen. *Riesgo asumido y anotado abajo.*

- **La barra de demanda gana el relleno con el rol de la señal.** Hoy el relleno es siempre de marca y la marca vertical es el habitual. El artefacto colorea el relleno según la señal —rojo, ámbar, neutro— para que la fila se lea de un barrido vertical. La marca del habitual se conserva; la de la célula se retira de la fila (sigue en el dashboard), porque a ese ancho dos marcas se confunden.

- **El medidor de foco reusa los umbrales de la evidencia, no unos propios.** Los cuatro tramos escalan en 1 HU, 2–3, `MULTITASKING_WIP` y `MULTITASKING_WIP_STRONG`: si el medidor tuviera cortes propios, la columna y la señal podrían decir cosas distintas de la misma fila. *Alternativa:* un cuadro por HU — descartada: crece sin techo y no dice dónde está el umbral.
- **"WIP" sale de la interfaz y se queda en el contrato.** La fila dice "4 HUs" —el panel de Multitarea lo define entero una vez, "HUs abiertas a la vez"— y el DTO sigue llamándolo `wip`: es el nombre que Azure y el backend usan, y renombrar el campo sólo para la pantalla haría más difícil rastrear de dónde sale. El adapter traduce.

- **La columna de célula muestra las iniciativas del sprint, no la activa de la célula.** Es lo que el artefacto muestra ("Kafka Migration +1") y es más útil: dice en qué anduvo la persona, no en qué anda su célula. Sale de `multitasking.initiatives`, que el handler ya calcula; la iniciativa activa de la célula sigue en el encabezado del dashboard. Se muestran hasta dos marcas y el resto se colapsa en "+N".

- **La subasignación pasa de rol informativo a rol de advertencia.** Con cuatro señales las dos accionables tienen que verse igual de accionables; el azul informativo la leía como contexto. Sobreasignación conserva el rol de peligro para que sigan siendo distinguibles por color además de por forma (el icono ya difiere: `trend-up` contra `trend-down`).

- **Un solo punto de verdad para el vocabulario.** `SIGNAL_LABELS`, `SIGNAL_PHRASES` y `SIGNAL_VARIANTS` siguen en `balanceSignal.ts` y todas las superficies los leen. Retirar `Review` de esos tres mapas es lo que hace que el compilador señale cada lugar por actualizar.

## Risks / Trade-offs

- **[La tolerancia en la fila puede leerse como el veredicto]** → "Tolerancia ±25 %" está bajo la columna de demanda y podría sugerir que la señal sale de ese único número. Se mitiga con la separación física —el balance es su propia columna—, con el tooltip que dice cuántas evidencias la sostienen, y con el caso que lo desmiente en las semillas: un colaborador dentro de la tolerancia de demanda pero con señal accionable por concurrencia de otras evidencias. Si el uso muestra que igual se lee mal, el pie de la columna puede pasar a decir la señal en vez del umbral.
- **[Bajar el umbral a dos evidencias mueve gente a las señales fuertes]** → Es la intención: lo que antes quedaba en *Revisar* ahora pide una decisión. El efecto secundario es que el badge de navegación contará más y podría dejar de llamar la atención. Se acepta para este ciclo y se revisa con uso; si el badge se satura, la salida es contar sólo las señales sostenidas por evidencias fuertes, no volver a un tercer estado.
- **[Quitar el descuento del modificador endurece el caso de la célula]** → Dos colaboradores de una célula que cayó entera ahora aparecen los dos como subasignados. Es lo que el artefacto muestra y lo que el usuario decidió, y la anotación explica por qué. El riesgo real es que el lead actúe sobre las personas en vez de sobre la entrada de trabajo de la célula; se mitiga con la anotación visible en las tres superficies y no sólo en el panel de explicación.
- **[Las horas introducen una unidad que la plataforma evitó a propósito]** → El día que alguien quiera comparar las horas del tablero con un parte de trabajo, no va a cuadrar, porque estas horas son capacidad y no esfuerzo. Se mitiga con el rótulo ("−8 h por ausencias", no "8 h trabajadas"), con el parámetro nombrado *Horas por sprint* en el Calendario, y con la regla `SHALL NOT` explícita en las specs de que no se piden ni se guardan horas trabajadas.
- **[El navegador de sprint invita a comparar sprints que no son comparables]** → Un sprint sin snapshot muestra huecos y un sprint con festivo tiene menos capacidad. La procedencia viaja en cada fila como hoy y el sprint elegido se marca cuando es el en curso; la tendencia por colaborador sigue siendo el lugar donde se compara en serio.
- **[Cuatro estados siguen siendo un vocabulario]** → Menos que cinco, y los indicadores de cabecera los enseñan en la primera pasada con su punto de color y su frase. *Carga habitual* es además más autoexplicativo que *Balanceado*.

## Migration Plan

1. **Reglas.** `balanceSignal.ts`: retirar `Review`, renombrar `Balanced` → `Usual`, colapsar la agregación, bajar el umbral a dos evidencias, quitar el descuento del modificador y dejarlo como contexto; actualizar los tres mapas de vocabulario. Pruebas del módulo primero: es el único sitio donde la regla vive.
2. **Contrato y parámetro.** `SprintConfig` gana `hoursPerSprint` con su validación; `CapacityDto` gana las horas; el DTO del listado gana el sprint elegido y sus vecinos, y pierde el filtro por señal; el resumen cambia sus contadores.
3. **Mock.** `sprint-config.handlers` con el campo nuevo; `dedication.handlers` acepta `sprint`, calcula las horas, expone las iniciativas del sprint por fila y responde el resumen de cuatro señales; semillas ajustadas para que los casos del artefacto se vean (dos subasignados de una misma célula, uno con más de dos iniciativas).
4. **Adapter y componentes compartidos.** Formato de horas, de desviación y de tolerancia; `BalanceSignalIcon` y `BalanceSignalBadge` con cuatro valores; `DemandBar` con el relleno por señal y sin la marca de célula; `CapacityFteBar` con las horas debajo.
5. **Listado.** Navegador de sprint en la franja, cuatro indicadores con su punto, toolbar con marcas de célula y conteo, tabla de seis columnas.
6. **Aguas abajo.** Dashboard (tarjetas, *Por qué esta señal*, anotación de célula), ficha de la persona, badge de navegación.
7. **Cierre.** `tsc`, lint, prettier, suite completa y verificación en `pnpm dev:mock` contra el artefacto.

Sin rollback especial: el módulo anterior vive en el historial de git.

## Open Questions

- **Si el pie de la columna de demanda debe decir el umbral o la señal.** Se decide con uso; no cambia el contrato ni el cálculo, sólo la cadena que el adapter arma.
- **Cuántas marcas de iniciativa caben antes del "+N".** Dos en el ancho de 1440 del artefacto; en pantallas más anchas podrían caber tres. Es un ajuste de presentación.
- **Si el badge de navegación necesita otro criterio** cuando el umbral bajo a dos evidencias lleve más gente a las señales fuertes. Se mide con uso y no afecta a esta entrega.
