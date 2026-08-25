## Why

Con el catálogo cargado (`add-skills-catalog`) falta el acto que produce el dato: la evaluación. Hoy el Chapter Lead decide el nivel de cada persona en cada habilidad de memoria y anota las brechas aparte, en un texto que no se puede sumar ni comparar. El diseño aprobado (canvas "Plan de Carrera del Chapter", artboard "Evaluación de una persona") resuelve las dos cosas de una vez: los criterios se marcan uno por uno mientras se elige el nivel, y los que quedan sin marcar **son** la brecha, sin escribirla de cero.

Este change produce el insumo de los dos siguientes: sin niveles evaluados no hay matriz del span ni plan individual.

## What Changes

- **Evaluación por persona y ciclo**: se abre desde una persona del chapter, recorre las habilidades activas del catálogo y guarda, por cada una, el nivel evaluado y los criterios cumplidos.
- **Criterios marcables**: cada nivel muestra su lista de criterios con una marca por criterio y un contador (“cumple 5 de 6”). El nivel lo elige el Chapter Lead; el contador es la evidencia, no una regla que decida por él.
- **La brecha se deriva**: cuando el nivel evaluado queda por debajo del que pide el rol de esa persona, la evaluación registra una brecha cuyo contenido son los criterios sin marcar del nivel exigido, más una nota opcional del evaluador.
- **Estados**: `En curso` mientras se recorre, `Cerrada` al terminar. Cerrar SHALL exigir que todas las habilidades activas tengan nivel, congela las cifras y estampa la versión del catálogo usada. Una evaluación cerrada es de sólo lectura; corregir se hace evaluando de nuevo.
- Handler de mock para evaluaciones, que resuelve el nivel esperado y los criterios contra la versión del catálogo correspondiente.

### Fuera de alcance

- La matriz del span y el plan individual: changes siguientes, que consumen lo que éste produce.
- Autoevaluación de la persona y calibración posterior: hoy evalúa el líder.
- Decidir automáticamente el nivel a partir de los criterios marcados (queda como decisión abierta del diseño).

## Capabilities

### New Capabilities

- `skill-assessment`: evaluación de una persona por ciclo, con nivel y criterios cumplidos por habilidad y la brecha derivada.

### Modified Capabilities

- `api-mocking`: handler nuevo de evaluaciones.

## Impact

- Frontend: nueva feature `src/features/assessments` (service, adapter, hooks, contenedor de evaluación y sus componentes), ruta `/app/lead/personas/:id/evaluacion` y entrada desde el detalle de persona.
- Mocks: `assessments.handlers.ts` + semillas; consume los snapshots del catálogo y de personas.
- tuip: sin cambios. Los cuatro niveles con sus criterios se componen con `OptionCard` y `Checkbox`, ya publicados.
- **Orden**: depende de `add-skills-catalog` (capacidad `skills-catalog` y su handler). Debe archivarse después de él.
