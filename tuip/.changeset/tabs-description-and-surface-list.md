---
"@tuya-ui/components": minor
"@tuya-ui/tokens": patch
---

Pestañas que dicen qué guardan, y el vocabulario de maquetación que la hoja prometía y no publicaba:

- **`TabsTrigger` gana `description`**: una segunda línea bajo la etiqueta que resume lo que la sección contiene —"6 historias · 30 SP", "3 de 6 fuera de tolerancia"—, para que el lector elija una pestaña sin abrirla. Es lo que impide que las pestañas escondan su contenido: una fila de etiquetas peladas no dice cuál vale el clic. Con descripción el disparador apila sus dos líneas y toma su propio relleno horizontal (12px arriba, 10px abajo, 12px a los lados); la descripción va en `label` regular sin tracking, para que no se ponga en negrita con la etiqueta activa, y forma parte del nombre accesible de la pestaña, como `count`. Sin `description` nada cambia.

- **`TabsList` gana `variant`**: `line` (por defecto, la fila de siempre) y `surface`, la lista que **encabeza una card**: se apoya en el escalón casi blanco (`bg-neutral-subtlest`), toma el relleno interior de la card para que la primera etiqueta alinee con el contenido de abajo, y aprieta los disparadores (`gap-1`), porque con descripción cada uno ya trae su relleno y el hueco de `line` se leía como agujeros. Es una prop y no una clase porque `cn` concatena y no fusiona: un `gap-1` de afuera no le gana al `gap-7` propio.

- **La hoja publicada incluye los anchos máximos y los alias de espaciado.** `max-w-prose` / `max-w-form` / `max-w-panel` / `max-w-page` y `gap-group`, `p-inset`, `pb-page-bottom` y el resto de los alias (`hug` → `page-bottom`, sobre `gap`, `p`, `m` y sus ejes) son el vocabulario con el que DESIGN.md dice que se maqueta una pantalla, y las pantallas viven en las apps: ningún componente del catálogo topa una prosa ni cierra un scroll, así que la hoja emitía las variables y ni una clase que las leyera. Una app que escribía `max-w-prose` no obtenía nada y no fallaba nada.

- **`SearchField` toma su `className` en la raíz, no en el input.** Un buscador en una toolbar se dimensiona como un solo control (`w-96`, `max-w-sm`) y el input llena la caja que la raíz recibe. Puesto en el input, el ancho peleaba con su propio `w-full` y la raíz seguía encogiéndose a los ~20 caracteres intrínsecos del input, así que el placeholder se cortaba escribiera lo que escribiera el consumidor, sin que nada fallara. Quien pasaba una clase de ancho obtiene ahora lo que pedía; quien estilizara el input mismo por `className` (ningún consumidor conocido lo hacía) tiene que moverlo a la raíz o a las props nativas del input.

- **Los alias de espaciado de dos palabras salen en kebab** (`pt-page-top`, `pb-page-bottom`), como los documenta DESIGN.md y como va el resto del vocabulario. El preset los pasaba en camelCase (`pb-pageBottom`), una utilidad que ninguna guía nombraba y que por eso nadie escribía; no hay quien migrar.
