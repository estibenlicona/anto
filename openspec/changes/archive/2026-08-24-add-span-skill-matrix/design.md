## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **La dirección está elegida**: el canvas registra que la propuesta B (matriz personas × habilidades) es la pantalla, y que la lectura por habilidad en filas queda como posible vista compacta futura.
- **El dato ya existe**: `add-skill-assessment` expone un snapshot de las evaluaciones cerradas con nivel y brecha por persona y habilidad; `add-skills-catalog` da las habilidades activas y el nivel esperado por rol.
- **La tabla la habilita tuip**: `add-matrix-table-primitives` agrega columna fija y densidad `matrix`. Sin eso, la matriz no se puede recorrer.
- La app no compila Tailwind del paquete: los anchos calculados van inline.

## Goals / Non-Goals

**Goals:**

- Responder de un vistazo las dos preguntas del span: cómo está repartida la gente por nivel en cada habilidad, y cuántas personas hay que trabajar.
- Que la brecha sea siempre persona contra su propio rol, sin umbrales únicos que mientan.

**Non-Goals:**

- El perfil individual y el plan de acciones (change siguiente).
- Implementar la propuesta A como vista alterna.
- Virtualizar la matriz: si el span crece hasta pesar, se acota por habilidades o se pagina.

## Decisions

- **La celda muestra el nivel, y la brecha se marca sobre él.** Mostrar sólo la brecha respondería una pregunta y perdería la otra; el usuario pidió las dos. El nivel va con el medidor de cuatro pasos que la app ya usa en el listado de personas, y la brecha con un fondo de estado y cuántos niveles faltan.
- **Nada de umbral por habilidad.** Se descartó explícitamente durante el diseño: con roles mezclados en el span, una sola línea de corte por habilidad es falsa. La comparación es siempre celda contra el rol de esa fila.
- **Los colores cambian de familia según lo que significan**: el nivel usa la escala de acento (ordinal, sin juicio); la brecha usa el rol semántico de peligro (es un estado). Es la regla que el sistema de diseño ya establece y evita que "morado" parezca mejor que "gris" por color en vez de por posición.
- **Los totales cuentan sólo evaluaciones cerradas.** Incluir a los pendientes como si estuvieran bien haría que una habilidad se viera mejor de lo que está sólo porque falta evaluar gente; por eso la pantalla informa aparte cuántos están pendientes.
- **El detalle por habilidad es un panel lateral, no una pantalla.** Es una consulta de paso —"quiénes son esos siete"— y volver a la matriz sin perder el scroll importa más que tener URL propia. La agrupación va de menor a mayor nivel porque lo que se va a buscar ahí es a los que están cortos.
- **Acotar habilidades es de la pantalla, no del dato.** Los totales se recalculan sobre lo visible, y eso queda dicho en la pantalla para que nadie lea un total parcial como el total del span.

## Risks / Trade-offs

- **[La matriz escala mal en lo ancho]** → Es la contra conocida de la propuesta B, anotada al elegirla. Se mitiga con columna fija, acotar habilidades y ordenar por brechas; si aparece un span mucho mayor, la lectura por habilidad (propuesta A) es la salida ya diseñada.
- **[Una celda vacía puede leerse como cero]** → Por eso la fila se marca como pendiente de evaluar y los totales la excluyen explícitamente.
- **[Depende de tres changes previos]** → Anotado en el proposal y como primera tarea del apply: sin el catálogo, las evaluaciones y la tabla de tuip, esta pantalla no tiene con qué dibujarse.

## Migration Plan

1. Service y adapter del agregado del span (matriz, totales por fila y columna, pendientes) con sus pruebas.
2. Matriz sobre la `Table` nueva: columna fija, densidad de matriz, celda con medidor y marca de brecha.
3. Acotar habilidades y ordenar filas y columnas.
4. Drawer por habilidad con las personas agrupadas por nivel.
5. Ruta, entrada de navegación y breadcrumb; ajuste de las pruebas del shell.
6. Verificación en pantalla.

Rollback: retirar la ruta y la entrada del menú; el catálogo y las evaluaciones quedan intactos.
