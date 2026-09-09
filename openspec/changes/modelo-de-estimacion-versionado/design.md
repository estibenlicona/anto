## Context

Ver `proposal.md` — Why. Lo que importa acá es la forma que tiene hoy el código, porque es la que hay que desarmar:

- **Cuatro agregados de fila única.** `TallaBandSet`, `CapabilityMix`, `QuestionPool` y `SprintConfiguration` heredan de `AggregateRoot` y se guardan con un `Replace()` en bloque sobre la misma fila. No hay id de versión, ni estado, ni vigencia: la fila de hoy es la única que existió.
- **La pregunta es texto, dimensión y un entero.** `PoolQuestion` tiene `Code`, `Dimension`, `Texto`, `Peso`. El tipo de pregunta y sus cinco etiquetas de escala no están en el dominio: los asigna el mock del frontend por id, y el backend no los conoce.
- **El motor está escrito dos veces.** `EvaluationEngine` (C#) persiste; `computeEvaluation` (TS, `evaluationModel.ts`) pinta el resultado en vivo mientras el usuario responde. Los dos leen el mismo modelo servido por `GET` y tienen que dar el mismo número.
- **La evaluación guardada no dice con qué se calculó.** `Initiative.Evaluation` guarda respuestas y resultado; el modelo que produjo ese resultado es el que esté vigente ahora.
- **Ya hay un precedente de versión en el repo, y es el que no queremos.** `SkillCatalogVersion` es un contador de fila única que sube en uno por mutación, con un comentario que dice explícitamente que no guarda historial. Sirve para invalidar cachés, no para reproducir un cálculo pasado.

Restricciones que no se negocian en este diseño: el backend no tiene autenticación (no hay `ClaimsPrincipal` en `backend/src`), el frontend consume tuip como tarball local, y todo texto de cara al usuario va en español.

## Goals / Non-Goals

**Goals:**

- Que una estimación guardada se pueda volver a explicar años después: qué preguntas había, qué pesaba cada una y qué reglas de talla regían **el día que se calculó**.
- Que editar parámetros sea un acto con estado —borrador, publicado— y no un `PUT` que reescribe el presente y el pasado a la vez.
- Que el motor sea paramétrico de verdad: respuesta → driver → peso por salida, con las tres salidas separadas.
- Que la demanda de perfiles que arroja una talla se pueda contrastar contra la composición real de una célula.
- Que el editor de una versión sea navegable por enlace: un impedimento de publicación lleva a la sección donde se arregla.

**Non-Goals:**

- **No** se renombra el vocabulario de la aplicación de "evaluación" a "estimación". Las rutas (`iniciativas/:id/evaluacion`), los permisos y los nombres de tipo se quedan como están; mezclar un renombre transversal con un cambio de modelo hace que ningún diff sea legible. Queda como cambio aparte.
- **No** se introduce autenticación. El autor viaja en el request y la firma es declarativa (decisión D7).
- **No** se toca `SprintConfiguration`: es el cuarto agregado de fila única, pero no es parte del modelo de estimación y no gana nada con versionarse.
- **No** se calcula esfuerzo real ni se compara contra lo estimado — eso necesita la Fase 3 de cierre, que no existe.

## Decisions

### D1 — La versión es el agregado; el contenido cuelga de ella

`ModelVersion` es la raíz de agregado y contiene dimensiones, preguntas, drivers, pesos, reglas de talla y mix. `EstimationModel` es apenas el contenedor con nombre y fase; las versiones son sus hijas.

*Alternativa considerada:* dejar los cuatro agregados como están y agregarles una columna `VersionId`. Se descarta porque publicar tendría que escribir cuatro tablas en una sola transacción para que la versión quede completa; si una falla, queda una versión a medio copiar que es indistinguible de una entera, y el motor la leería igual. Con la versión como agregado, una versión incompleta no existe: o se insertó su grafo o no hay fila.

*Consecuencia:* el editor carga y guarda por sección, pero la unidad transaccional es la versión. Con siete dimensiones y unas cuarenta preguntas el grafo es chico; no hace falta paginarlo.

### D2 — La inmutabilidad vive en el dominio, no en los permisos

`ModelVersion` sólo acepta mutaciones cuando su estado es `Borrador`; cualquier otra tira `DomainException` y la API la traduce a 409. No es una regla de autorización.

*Alternativa considerada:* resolverlo con permisos ("sólo Admin edita"). No alcanza: el que reescribe una versión vigente es justamente un admin legítimo, y la regla que hay que hacer cumplir no es *quién* sino *cuándo*. Un chequeo de permisos que pasa deja el `Replace()` intacto.

### D3 — La estimación referencia la versión; no copia su contenido

`InitiativeEvaluation` gana `ModelVersionId` obligatorio. No guarda un JSON con el modelo entero.

*Alternativa considerada:* serializar el modelo completo dentro de cada evaluación (el "snapshot gordo"). Es lo que uno haría si las versiones fueran mutables — pero D2 las hace inmutables, así que la referencia ya es un snapshot: apunta a algo que por construcción no puede cambiar. El snapshot gordo costaría duplicar el modelo en cada una de las evaluaciones guardadas y volvería imposible responder "¿cuántas estimaciones calculó la v3?" sin abrir todos los JSON.

*Consecuencia:* una versión no se borra nunca, se archiva. El borrado físico rompería estimaciones que ya se usaron para decidir. Esto se hace explícito en el dominio: no hay operación de borrado de versión.

### D4 — "No aporta" es ausencia de fila, no un peso de cero

La matriz pregunta × salida se guarda como filas `(QuestionCode, Output, Weight)`. Que una pregunta no aporte a una salida es que esa fila no exista.

*Alternativa considerada:* `Weight = 0`. Se descarta porque cero es un peso legítimo y distinto: "aporta, pero con peso nulo en esta versión" es una decisión de calibración que alguien puede querer subir después, mientras que "no aporta" es una afirmación sobre el modelo. Con un solo entero no se pueden distinguir, y el editor no podría mostrar el guion que el diseño pide.

*Consecuencia en la UI:* `MatrixNumberCell` tiene tres estados —número, guion, vacío-editable— y no dos.

### D5 — El motor sigue duplicado, pero deja de poder divergir en silencio

`EvaluationEngine` y `computeEvaluation` se reescriben juntos y quedan amarrados por una batería de **casos dorados**: un archivo de fixtures JSON (modelo de entrada + respuestas + resultado esperado) que corren los dos lados, `dotnet test` de un lado y Vitest del otro.

*Alternativa considerada:* calcular sólo en el servidor, con un endpoint de previsualización por cada respuesta. Es la única forma de que no haya dos implementaciones — y se descarta por la pantalla: el resultado se recalcula con **cada clic** sobre una opción y con cada cambio de plazo, y un viaje de red por clic convierte una lectura fluida en una pantalla que parpadea. La duplicación es deliberada; lo que no es aceptable es que diverja sin que nadie se entere.

*Alternativa considerada:* compilar el motor de TS a WASM y consumirlo desde .NET (o al revés). Una dependencia de toolchain nueva para una función de cien líneas.

### D6 — Los nueve chequeos son una función pura sobre el contenido de la versión

La validación devuelve una lista de `(codigo, estado, queFalta, seccion)`. Vive en el dominio, la consume tanto el `POST` de publicación (que rechaza con 422) como el `GET` de validación (que pinta la lista).

*Alternativa considerada:* validar con FluentValidation en el borde, como el resto de los casos de uso. No sirve: el borde valida *el request*, y acá lo que se valida es *el estado acumulado* de la versión —que las columnas del mix sumen 100, que los umbrales de talla sean contiguos, que toda pregunta activa tenga al menos un peso—, que es una propiedad del agregado y no de lo que llegó por el cable. Además la UI necesita la misma lista para navegar a arreglar, y duplicarla en el front la haría mentir apenas cambie una regla.

### D7 — El autor viaja en el request y la firma es declarativa

Cada escritura y cada publicación llevan el autor que el cliente toma de su sesión. El backend no lo deduce ni lo valida.

Es lo que hay: no hay autenticación en la API. Se registra como tal en la spec y en el historial, de modo que quien lea la auditoría sepa que dice *quién dijo ser* y no *quién fue*. Cuando exista autenticación, el cambio es sacar el campo del request y tomarlo del `ClaimsPrincipal`; el historial ya guardado no se invalida, sólo deja de crecer con entradas declarativas.

*Alternativa considerada:* omitir el autor hasta que haya autenticación. Deja el historial sin la mitad de su valor, y la mitad que falta es la que la HU pide.

### D8 — Una ruta por sección del editor

`admin/parametros` lista modelos y versiones; `admin/parametros/:modeloId/:versionId/:seccion` abre el editor en una sección. La sección es un segmento de ruta, no estado local.

*Alternativa considerada:* pestañas con `useState`. Rompe justo lo que el diseño pide: que el botón de un impedimento de la validación lleve a donde se arregla. Con estado local ese salto es una llamada a un setter que el componente de validación no debería conocer; con ruta es un enlace. Además vuelve compartible y recargable la posición del usuario.

### D9 — Los componentes nuevos van a `shared/components`, no a un fork de tuip

`MatrixNumberCell`, `ValidationList`, `ValueDiff`, `PairedBar` y la extensión de `tone` por opción en `SegmentedControl` se escriben en `frontend/src/shared/components` con la API que tendrían en el catálogo, y se proponen para tuip. Es el mismo camino que ya recorrió `BandScale`.

*Alternativa considerada:* meterlos directo en el tarball de tuip. Acopla el ritmo de este cambio al de publicar el design system, y obliga a decidir la API definitiva antes de haberla usado una sola vez.

### D10 — El puntaje de esfuerzo interpola alrededor del PM esperado

`pmExpected` es el ancla de la banda y el puntaje de la salida de esfuerzo ubica
el resultado dentro de `[pmMin, pmMax]`: con el puntaje en la mitad de la escala
da exactamente el parámetro, por debajo baja hacia el mínimo y por encima sube
hacia el máximo. El algoritmo completo está en
`fixtures/estimation-model/README.md`.

*Alternativa considerada:* devolver `pmExpected` tal cual, como una consulta a la
banda. Es la lectura más literal de "el PM esperado sale del parámetro", y tiene
la ventaja de que la versión migrada reproduce exactamente el número de hoy. Se
descarta porque deja la columna de esfuerzo de la matriz de pesos sin efecto
sobre el persona-mes, y con eso todas las iniciativas de una talla vuelven a
recibir la misma cifra — que es el tercer agujero que el proposal nombra.

*Consecuencia sobre la migración:* la versión 1 reproduce **talla, puntaje de
tamaño y el rango `pmMin`/`pmMax`** exactamente; el **persona-mes esperado cambia
a propósito**. No es una regresión de la migración: es el defecto corregido.

## Risks / Trade-offs

- **Los dos motores divergen igual** → los casos dorados son fixtures compartidos, no dos suites que se parecen. Si una de las dos implementaciones no los corre, la protección no existe: los fixtures viven en un solo archivo y los dos test suites lo leen del mismo lugar.

- **La migración del mix de personas a porcentaje pierde información** → hoy el mix dice "2 backend, 1 QA" por talla; el porcentaje se deriva dividiendo por el total de la columna, y el redondeo puede mover el FTE por perfil respecto de lo que muestra la app hoy. Se acepta y se documenta: el número de hoy tampoco es exacto —sale de un entero de personas que ya redondeaba—, y a partir de esta versión el porcentaje es el dato de origen y no el derivado.

- **La versión 1 migrada podría no pasar los nueve chequeos** → se crea directamente como `Vigente` sin pasar por la validación, porque describe lo que el sistema ya está haciendo y no una propuesta. La tarea de migración deja registrado qué chequeos no habría pasado, para que quien arme la v2 sepa qué arreglar antes de publicar.

- **Publicar es irreversible por diseño** → no hay "despublicar". La vuelta atrás es crear una versión nueva a partir de la anterior y publicarla; queda en el historial como lo que fue. El costo es que un error de publicación se arregla con dos actos en vez de uno; la alternativa —revertir el estado— reabre exactamente el agujero que este cambio cierra.

- **El editor carga la versión entera** → con el tamaño actual (siete dimensiones, ~40 preguntas, 6 perfiles × 5 tallas) es una carga chica. Si un modelo futuro creciera un orden de magnitud, la salida es servir el contenido por sección; el contrato ya está partido por sección en el `PUT`, así que partir el `GET` no rompería nada.

- **Auditoría declarativa** → mientras no haya autenticación, el historial es tan confiable como el cliente. No se presenta como firma ni como control de acceso, y la spec lo dice.

## Migration Plan

1. **Esquema.** Migración de EF que agrega `EstimationModel`, `ModelVersion`, `Driver`, `QuestionOption`, `QuestionOutputWeight`, `MixModifier`, y las columnas nuevas de `PoolQuestion` (tipo, unidad, driver), `TallaBand` (PM esperado) y `CapabilityMixRow` (porcentaje). Las tablas viejas se conservan durante el paso 2.
2. **Datos.** Se crea el modelo de Fase 1 con su versión 1 en estado `Vigente`, poblada desde los cuatro agregados actuales: preguntas con el tipo y las opciones que hoy asigna el mock por id, pesos volcados a la salida de tamaño (que es la única que el motor de hoy tiene), reglas de talla con el PM esperado inicializado en el punto medio —que es lo que el código calcula hoy— y mix convertido a porcentaje por columna.
3. **Estimaciones.** Todas las `InitiativeEvaluation` guardadas reciben `ModelVersionId` = versión 1. Es literalmente cierto: se calcularon con esos parámetros.
4. **Motor.** Se reescriben `EvaluationEngine` y `computeEvaluation` contra los casos dorados. Hasta que los dos pasen, no se toca la UI de evaluación.
5. **Frontend.** Se reemplazan `AdminParametersPage` y sus tres modales por la lista de versiones y el editor.
6. **Limpieza.** Se eliminan los casos de uso y los handlers de bandas, mix y pool, y las tablas viejas.

**Rollback.** Hasta el paso 6 la vuelta atrás es revertir el despliegue: las tablas viejas siguen ahí y los agregados de fila única no se tocaron. Después del paso 6 el rollback es hacia adelante — corregir con una versión nueva del modelo, que es el mecanismo que este cambio introduce.

## Open Questions

- **Retención de versiones archivadas.** Nunca se borran (D3), pero no está definido si a partir de cierta cantidad se colapsa la lista en la UI. No cambia el modelo ni las tareas; se decide cuando haya suficientes versiones para que moleste.
- **Notificación al publicar.** Publicar cambia el modelo con el que estiman todos los Chapter Lead. Si eso debe avisarse —y por qué canal— no afecta a este cambio: el evento de publicación queda registrado y cualquier notificación se cuelga de él después.
