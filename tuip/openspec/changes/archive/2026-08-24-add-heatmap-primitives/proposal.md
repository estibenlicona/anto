## Why

La matriz del span de la app de Capacidad se va de ancho: nueve columnas de habilidad con su nombre completo y un medidor por celda piden 1260 px, y con doce habilidades ya no entra en ninguna pantalla. El diseño aprobado la convierte en un **mapa de calor**, donde el color deja de decir el nivel y pasa a decir cuánto le falta a esa persona para lo que su rol pide, con el detalle en un popover.

Ese mapa necesita tres cosas que el sistema no tiene todavía, y las tres son del sistema y no de una pantalla: una escala de color que gradúe la alerta, un popover que se pueda anclar a la celda que se acaba de tocar en vez de a su propio disparador, y el medidor de nivel con la marca de lo que se exige — que hoy cada consumidor dibuja por su cuenta.

## What Changes

- **Escala de atención**: un vocabulario de color nuevo, separado del semántico y del de acento, con tres pasos de relleno de intensidad creciente para graduar cuánta atención pide algo. Ni el acento (que declara no decir nada sobre el estado) ni los roles de estado (un solo paso cada uno) cubren una rampa de alerta.
- **`PopoverAnchor`**: la parte atómica que permite abrir un único Popover controlado y anclarlo a un elemento cualquiera. Sin ella, una cuadrícula de 126 celdas necesita 126 disparadores montados para ofrecer un detalle al hacer clic.
- **`PopoverContent` sin relleno impuesto**: hoy el contenido lleva un relleno fijo, lo que impide que un popover tenga encabezado y pie a sangre con su propio borde o fondo. El relleno pasa a ser el valor por defecto que el consumidor puede reemplazar.
- **`LevelMeter` con marca de umbral**: el medidor acepta la posición que se espera y dibuja una marca sobre los segmentos. Hoy la app la superpone por fuera con un elemento absoluto, y la pieza vive duplicada en cada pantalla que la necesita.

### Fuera de alcance

- El mapa de calor en sí y su popover: son de la app, en el change siguiente.
- Un componente de celda de mapa de calor: la celda es dominio de la app, que la compone con la escala nueva.
- Cambiar la escala de acento o los roles de estado existentes.

## Capabilities

### Modified Capabilities

- `design-tokens`: se agrega la escala de atención como vocabulario de color propio, con su regla de uso frente al acento y a los roles de estado.
- `component-library`: `LevelMeter` gana la marca de umbral; `Popover` gana su ancla como parte atómica y deja de imponer el relleno de su contenido.

## Impact

- **tokens**: familia de color nueva bajo su propio prefijo, en modo claro y oscuro, más su verificación de contraste.
- **components**: `level-meter.tsx` y `popover.tsx`; docs y ejemplos de los dos.
- **app**: nada rompe. Los tres agregados son aditivos — un `LevelMeter` sin umbral, un `Popover` con disparador y un `PopoverContent` sin clase propia se comportan exactamente como hoy.
- **Orden**: se publica y se reinstala en la app antes de aplicar el change del mapa de calor.
