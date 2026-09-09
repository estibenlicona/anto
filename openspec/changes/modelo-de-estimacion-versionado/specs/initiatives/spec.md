## MODIFIED Requirements

### Requirement: Evaluar una iniciativa
El sistema SHALL ofrecer una pantalla propia de evaluación por iniciativa con: un encabezado que muestra el nombre, el estado, la célula y el PO, y el **resultado en vivo** (talla, puntaje de tamaño en %, esfuerzo en persona-mes, FTE esperado) junto al **plazo objetivo** seleccionable entre 3, 6, 9 y 12 meses; un panel de pasos con Tamizaje, las dimensiones activas de la versión vigente y Resultado, indicando por dimensión cuántas preguntas van respondidas y su porcentaje, y el puntaje acumulado; y el contenido de un solo paso a la vez, con navegación Anterior/Siguiente y un único botón primario por paso.

El resultado en vivo SHALL recalcularse con cada respuesta y con cada cambio de plazo, usando la **versión vigente** del modelo servida por el backend: dimensiones, preguntas con su tipo y sus opciones, drivers, pesos por salida, reglas de talla, parámetros de esfuerzo y mix de capacidades. **El plazo objetivo NO SHALL modificar la talla ni el esfuerzo**: sólo el FTE (RN-34). El modelo, sus pesos y bandas NO SHALL estar definidos en el cliente (RN-40).

El sistema SHALL mantener separadas las tres salidas del modelo. El peso de una pregunta en la salida de riesgo NO SHALL modificar el tamaño ni el esfuerzo de la iniciativa: la incertidumbre afecta la confianza en el resultado, no su magnitud.

El **Tamizaje** SHALL presentar las seis preguntas de sí/no con el control segmentado del sistema de diseño, marcar las críticas con el componente de estado, y mostrar la recomendación con el componente de aviso: evaluación completa obligatoria (alguna crítica en sí, o tres o más en sí), recomendada (una o dos en sí) o vía rápida (ninguna). En vía rápida SHALL ofrecer además guardar sin completar las dimensiones.

Cada **dimensión** SHALL mostrar su nombre, cuántas preguntas tiene y cuánto aporta al puntaje total; cada pregunta con su código, su tipo —Cuantitativa, Evaluativa o Binaria—, su driver y su peso. Cada pregunta SHALL ofrecer el control que corresponde a su tipo: un campo numérico con su unidad para una cuantitativa, las opciones de su escala para una evaluativa, y sí/no para una binaria. Elegir una opción SHALL reemplazar la anterior.

Las opciones SHALL mostrarse **sólo con su etiqueta**: el puntaje normalizado que cada una vale es del motor y NO SHALL mostrarse junto a la opción ni anunciarse con ella, porque quien responde describe un hecho y no asigna puntos. El sistema SHALL mostrar en cambio la **derivación** de la respuesta dada —respuesta, valor normalizado, driver y salidas a las que aporta con su peso—, que es lo que hace auditable el cálculo.

El **Resultado** SHALL mostrar el tamaño y el esfuerzo como dos lecturas separadas: la talla con su puntaje sobre la escala de tallas con el marcador, y el esfuerzo en persona-mes con su mínimo, su esperado y su máximo. SHALL mostrar la capacidad que exige el plazo para cada uno de los plazos ofrecidos, de modo que se vea que la talla y el esfuerzo no cambian entre ellos. SHALL mostrar la acción recomendada de la banda, el aporte de cada dimensión al puntaje junto con cuánto pesa esa dimensión, y la demanda por perfil según el mix, con su porcentaje y su FTE. **Guardar evaluación** SHALL persistir las respuestas, el plazo, el resultado y **la versión del modelo con la que se calculó**; la iniciativa conserva su estado.

#### Scenario: Abrir la evaluación de una iniciativa nueva
- **WHEN** el Chapter Lead abre la evaluación de una iniciativa sin respuestas
- **THEN** el tamizaje se muestra con todas las respuestas en "No", las dimensiones en 0 de N respondidas, el puntaje en 0% y la talla más baja

#### Scenario: Recomendación del tamizaje
- **WHEN** el Chapter Lead marca en sí una pregunta crítica del tamizaje
- **THEN** la recomendación pasa a "Evaluación completa obligatoria" y la opción de guardar como vía rápida desaparece

#### Scenario: Responder cambia la talla en vivo
- **WHEN** el Chapter Lead elige opciones en una dimensión que llevan el puntaje de tamaño a otra banda
- **THEN** la talla, el puntaje, el esfuerzo y el FTE del encabezado cambian sin guardar

#### Scenario: El plazo no cambia la talla
- **WHEN** el Chapter Lead cambia el plazo objetivo de 6 a 3 meses
- **THEN** la talla, el puntaje y el esfuerzo en persona-mes se mantienen y el FTE esperado se duplica

#### Scenario: El riesgo no agranda la iniciativa
- **WHEN** el Chapter Lead responde una pregunta cuyo peso está sólo en la salida de riesgo
- **THEN** la talla y el esfuerzo no cambian, y sí cambia la lectura de riesgo del resultado

#### Scenario: Pregunta objetiva y evaluativa
- **WHEN** el Chapter Lead ve una pregunta cuantitativa, una evaluativa y una binaria
- **THEN** la primera pide un número con su unidad, la segunda ofrece las opciones de su escala y la tercera sí o no, y ninguna muestra el puntaje que vale la respuesta

#### Scenario: La traza del cálculo
- **WHEN** el Chapter Lead responde una pregunta cuantitativa
- **THEN** el sistema muestra el número respondido, el tramo en el que cae, su valor normalizado, el driver al que alimenta y con qué peso aporta a cada salida

#### Scenario: Guardar la evaluación
- **WHEN** el Chapter Lead guarda desde el resultado
- **THEN** la iniciativa queda con talla, esfuerzo, FTE esperado, respuestas, plazo y versión del modelo persistidos, el sistema confirma con un toast y el listado la muestra con su talla

#### Scenario: Volver a una evaluación guardada
- **WHEN** el Chapter Lead reabre la evaluación de una iniciativa con evaluación guardada
- **THEN** el tamizaje, las respuestas y el plazo aparecen tal como se guardaron y el resultado coincide

#### Scenario: Una evaluación calculada con otra versión
- **WHEN** el Chapter Lead abre una evaluación guardada con una versión del modelo distinta de la vigente
- **THEN** el sistema la muestra tal como se calculó, indica con qué versión se hizo, y ofrece recalcularla con la vigente sin hacerlo por su cuenta

#### Scenario: Iniciativa inexistente
- **WHEN** se navega a la evaluación de un id que no existe
- **THEN** el sistema muestra un estado vacío con la vuelta al listado de Iniciativas
