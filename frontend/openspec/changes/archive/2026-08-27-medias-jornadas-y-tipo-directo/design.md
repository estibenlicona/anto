## Context

`RegisterAbsenceDrawer` pide hoy persona, tipo y rango con tres controles iguales: dos `Select` y un `DateRangeField`, dentro de dos `FormSection`. Los días hábiles se cuentan con `countBusinessDays(start, end)` y se muestran bajo el rango.

La aritmética vive en `businessDays.ts` y la comparten dos consumidores: el handler del mock (que responde `businessDays`, `businessDaysInMonth` y los impactos ya calculados) y el formulario (que cuenta antes de enviar). El backend todavía no conoce las ausencias, así que el contrato lo fija el mock. El impacto de capacidad sale de `computeSquadImpacts`: `businessDaysInMonth / monthBusinessDays × FTE × dedicación`.

El diseño de la propuesta está aprobado (tipo en tres tarjetas, encabezado alineado, resumen bajo el rango). Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Elegir el tipo sin abrir nada, con los tres a la vista.
- Poder pedir medias jornadas en los extremos sin cambiar la fórmula de capacidad.
- Que el decimal aparezca sólo cuando existe, en los tres sitios donde se cuentan días.
- Arreglar la alineación del encabezado en el componente compartido, no en la pantalla.

**Non-Goals:**
- Mañana o tarde: media jornada es 0.5 venga cuando venga (decisión del usuario).
- Medias jornadas en días interiores del rango.
- Tocar aprobación, rechazo, filtrado o paginación.
- Cambiar `DateRangeField` ni ningún componente de tuip.

## Decisions

**1. Dos banderas en el contrato, `startsHalfDay` y `endsHalfDay`, en vez de un número de días.**
Que el cliente mande "4.5 días" obligaría al servidor a confiar en su aritmética; que mande dos banderas deja el conteo donde ya vive, en `businessDays.ts`, y hace el dato reversible: al releer el mes se sabe qué extremo era medio, no sólo cuánto sumaba. En un rango de un día, las dos banderas se envían con el mismo valor —la interfaz enseña una sola marca— para que la regla de conteo no tenga un caso especial.

**2. `countBusinessDays` gana un tercer parámetro opcional con las dos marcas, en vez de una función nueva.**
Es el mismo cálculo con un ajuste al final: contar los hábiles como hoy y restar 0.5 por cada extremo marcado **que además sea día hábil**. Firmarlo como opcional deja intactas todas las llamadas actuales, incluidas las del mock que cuentan tramos de mes. Restar sólo si el extremo es hábil evita el absurdo de descontar media jornada de un sábado.

**3. El recorte del mes vuelve a evaluar qué extremos son medios.**
`businessDaysInMonth` recorta la ausencia al mes visible: un rango que cruza de mes tiene extremos recortados que ya no son los de la ausencia. La marca sólo se aplica al extremo si el recorte lo conserva —el inicio del tramo coincide con el inicio de la ausencia, o su fin con el fin—. Sin esto, una ausencia de fin de mes descontaría la media jornada dos veces, una en cada mes.

**4. Formatear días con una función propia, `formatBusinessDays`, y no con `toFixed`.**
`toFixed(1)` escribiría "3.0" para un valor entero, que es exactamente lo que la spec prohíbe. La función devuelve el entero pelado o un decimal, y vive junto a la aritmética para que la tabla, la card y el formulario no la reimplementen cada una a su manera.

**5. El grupo de tipos es un `radiogroup` de botones, no tres `<button>` sueltos.**
Tres botones sueltos no anuncian que son excluyentes ni cuál está elegido, y obligan a tabular tres veces. Con `role="radiogroup"` y `role="radio"` (o `<input type="radio">` ocultos con etiqueta visible) el teclado entra una vez y se mueve con las flechas. El estado elegido lleva marca de verificación además del color, porque el color solo no es un canal admisible.

**6. Las marcas de media jornada son casillas junto al rango, y el formulario enseña una sola cuando el rango es de un día.**
Enseñar "primer día" y "último día" para el mismo día pediría dos decisiones sobre una sola cosa. La condición es de presentación: por debajo se sigue enviando el par de banderas (decisión 1).

**7. El icono de Incapacidad se añade al set de tuip, no se dibuja suelto en la pantalla.**
La propuesta de diseño usó un dibujo propio porque el set no tiene ninguno médico. Meterlo en `iconPaths` mantiene la regla de que ningún SVG se pega suelto en una pantalla; si añadirlo al paquete resulta más caro de lo que parece, la alternativa es usar `status-warning` y anotarlo — pero no dejar el SVG inline.

**8. `FormSection` pierde el margen del `h3`.**
El `h3` arrastra el `margin-bottom` por defecto del navegador; dentro de un `flex items-center` ese margen entra en la caja y sube el texto 6px. Se anula en el componente, con un comentario que diga por qué existe la clase, para que nadie la retire por parecer redundante. Cae en los once formularios que usan `FormSection`; ninguno depende de la desalineación.

**9. Una semilla del mock nace con media jornada.**
Sin un dato así, la tabla y las cards nunca enseñan un decimal en desarrollo y la regresión se descubre tarde. Se marca media jornada en una ausencia existente de las semillas en vez de añadir una fila nueva, para no mover los conteos que ya afirman los tests del mes.

## Risks / Trade-offs

- [Los tests del mock y del mes afirman conteos enteros] → Al marcar media jornada en una semilla, algún total cambia en 0.5. Es deliberado: los tests que lo afirmen se actualizan con el valor nuevo, y así queda cubierto el decimal de punta a punta.
- [`add-provider-billing` consumirá estos días para facturar] → Los días fraccionados son justamente lo que esa fase necesita para no facturar de más; el contrato se amplía sin romper lo que ya lee (`businessDays` sigue estando y sigue siendo un número).
- [Un rango largo con los dos extremos a medias puede quedar en 0] → Sólo si el rango tiene un único día hábil y se marca a medias por los dos lados, que es el caso de "medio día" legítimo (0.5, no 0). El cero real sólo sale de un rango sin días hábiles, y eso lo bloquea la validación.
- [Tres tarjetas ocupan más alto que un desplegable] → El drawer termina hoy con media pantalla vacía; el alto está disponible y así lo comprobó la propuesta.
