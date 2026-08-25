## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **El diseño está aprobado**: canvas "Mapa de calor del span", con tres artboards — el mapa con su leyenda, el popover en detalle y los seis estados de un cuadro.
- **El dato ya existe entero**: el snapshot del span da nivel, exigido y brecha por celda; las evaluaciones cerradas dan los criterios marcados y la nota; el plan da las acciones. El popover no necesita ningún endpoint nuevo.
- **La escala de atención, el ancla del popover y el medidor con umbral los trae tuip** (`add-heatmap-primitives`). Sin eso la celda tendría que inventar su propia rampa y la pantalla montaría un popover por celda.
- La app compila Tailwind pero los tokens llegan como clases ya generadas del paquete.

## Goals / Non-Goals

**Goals:**

- Que la matriz entre en pantalla y responda de un vistazo dónde hay que enfocarse.
- Que el clic valga la pena: que el panel diga algo que el mapa no podía.

**Non-Goals:**

- Cambiar qué es una fila, ni los totales, ni el acotado, ni el orden, ni el panel por habilidad.
- Un componente de celda en tuip: la celda es dominio de esta app.
- Nombres de habilidad a la vista en el encabezado: la columna no los muestra. El nombre vive en el detalle de la celda, y como nombre accesible de la columna.
- Un color para "supera lo que su rol pide".

## Decisions

- **La matriz sigue siendo una `<table>`.** Es un cambio de cómo se dibuja la celda, no de la estructura del dato: una matriz de datos es una tabla, y los lectores de pantalla la recorren por filas y columnas. Alternativa considerada: una cuadrícula de `div`s, que es lo que el artboard sugiere visualmente. Se descarta: perdería la semántica y también `stickyFirstColumn`, que sigue haciendo falta cuando el chapter crece.
- **El color codifica la brecha, no el nivel.** Es el cambio de fondo, y su precio está declarado: el nivel deja de leerse en la matriz. Se acepta porque la matriz pasa a responder una pregunta bien en vez de tres a medias, y el nivel queda a un clic.
- **Lo que está en orden va en la familia neutra.** Si el "al nivel" fuera verde, el mapa tendría color en todas partes y el rojo dejaría de saltar. Es la misma regla que la escala de atención declara en el sistema; acá se aplica.
- **Los tres estados que no son brecha se distinguen entre sí.** "Al nivel", "sin nivel exigido" y "sin evaluar" significan cosas distintas y llevan a acciones distintas: la primera no requiere nada, la segunda es un hueco del catálogo que se llena en Administración, la tercera es una evaluación pendiente. Un solo gris las confundiría.
- **Un solo popover controlado, anclado a la celda activa.** Con 126 celdas, montar un disparador por celda es caro y ruidoso para el teclado. La celda es un `button` que pone su propio elemento como ancla del popover compartido.
- **El conteo por columna se calcula en el adapter, no en el popover.** El dato "cuántas personas más tienen brecha acá" ya se calcula para el pie de la columna; el popover lo consume en vez de recalcularlo, así el número del pie y el del panel no pueden discrepar.
- **La celda mide 44 px.** Empezó en 26. Se subió al ver en pantalla que la fila dejaba un hueco largo entre el nombre y sus cuadros: la tabla se estiraba al ancho disponible y, como las columnas de habilidad estaban fijas, toda la holgura —unos 450 px— caía en la única columna elástica, la de persona. Con el cuadro más grande y la tabla midiendo lo que mide su contenido, el mapa ocupa ese ancho en vez de dejarlo en blanco, y el color gana superficie donde leerse. Sigue siendo la medida más frágil del diseño.

  Verificado en pantalla: la tabla mide 848 px sin desplazamiento horizontal y los cuadros arrancan pegados a los nombres. El paso más bajo (`#B57A00`, ámbar) se distingue del neutro sin esfuerzo: 3.65:1 contra la fila blanca, contra 1.14:1 del gris de "al nivel". Lo que **no** se cumple es la rampa del canvas: allí los pasos bajos eran claros (`#F5C77E`, `#E08A93`) y la intensidad se leía por luminosidad. Esos valores dan 1.5:1 y 2.0:1, por debajo del piso de 3:1 del sistema, así que la escala publicada gradúa por matiz —ámbar → rojo— y no por claridad. Se distingue igual, pero se lee menos como "calor".

## Risks / Trade-offs

- **[Perder el nivel de un vistazo es un retroceso para quien leía la fila como perfil]** → El perfil completo de una persona ya vive en su plan individual, que se abre desde el nombre de la fila y muestra el nivel con su medidor. La matriz deja de duplicarlo a medias.
- **[El cuadro más grande hace la fila más alta]** → De 43 px a 59 px por fila: con 18 personas la matriz pasa de entrar casi entera a pedir un poco de desplazamiento vertical. Se acepta porque la pregunta que la pantalla responde —dónde enfocarse— se contesta con las primeras filas, que son las de más brechas. El tamaño es una constante de la celda: bajarlo es un número.
- **[Depende de que tuip esté reinstalado]** → Primera tarea del apply, y con la comprobación explícita: ya pasó una vez que el dev server sirviera el paquete anterior.
- **[La escala de color tiene que ser legible para daltonismo]** → La intensidad crece además de cambiar el matiz, y la leyenda nombra cada paso en palabras. El detalle da la cifra exacta.

## Migration Plan

1. Adapter: paso de atención por celda y el conteo por columna que el panel consume.
2. La celda y la tabla: cuadro uniforme, encabezado que ya no fuerza el ancho, leyenda.
3. El panel de celda con sus tres variantes, anclado y controlado desde la pantalla.
4. Pruebas y verificación en pantalla.

Rollback: la celda anterior sigue siendo una función pura del mismo dato; volver es reemplazar el componente de celda.
