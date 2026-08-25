## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **El diseño está aprobado**: artboard "Evaluación de una persona" — índice de habilidades a la izquierda, los cuatro niveles con sus criterios marcables a la derecha, y la brecha armada con los criterios sin marcar.
- **El catálogo ya resuelve** los criterios por nivel, el nivel esperado por rol y el versionado (`add-skills-catalog`): este change los consume, no los redefine.
- **`OptionCard` y `Checkbox` ya existen** en tuip; los cuatro niveles son un `OptionCardGroup` con la lista de criterios dentro de cada tarjeta.
- La app no compila Tailwind del paquete: cualquier medida calculada va inline.

## Goals / Non-Goals

**Goals:**

- Que elegir el nivel no dependa de recordar los criterios: se leen mientras se decide.
- Que registrar la brecha deje de ser un segundo trabajo: sale de lo que quedó sin marcar.

**Non-Goals:**

- Decidir el nivel por el sistema a partir de los criterios (decisión abierta, anotada en el canvas).
- Autoevaluación y calibración.
- Tocar la pantalla de Personas más allá de la entrada a evaluar.

## Decisions

- **Los criterios marcados se guardan por evaluación, no por persona.** Lo que la persona cumplía en agosto es un hecho de esa evaluación; guardarlo suelto haría que reevaluar pisara la historia.
- **El nivel lo elige el líder; el contador es evidencia.** Es lo que el diseño muestra y deja la regla abierta —si el nivel se alcanza con todos los criterios o con una mayoría— sin cablearla. Alternativa considerada: que el sistema proponga el nivel más alto con todos sus criterios cumplidos. Se descarta por ahora: sin la regla acordada, proponer un nivel es imponer una definición.
- **La nota es obligatoria sólo con brecha.** Sin brecha no hay nada que justificar; con brecha, la nota es lo que después le da sentido a la acción del plan.
- **La brecha no se guarda como texto libre**: se guarda el nivel evaluado y los criterios marcados, y todo lo demás —tamaño de la brecha, criterios faltantes— se deriva. Así no puede quedar desincronizada con el nivel.
- **El cierre estampa la versión del catálogo.** Es lo que permite que una evaluación vieja siga siendo legible cuando los criterios cambien.
- **La evaluación vive bajo la persona** (`/app/lead/personas/:id/evaluacion`) y no en una sección propia: se evalúa a alguien, no se "hace una evaluación".

## Risks / Trade-offs

- **[Marcar unos veinte criterios por habilidad es mucho trabajo]** → Marcar es opcional: el nivel se puede elegir sin marcar nada, y lo marcado es lo que después evita escribir la brecha. La pantalla no obliga a completar todo.
- **[Con muchas habilidades la evaluación se vuelve larga]** → Se guarda y se retoma; el índice muestra el avance y qué falta.
- **[La regla de cuándo se alcanza un nivel queda sin definir]** → Anotada como decisión abierta; el diseño funciona sin ella y agregarla después no cambia el modelo, sólo suma una sugerencia.

## Migration Plan

1. Mock: modelo de evaluación, derivación de nivel esperado y brecha contra el catálogo, estampado de versión, semillas y snapshot para los changes siguientes.
2. Service, adapter y hooks con sus pruebas.
3. Pantalla: índice con avance, los cuatro niveles con criterios marcables y contadores, bloque de brecha derivada, navegación entre habilidades y cierre.
4. Entrada desde el detalle de persona y ruta.
5. Verificación en pantalla.

Rollback: retirar la ruta y la entrada; el catálogo queda intacto.
