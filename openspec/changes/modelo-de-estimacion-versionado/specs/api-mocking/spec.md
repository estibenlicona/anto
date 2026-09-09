## ADDED Requirements

### Requirement: Handler de mock para modelos y versiones
El sistema SHALL exponer un handler de mock con `GET` de los modelos de estimación y sus versiones (número, estado, vigencia, cuántas estimaciones calculó cada una), `GET` del contenido completo de una versión, `POST` de una versión nueva a partir de una existente —que copia su contenido y nace en `Borrador`— y `PUT` por sección del contenido de un borrador (dimensiones y preguntas, drivers y pesos, reglas de talla, mix). El handler SHALL responder 409 a cualquier escritura sobre una versión que no sea `Borrador`. Los cambios persisten en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio.

Los datos de ejemplo SHALL incluir al menos una versión vigente con contenido completo, una versión archivada y un borrador, de modo que la lista muestre los tres estados sin que haya que crear nada.

#### Scenario: Listar modelos y versiones
- **WHEN** se hace un `GET` de modelos
- **THEN** responde con cada modelo y sus versiones ordenadas de la más nueva a la más vieja, cada una con estado, vigencia y cantidad de estimaciones

#### Scenario: Crear una versión a partir de otra
- **WHEN** se hace un `POST` de versión nueva a partir de la vigente
- **THEN** la nueva nace en `Borrador` con el contenido copiado, la vigente no cambia, y un `GET` posterior las muestra a las dos

#### Scenario: Guardar una sección del borrador
- **WHEN** se hace un `PUT` de la sección de reglas de talla de un borrador con datos válidos
- **THEN** el handler los persiste y un `GET` del contenido de esa versión los refleja, sin tocar el resto de las secciones

#### Scenario: Escribir sobre una versión publicada
- **WHEN** se hace un `PUT` de cualquier sección sobre una versión vigente o archivada
- **THEN** responde 409 y el contenido de esa versión no cambia

#### Scenario: Reiniciar el estado entre pruebas
- **WHEN** una prueba que ejercita el guardado llama a la función de reinicio del mock
- **THEN** los modelos, sus versiones y su contenido vuelven a su valor inicial, de modo que una prueba no arrastre lo que guardó otra

### Requirement: Handler de mock para la validación y la publicación de una versión
El sistema SHALL exponer un `GET` de validación de una versión que devuelve los nueve chequeos con su estado, qué falta en cada uno que no pasa y la sección donde se corrige; un `GET` de diferencias contra la versión vigente; y un `POST` de publicación que recibe el autor y la fecha de vigencia. La publicación SHALL responder 422 con los chequeos que no pasan cuando queda al menos un impedimento, y en caso de éxito SHALL pasar la versión a `Vigente`, archivar la anterior y quedar como el modelo que sirve el `GET` del modelo de evaluación.

#### Scenario: Validación con impedimentos
- **WHEN** se hace un `GET` de validación de un borrador con una columna del mix que no suma 100
- **THEN** responde con ese chequeo fallando, qué falta y la sección de mix como lugar donde se corrige, y los demás chequeos con su estado

#### Scenario: Publicar con impedimentos
- **WHEN** se hace un `POST` de publicación de un borrador que no pasa la validación
- **THEN** responde 422 con los chequeos que no pasan y la versión sigue en `Borrador`

#### Scenario: Publicar una versión válida
- **WHEN** se hace un `POST` de publicación de un borrador que pasa los nueve chequeos
- **THEN** la versión queda `Vigente` con su fecha y su autor, la anterior queda `Archivada`, y el siguiente `GET` del modelo de evaluación trae el contenido nuevo

#### Scenario: Diferencias contra la vigente
- **WHEN** se hace un `GET` de diferencias de un borrador
- **THEN** responde con lo agregado, lo quitado y lo cambiado por sección, cada cambio con su valor anterior y su valor nuevo

### Requirement: Handler de mock para la auditoría del modelo
El sistema SHALL exponer un `GET` del historial de cambios de una versión, con cada entrada llevando fecha, autor, sección y qué cambió. El autor SHALL tomarse del que viaja en el request: el mock no lo deduce ni lo inventa, y una escritura sin autor SHALL responder 400.

#### Scenario: Ver el historial de una versión
- **WHEN** se hace un `GET` del historial de una versión con cambios guardados
- **THEN** responde con las entradas de la más nueva a la más vieja, cada una con fecha, autor, sección y qué cambió

#### Scenario: Una escritura sin autor
- **WHEN** se hace un `PUT` de una sección sin el autor en el request
- **THEN** responde 400 y no se guarda ni el cambio ni la entrada de historial

## MODIFIED Requirements

### Requirement: Handler de mock para el modelo de evaluación
El sistema SHALL exponer un `GET` del modelo de evaluación armado **en el momento de la petición** desde la **versión vigente** del modelo de estimación: su identificador y su número de versión; las dimensiones activas en orden con su peso; las preguntas con id, dimensión, texto, tipo (`Cuantitativa`, `Evaluativa` o `Binaria`), unidad cuando aplica, driver, opciones de respuesta con su etiqueta y su valor normalizado, y su peso en cada salida, con "no aporta" distinto de cero; los drivers; el tamizaje (seis preguntas con su marca de crítica); las reglas de talla (límites, PM mínimo, esperado y máximo, lectura, acción recomendada); y el mix en porcentaje por perfil con sus modificadores por driver. Publicar una versión nueva SHALL reflejarse en el siguiente `GET` del modelo; guardar un borrador NO SHALL cambiarlo.

#### Scenario: El modelo sigue a los parámetros
- **WHEN** Admin publica una versión con un peso distinto para una pregunta o con otro límite de talla
- **THEN** el siguiente `GET` del modelo trae el peso o el límite nuevo con el número de la versión nueva, y una evaluación guardada después usa esos valores

#### Scenario: Un borrador no cambia el modelo servido
- **WHEN** Admin guarda cambios en un borrador sin publicarlo
- **THEN** el `GET` del modelo sigue devolviendo la versión vigente, con su número sin cambios

#### Scenario: Tipo y escala de cada pregunta
- **WHEN** se hace un `GET` del modelo
- **THEN** cada pregunta trae su tipo, su driver, sus opciones con etiqueta y valor normalizado —tramos con su unidad para una cuantitativa, escala para una evaluativa, sí/no para una binaria— y su peso en cada salida, y ninguna queda sin tipo ni sin opciones

#### Scenario: Un peso que no aporta
- **WHEN** una pregunta no aporta a una de las salidas
- **THEN** el modelo lo expresa como "no aporta" y no como un peso de cero, de modo que el cliente pueda distinguirlos

### Requirement: Handler de mock para iniciativas
El sistema SHALL exponer un handler de mock con `GET` listado paginado de iniciativas (acepta `search`, `status`, `squadId` y `talla` repetibles, aplicados antes de paginar), `GET` por id, `POST` alta, `PUT` edición, `PUT` de estado a un sub-recurso (`Active` sólo con talla; `Closed` sólo desde `Active`; 400 en otro caso), `GET` resumen (sin evaluar, activas por talla, FTE demandado de las activas), y `PUT` de evaluación a un sub-recurso que recibe respuestas de tamizaje, respuestas por pregunta y plazo, calcula con la versión vigente del modelo y persiste respuestas, resultado (talla, puntaje, porcentaje, PM, FTE esperado/optimista/pesimista, por dimensión, mix en porcentaje) y **el identificador de la versión con la que se calculó**, devolviendo la iniciativa actualizada; 404 si no existe, 400 si una respuesta referencia una pregunta que no está en la versión, si su valor no corresponde a ninguna opción de esa pregunta, o si un número cae fuera de los tramos definidos para una cuantitativa. Los cambios persisten en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio. Cada iniciativa SHALL llevar `id`, `name`, `squadId`, `squadName`, `productOwner`, `targetMonths`, `status`, `evaluation | null`. Los datos de ejemplo SHALL incluir iniciativas sin evaluar, en evaluación, activas con distintas tallas y cerradas, con los **mismos ids y nombres** que hoy usan el catálogo del backlog y las asignaciones.

El handler SHALL exponer un snapshot de sólo lectura de las iniciativas para que otros handlers (backlog, asignaciones) deriven sus catálogos de la misma fuente.

#### Scenario: Listar con filtro por talla
- **WHEN** se hace un `GET` con `talla=M&talla=L`
- **THEN** responde con el sobre paginado recortado sobre las iniciativas cuya evaluación guardada tiene esas tallas

#### Scenario: Crear y editar
- **WHEN** se hace un `POST` válido y luego un `PUT` que cambia el plazo de una iniciativa evaluada
- **THEN** la nueva queda en `Evaluating` sin evaluación, y la editada conserva su talla con el FTE recalculado para el nuevo plazo

#### Scenario: Cambios de estado
- **WHEN** se hace un `PUT` de estado `Active` sobre una iniciativa sin evaluación
- **THEN** responde 400; sobre una evaluada, pasa a `Active`; `Closed` sobre una `Evaluating` responde 400

#### Scenario: Guardar la evaluación
- **WHEN** se hace un `PUT` de evaluación con respuestas válidas y plazo 6
- **THEN** la iniciativa devuelta trae talla, resultado e identificador de versión coherentes con `computeEvaluation` sobre la versión vigente, y un `GET` posterior los refleja

#### Scenario: La evaluación conserva su versión
- **WHEN** se publica una versión nueva del modelo y luego se hace un `GET` de una iniciativa evaluada antes
- **THEN** su evaluación conserva el resultado y el identificador de la versión con que se calculó, sin recalcularse

#### Scenario: Una respuesta que la versión no admite
- **WHEN** se hace un `PUT` de evaluación con un valor que no es ninguna de las opciones de esa pregunta
- **THEN** responde 400 y la evaluación previamente guardada no cambia

#### Scenario: Catálogos derivados
- **WHEN** el backlog o las asignaciones piden sus catálogos de iniciativas
- **THEN** los ids y nombres coinciden con los del mock de iniciativas (incluidas las creadas en la sesión)

## REMOVED Requirements

### Requirement: Handler de mock para las bandas de talla
**Reason**: Las bandas dejan de ser un agregado de fila única con su propio `GET`/`PUT`: pasan a ser una sección del contenido de una versión del modelo, servida y guardada por el handler de versiones.
**Migration**: Ver "Handler de mock para modelos y versiones" acá y la requirement "Reglas de talla y parámetros de esfuerzo" de `estimation-model`. La validación de contigüidad se conserva, ahora como uno de los chequeos previos a publicar.

### Requirement: Handler de mock para el mix de capacidades
**Reason**: El mix deja de tener su propio `GET`/`PUT` y de expresarse en personas por talla: pasa a ser una sección del contenido de una versión, en porcentaje por perfil.
**Migration**: Ver "Handler de mock para modelos y versiones" acá y la requirement "Mix de capacidades en porcentaje" de `estimation-model`. La validación de nombres vacíos o repetidos se conserva, sumada a que cada columna sume 100.
