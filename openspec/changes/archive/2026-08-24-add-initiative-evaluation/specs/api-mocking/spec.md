## ADDED Requirements

### Requirement: Handler de mock para iniciativas
El sistema SHALL exponer un handler de mock con `GET` listado paginado de iniciativas (acepta `search`, `status`, `squadId` y `talla` repetibles, aplicados antes de paginar), `GET` por id, `POST` alta, `PUT` edición, `PUT` de estado a un sub-recurso (`Active` sólo con talla; `Closed` sólo desde `Active`; 400 en otro caso), `GET` resumen (sin evaluar, activas por talla, FTE demandado de las activas), y `PUT` de evaluación a un sub-recurso que recibe respuestas de tamizaje, respuestas por pregunta y plazo, calcula con el modelo vigente y persiste respuestas y resultado (talla, puntaje, porcentaje, PM, FTE esperado/optimista/pesimista, por dimensión, mix), devolviendo la iniciativa actualizada; 404 si no existe, 400 si una respuesta referencia una pregunta que no está en el pool o un valor fuera de 0–4. Los cambios persisten en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio. Cada iniciativa SHALL llevar `id`, `name`, `squadId`, `squadName`, `productOwner`, `targetMonths`, `status`, `evaluation | null`. Los datos de ejemplo SHALL incluir iniciativas sin evaluar, en evaluación, activas con distintas tallas y cerradas, con los **mismos ids y nombres** que hoy usan el catálogo del backlog y las asignaciones.

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
- **THEN** la iniciativa devuelta trae talla y resultado coherentes con `computeEvaluation` sobre el modelo vigente, y un `GET` posterior los refleja

#### Scenario: Catálogos derivados
- **WHEN** el backlog o las asignaciones piden sus catálogos de iniciativas
- **THEN** los ids y nombres coinciden con los del mock de iniciativas (incluidas las creadas en la sesión)

### Requirement: Handler de mock para el modelo de evaluación
El sistema SHALL exponer un `GET` del modelo de evaluación armado **en el momento de la petición** desde los mocks de Admin: pool de preguntas (id, dimensión, texto, peso) con el tipo de cada pregunta (Objetiva con su escala de rangos, o Evaluativa con la escala cualitativa) que el mock asigna por id; las siete dimensiones en orden; el tamizaje (seis preguntas con su marca de crítica); las bandas de talla vigentes (límites, PM mínimo y máximo, lectura, acción recomendada); y el mix de capacidades vigente. Un cambio guardado en Admin SHALL reflejarse en el siguiente `GET` del modelo.

#### Scenario: El modelo sigue a los parámetros
- **WHEN** Admin guarda un peso distinto para una pregunta o mueve un límite de banda
- **THEN** el siguiente `GET` del modelo trae el peso o el límite nuevo, y una evaluación guardada después usa esos valores

#### Scenario: Tipo y escala de cada pregunta
- **WHEN** se hace un `GET` del modelo
- **THEN** cada pregunta trae su tipo y las cinco etiquetas de su escala (rangos para las de cantidad, cualitativa para las demás), y toda pregunta del pool tiene uno
