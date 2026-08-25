# initiatives Specification

## Purpose
TBD - created by archiving change add-initiative-evaluation. Update Purpose after archive.
## Requirements
### Requirement: Listar iniciativas
El sistema SHALL mostrar, bajo la ruta de Iniciativas del Chapter Lead, un encabezado con el título "Iniciativas", su descripción y el botón **Nueva iniciativa** como única acción principal de la pantalla; tres indicadores sobre el total de iniciativas (no sobre el filtro): cuántas están sin evaluar (sin talla), cuántas están activas con su distribución por talla, y el FTE demandado (suma del FTE esperado de las activas); y un listado paginado con nombre, célula y Product Owner, estado, talla, FTE esperado y plazo objetivo por fila.

El nombre SHALL ser un enlace neutro a la evaluación de esa iniciativa. El estado SHALL mostrarse con el componente de estado del sistema de diseño (En evaluación · Activa · Cerrada), y los tres SHALL distinguirse entre sí por color. Compartir color entre dos estados los vuelve indistinguibles en el listado, y los que más importa separar son justamente los extremos del ciclo: una iniciativa que todavía espera evaluación y una que ya terminó. La talla SHALL mostrarse con el componente de estado en el color de esa talla; una iniciativa sin talla SHALL mostrar en su lugar un enlace neutro **Evaluar** (no un botón) que lleva a la evaluación. El FTE esperado de una iniciativa sin talla SHALL mostrarse como un guion. Cada fila SHALL exponer un menú de acciones (Editar · Activar · Cerrar) con el mismo disparador en todas las filas; el listado NO SHALL repetir botones por fila.

El listado SHALL permitir buscar por nombre y filtrar por estado, célula y talla con el componente de filtro múltiple del sistema de diseño; los filtros se combinan y vuelven a la primera página.

#### Scenario: Encabezado e indicadores
- **WHEN** el Chapter Lead abre Iniciativas
- **THEN** ve el título, la descripción, el botón "Nueva iniciativa" y las tres cards calculadas sobre todas las iniciativas del mock

#### Scenario: Fila con talla
- **WHEN** una iniciativa tiene evaluación guardada
- **THEN** su fila muestra la talla con el color de esa talla y su FTE esperado con dos decimales

#### Scenario: Los tres estados se distinguen entre sí
- **WHEN** el listado muestra iniciativas en los tres estados
- **THEN** cada estado se reconoce por su color sin leer la etiqueta, y ningún par comparte tratamiento

#### Scenario: Fila sin talla
- **WHEN** una iniciativa no tiene evaluación guardada
- **THEN** su fila muestra el enlace neutro "Evaluar" en la columna de talla, un guion en FTE, y no muestra ningún botón

#### Scenario: Filtrar por talla
- **WHEN** el Chapter Lead elige una o más tallas en el filtro
- **THEN** el listado muestra sólo las iniciativas con esas tallas, desde la primera página, y el total de la paginación refleja el subconjunto

#### Scenario: Sin iniciativas
- **WHEN** no hay iniciativas registradas
- **THEN** el listado muestra el estado vacío con la acción de crear la primera

### Requirement: Crear y editar iniciativas
El sistema SHALL permitir crear una iniciativa desde un drawer con nombre (obligatorio, ≤200), célula (obligatoria, del catálogo de células), Product Owner (obligatorio, ≤100) y plazo objetivo en meses (entero entre 1 y 36), y editar esos mismos datos desde el menú de la fila. Una iniciativa nueva SHALL quedar en estado **En evaluación** y sin talla. El drawer SHALL mostrar los errores de validación junto al campo y el error del servidor sin cerrarse; **Guardar** es su único primario.

#### Scenario: Crear una iniciativa válida
- **WHEN** el Chapter Lead completa el drawer con datos válidos y guarda
- **THEN** la iniciativa aparece en el listado en estado "En evaluación" y sin talla, y el sistema confirma con un toast

#### Scenario: Validación en el drawer
- **WHEN** el Chapter Lead intenta guardar sin nombre o con un plazo fuera de rango
- **THEN** el drawer muestra el error en el campo y no llama al servicio

#### Scenario: Editar el plazo
- **WHEN** el Chapter Lead edita el plazo objetivo de una iniciativa evaluada
- **THEN** la talla no cambia y el FTE esperado se recalcula con el nuevo plazo

### Requirement: Cambiar el estado de una iniciativa
El sistema SHALL permitir **Activar** una iniciativa sólo si tiene talla (evaluación guardada) **y su célula no tiene ya una iniciativa activa**, y **Cerrar** sólo si está activa. Una célula SHALL sostener como mucho una iniciativa activa a la vez: activar una segunda SHALL rechazarse con un mensaje que nombre la condición y diga qué hacer (cerrar la activa antes), en español y sin cerrar la confirmación. La regla es del dominio, no de la pantalla: el servidor SHALL rechazarla aunque la interfaz no lo haya impedido.

Las acciones no disponibles SHALL mostrarse deshabilitadas en el menú de la fila, con el mismo tratamiento con que hoy se deshabilita "Activar" sin talla: el menú NO SHALL explicar el motivo. Activar SHALL pedir confirmación indicando que la iniciativa pasará a contar como demanda; cerrar SHALL pedir confirmación.

Cuántas iniciativas **en evaluación** tiene una célula NO SHALL estar limitado: la regla alcanza sólo al estado Activa.

#### Scenario: Activar sin talla
- **WHEN** el Chapter Lead abre el menú de una iniciativa sin evaluación guardada
- **THEN** "Activar" está deshabilitado

#### Scenario: Activar con la célula ya ocupada
- **WHEN** el Chapter Lead abre el menú de una iniciativa evaluada cuya célula ya tiene otra iniciativa activa
- **THEN** "Activar" está deshabilitado, igual que lo está para una iniciativa sin evaluar

#### Scenario: El servidor rechaza la segunda activación
- **WHEN** llega una petición de activar una iniciativa en una célula que ya tiene una activa
- **THEN** el sistema la rechaza sin cambiar ningún estado, y la pantalla muestra el motivo en español dentro de la confirmación, que sigue abierta

#### Scenario: Varias iniciativas en evaluación en la misma célula
- **WHEN** una célula tiene dos iniciativas en evaluación y ninguna activa
- **THEN** ambas se pueden evaluar y activar mientras la célula siga sin activa; activar una deja a la otra sin poder activarse hasta que la primera se cierre

#### Scenario: Activar una iniciativa evaluada
- **WHEN** el Chapter Lead activa una iniciativa con talla y confirma
- **THEN** la iniciativa pasa a "Activa", la card de activas y el FTE demandado la incluyen, y el sistema confirma con un toast

#### Scenario: Cerrar una iniciativa activa
- **WHEN** el Chapter Lead cierra una iniciativa activa y confirma
- **THEN** la iniciativa pasa a "Cerrada" y deja de contar en el FTE demandado

### Requirement: Evaluar una iniciativa
El sistema SHALL ofrecer una pantalla propia de evaluación por iniciativa con: un encabezado que muestra el nombre, el estado, la célula y el PO, y el **resultado en vivo** (talla, complejidad en %, esfuerzo en persona-mes, FTE esperado) junto al **plazo objetivo** seleccionable entre 3, 6, 9 y 12 meses; un panel de pasos con Tamizaje, las siete dimensiones del modelo y Resultado, indicando por dimensión cuántas preguntas van respondidas y su porcentaje de complejidad, y la complejidad acumulada; y el contenido de un solo paso a la vez, con navegación Anterior/Siguiente y un único botón primario por paso.

El resultado en vivo SHALL recalcularse con cada respuesta y con cada cambio de plazo, usando el modelo servido por el backend (mock): pool de preguntas con pesos, bandas de talla, mix de capacidades. **El plazo objetivo NO SHALL modificar la talla**: sólo el FTE (RN-34). El modelo, sus pesos y bandas NO SHALL estar definidos en el cliente (RN-40).

El **Tamizaje** SHALL presentar las seis preguntas de sí/no con el control segmentado del sistema de diseño, marcar las críticas con el componente de estado, y mostrar la recomendación con el componente de aviso: evaluación completa obligatoria (alguna crítica en sí, o tres o más en sí), recomendada (una o dos en sí) o vía rápida (ninguna). En vía rápida SHALL ofrecer además guardar sin completar las dimensiones.

Cada **dimensión** SHALL mostrar su nombre, cuántas preguntas tiene y cuánto aporta al puntaje total; cada pregunta con su código, su tipo (Objetiva u Evaluativa) y su peso, y cinco opciones seleccionables (valor 0–4) con las etiquetas de su escala: las objetivas con rangos de cantidad, las evaluativas con Sin impacto · Bajo · Medio · Alto · Crítico. Elegir una opción SHALL reemplazar la anterior.

El **Resultado** SHALL mostrar la talla con su lectura sobre la escala de tallas con el marcador del puntaje, el FTE esperado (destacado), optimista y pesimista para el plazo elegido con la banda de incertidumbre, la acción recomendada de la banda, la complejidad por dimensión con el componente de progreso y cuál pesa más, y el equipo que pide la talla según el mix de capacidades (capacidad, personas, composición en %, FTE). **Guardar evaluación** SHALL persistir las respuestas, el plazo y el resultado; la iniciativa conserva su estado.

#### Scenario: Abrir la evaluación de una iniciativa nueva
- **WHEN** el Chapter Lead abre la evaluación de una iniciativa sin respuestas
- **THEN** el tamizaje se muestra con todas las respuestas en "No", las dimensiones en 0 de N respondidas, la complejidad en 0% y la talla más baja

#### Scenario: Recomendación del tamizaje
- **WHEN** el Chapter Lead marca en sí una pregunta crítica del tamizaje
- **THEN** la recomendación pasa a "Evaluación completa obligatoria" y la opción de guardar como vía rápida desaparece

#### Scenario: Responder cambia la talla en vivo
- **WHEN** el Chapter Lead elige opciones en una dimensión que llevan el puntaje a otra banda
- **THEN** la talla, la complejidad, el esfuerzo y el FTE del encabezado cambian sin guardar

#### Scenario: El plazo no cambia la talla
- **WHEN** el Chapter Lead cambia el plazo objetivo de 6 a 3 meses
- **THEN** la talla y la complejidad se mantienen y el FTE esperado se duplica

#### Scenario: Pregunta objetiva y evaluativa
- **WHEN** el Chapter Lead ve una pregunta de cantidad y una de juicio en la misma dimensión
- **THEN** la primera ofrece rangos (por ejemplo Ninguno · 1–2 · 3–5 · 6–10 · Más de 10) y la segunda la escala Sin impacto · Bajo · Medio · Alto · Crítico, ambas con su valor 0–4 visible

#### Scenario: Guardar la evaluación
- **WHEN** el Chapter Lead guarda desde el resultado
- **THEN** la iniciativa queda con talla, FTE esperado, respuestas y plazo persistidos, el sistema confirma con un toast y el listado la muestra con su talla

#### Scenario: Volver a una evaluación guardada
- **WHEN** el Chapter Lead reabre la evaluación de una iniciativa con evaluación guardada
- **THEN** el tamizaje, las respuestas y el plazo aparecen tal como se guardaron y el resultado coincide

#### Scenario: Iniciativa inexistente
- **WHEN** se navega a la evaluación de un id que no existe
- **THEN** el sistema muestra un estado vacío con la vuelta al listado de Iniciativas
