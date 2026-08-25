## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **La pantalla ya está armada con tuip.** `AssessmentHeader` usa `Badge` y `Button`; el índice usa `Card` e `Icon`. Nada de esto se reescribe: se cambian variantes y se agrega un `Modal`.
- **Cerrar hoy es un solo clic y es irreversible.** `handleClose` persiste el borrador pendiente y llama a `close()` sin pasar por ninguna confirmación. La red que se agrega es la que hoy no existe.
- **`skill-assessment` todavía no está en `openspec/specs/`.** Vive en `add-skill-assessment`, sin archivar; los bloques MODIFIED de este change se escribieron sobre ese texto pendiente.
- **Nada de esto requiere tuip.** `Modal` con sus tres partes, `Badge` con seis variantes y `Button variant="secondary"` ya están publicados y reinstalados.

## Goals / Non-Goals

**Goals:**

- Que la advertencia sobre cerrar aparezca cuando frena algo, y no antes.
- Que el estado de una habilidad se reconozca sin leer la fila.

**Non-Goals:**

- Cambiar qué valida el cierre, cómo se calcula la brecha o qué se congela.
- Un componente de confirmación reutilizable: acá hay un solo caso, y un patrón se extrae del segundo.
- Tocar el índice más allá del estado: el orden, la agrupación y el ícono de evaluada se conservan.

## Decisions

- **La confirmación es un `Modal` y no un `window.confirm`.** El diálogo tiene que decir tres cosas —qué se fija, que se abre el plan, que no se deshace— y eso no entra en un confirm del navegador ni respeta el sistema de diseño. Alternativa considerada: un `Popover` sobre el botón, que se descarta porque cerrar es destructivo y un popover se disipa al hacer clic afuera, sin decidir nada.
- **El diálogo se monta sólo cuando se necesita, y la acción primaria sigue siendo "Cerrar evaluación".** El botón del encabezado deja de disparar el cierre y pasa a abrir la confirmación; el cierre real vive en el botón primario del pie del modal. Así el nombre de la acción no cambia entre los dos lugares, que es lo que hace que la confirmación se lea como el mismo paso y no como uno nuevo.
- **La validación sigue antes de abrir el diálogo.** `handleClose` ya persiste el borrador pendiente y aborta con un mensaje si eso falla. Ese paso se mantiene **antes** de mostrar la confirmación: pedir confirmar algo que va a fallar es peor que no pedirla. El diálogo aparece sólo cuando el cierre puede efectivamente ocurrir.
- **"Evaluando" e "Pendiente" son `Badge`, y "evaluada" sigue siendo el ícono.** Es la decisión que más se discutió: con nueve a once habilidades, un badge por fila pendiente es una columna de badges repetidos al empezar. Se acepta porque el pedido es explícito y porque el badge es lo que permite reconocer el estado sin leer; el ícono de verificación se conserva para la evaluada, que es la que menos hace falta buscar. Si en pantalla resulta ruidoso, la salida es una constante: dejar el badge sólo para la que se está evaluando.
- **Las variantes de badge dicen el estado, no lo decoran.** `info` para la que se está evaluando —es dónde estás parado, no un problema— y `neutral` para pendiente. Ni `warning` ni `danger`: una habilidad sin evaluar todavía no es un incumplimiento, y teñirla de ámbar convertiría el arranque normal de toda evaluación en una pantalla de alertas.
- **La redacción del nivel exigido queda en el contenedor, con las dos variantes juntas.** Es donde ya se decide entre "declara nivel" y "no declara", y separarlas haría que la próxima corrección de texto toque dos lugares.
- **`subtle` → `secondary` y nada más.** No se cambia el orden de los botones ni el texto: lo que faltaba era el borde.

## Risks / Trade-offs

- **[Un paso más para cerrar, en una acción que se hace una vez por ciclo]** → Es exactamente el caso donde un paso más vale la pena: cerrar congela nueve habilidades y no se deshace. El costo es un clic por evaluación.
- **[Nueve badges "Pendiente" al abrir una evaluación nueva]** → Es la consecuencia asumida de la decisión. Queda anotado para mirar en pantalla, con la salida ya identificada.

  Verificado: el ruido temido no aparece —con 4 de 9 evaluadas se ven 4 badges "Pendiente" y 1 "Evaluando", y se leen bien—, pero surgió otro costo que no se había previsto: el badge le quita ancho al nombre, y los largos ("Ciclo de desarrollo de software") pasan a dos líneas, con lo que las filas del índice quedan de alturas desiguales. Si molesta, la salida es la misma constante ya identificada, o dar más ancho a la columna del índice.
- **[La confirmación puede quedar desalineada con lo que el cierre valida]** → El diálogo se abre después de la validación, así que no puede prometer un cierre que no va a ocurrir. La prueba que lo cubre es la de "cerrar incompleta": ahí el diálogo no debe aparecer.

## Migration Plan

1. Encabezado: variante del botón secundario y sacar el aviso permanente.
2. Confirmación: el modal, enganchado después de la validación existente.
3. Índice: los dos badges.
4. Redacción del nivel exigido.
5. Pruebas y verificación en pantalla.

Rollback: los cuatro puntos son independientes entre sí; volver atrás cualquiera no afecta a los otros.
