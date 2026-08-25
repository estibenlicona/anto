---
"@tuya-ui/components": minor
"@tuya-ui/tokens": minor
---

Las tres piezas que un mapa de calor necesitaba y el sistema no tenía:

- **Escala de atención**: el cuarto vocabulario de color, bajo `--color-attention-<paso>-fill`, con tres escalones —`low`, `medium`, `high`— para graduar **cuánta** atención pide algo cuando un solo paso no alcanza. Es lo que ni los roles semánticos ni el acento podían decir: un rol afirma un estado sin graduarlo, el acento gradúa sin afirmar nada, y ésta gradúa un estado ya afirmado. No hay un cuarto paso para "está en orden" — eso va en la familia neutra, porque una escala donde todo lleva color deja de señalar.

  Los tres salen de los roles que ya expresan atención: en tema claro `high` es el mismo valor que el relleno de `danger`, para que el escalón más grave de un mapa y una alerta del sistema no sean dos rojos distintos. Los pasos `400` de `warning` y `danger` —los candidatos obvios— quedaron afuera: dan 2.12:1 y 2.95:1 sobre la fila seleccionada, por debajo del piso de 3:1. En tema oscuro la coincidencia con `danger` tampoco se sostiene (1.90:1 sobre la fila oscura), así que ahí `high` toma el escalón claro de la misma familia. Un solo paso por escalón y es relleno: no publica tinta para texto, porque `low` cae en la zona donde ni el texto claro ni el oscuro llegan a 4.5:1.

- **`LevelMeter` con `expected`**: la posición esperada dentro de la misma escala. La marca va en el **límite** de ese paso y no encima, para que se lea "hasta acá" y no "en este escalón"; cuelga absoluta del borde derecho de su segmento, así que no entra en el reparto y los segmentos miden lo mismo con marca y sin ella. Se anuncia junto a la alcanzada (`"2 de 4, se esperan 3"`). Sin `expected`, el medidor se dibuja como antes.

- **`PopoverAnchor` y `PopoverContent padded`**: el ancla permite posicionar la superficie sobre un elemento distinto del disparador —o sin disparador—, que es lo que deja a una cuadrícula de muchas celdas mantener un único Popover controlado en vez de montar uno por celda. Se puede envolver al elemento o pasar `virtualRef` con uno que ya se tenga: en una cuadrícula, envolver sólo la celda activa cambiaría la forma del árbol en esa posición y React remontaría la celda, llevándose el foco. `padded={false}` saca el relleno por defecto para contenido a sangre, conservando borde, radio y elevación. Es una prop y no una clase porque `cn` concatena y no fusiona utilidades: un `p-0` de afuera perdería contra el `p-4` propio.

  La superficie además se acota al espacio que queda junto al elemento anclado y desplaza adentro: un contenido más alto que la pantalla se dibujaba fuera de ella, con el encabezado cortado arriba — justo el caso en que más contenido tiene.

  Al cerrarse, el Popover devuelve el foco a quien lo tenía al abrirse. Radix lo devolvía a su disparador, y en modo controlado no hay ninguno: se quedaba con `null`, hacía `preventDefault()` y el foco terminaba en el `body`. No lo hace cuando el cierre vino de tocar afuera —el foco corresponde a donde el usuario acaba de tocar— ni cuando el consumidor declara su propio `onCloseAutoFocus`.
