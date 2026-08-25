## Context

Ver proposal.md - Why. Sin una sección de mockup que traducir, este diseño se arma enteramente a partir de piezas ya validadas en el catálogo — cada decisión de abajo nombra la pieza exacta que reusa, no un valor nuevo:

| Necesidad | Pieza reusada |
|---|---|
| Ilustración de la zona vacía | ícono `import` (flecha hacia una bandeja) |
| Archivo elegido, ícono líder | ícono `attach-doc` |
| Quitar un archivo | ícono `close` — la misma acción que ya usan el chip de Combobox y el cierre de Modal/Drawer |
| Estado de éxito en FileUploader | ícono `check` — el mismo que ya usa Stepper para un paso completado |
| Estado de error en FileUploader | ícono `status-error` |
| Barra de progreso por archivo | el componente `Progress` ya publicado, sin reimplementar |
| `label`/`error` del campo | la misma forma que ya expone `Input` |
| Anillo de foco | `focus-visible:ring-focus ring-border-brand-focus`, la misma clase que ya usa `Input` |
| Radio de la zona | `rounded-control` — la misma que usan los campos, no `rounded-surface` (reservado para tarjetas y menús) |
| Fondo al arrastrar por encima | `bg-brand-subtle` — la misma superficie tenue que ya expone la escala de marca |

## Goals / Non-Goals

**Goals:**
- Que arrastrar sea una comodidad sobre un control ya operable por teclado, no un camino aparte con su propia accesibilidad — ver el requisito compartido "Selección de archivo por arrastre o por teclado".
- Que el estado de cada archivo en `FileUploader` (progreso, éxito, error) sea un solo valor por archivo que decide a la vez el ícono, el color y si se muestra una barra — mismo principio que ya fijaron `unread` en `NotificationMenuItem` y `status` en `StepperStep`: una señal, nunca dos que puedan desincronizarse.

**Non-Goals:**
- Simular una subida con un temporizador interno. Ningún componente de este catálogo fabrica el resultado de una acción que no le pertenece — `Alert` no decide cuándo desaparecer solo, `Toast` no sabe qué hace su `action`, y `FileUploader` tampoco va a inventar un progreso que no viene de una subida real.
- Validar tipo o tamaño de archivo con una UI de error propia. Fue la opción explícitamente descartada al definir el alcance de este change. `accept` se expone como paso directo al atributo nativo del input — sin costo, porque no exige ninguna UI nueva — pero no hay mensaje de "archivo demasiado grande" ni "tipo no permitido" en esta versión.
- Un modo no controlado con `defaultValue`. Ver Decisions — es una limitación real de la File API, no una preferencia de diseño.
- Miniaturas de imagen. La opción elegida al definir el alcance fue la de una vs. varias filas, no la de con/sin previsualización — se puede agregar después sin romper la API actual.

## Decisions

### El arrastre es una capa sobre un `<input type="file">` real, no un reemplazo

La zona de arrastre envuelve un `<input type="file">` nativo, visualmente oculto pero enfocable (nunca `display:none`, que lo sacaría del árbol de accesibilidad y del orden de tabulación) dentro de un `<label>` que ocupa toda la zona visible. Clickear la zona, o llegar a ella por Tab y presionar Enter o Espacio, abre el selector nativo — comportamiento que el navegador ya resuelve solo para un `<input type="file">` real, sin una sola línea de manejo de teclado propio. El arrastre (`onDragEnter`/`onDragOver`/`onDrop`) es una capa encima que alimenta al mismo estado que alimentaría elegir un archivo por el selector — nunca un camino separado con su propio resultado, que es exactamente lo que fija el requisito compartido.

El anillo de foco de la zona se resuelve con `peer-focus-visible:ring-focus` sobre el `label`, con el input real marcado `peer` — el foco vive en el input nativo (donde el navegador ya lo maneja correctamente), y el estilo visual se refleja en el contenedor sin duplicar el estado en React.

### API controlada, sin `defaultValue`

A diferencia de `DateField` o `Combobox`, que admiten un modo no controlado, un `File` no se puede asignar por script al `.files` de un input por razones de seguridad del navegador — no hay forma de que un `defaultValue: File` tenga sentido, porque no hay manera de precargarlo. `FileInput` y `FileUploader` son controlados desde el vamos: el consumidor mantiene el archivo (o la lista) en su propio estado y se lo pasa de vuelta.

### `FileUploaderItem.status` deriva ícono, color y progreso a la vez

Mismo principio ya usado en `NotificationMenuItem.unread` y en `StepperStep.status`: un objeto por archivo con un campo `status: "uploading" | "success" | "error"` en vez de flags sueltos (`isUploading`, `hasError`, `isDone`) que podrían contradecirse entre sí. `uploading` muestra la barra de `Progress` con el valor de `progress`; `success` muestra el ícono `check` en el rol `success`; `error` muestra `status-error` en el rol `danger` junto al `errorMessage` de esa fila, sin afectar a las demás.

### Reusar `Progress` tal cual, no reimplementar una barra

`Progress` ya resuelve el valor, el `role="progressbar"` y la saturación por encima de 100 — `FileUploader` lo declara como dependencia de registro (`dependencies: ["utils", "icon", "progress"]`) en vez de copiar su lógica.

### `FileInput` conserva solo el primer archivo si sueltan varios

Es más indulgente que rechazar el arrastre entero con un error — quien suelta tres archivos sobre un campo de uno probablemente no leyó que era de uno solo, y quedarse con el primero (el comportamiento más común de esta clase de campo en el resto de la web) no le exige reintentar el arrastre.

### Cambios en la lista de `FileUploader`, anunciados con una región viva

Un archivo que pasa de `uploading` a `success` o `error` es un cambio de contenido que nadie disparó con una tecla en ese instante — sin una región `aria-live="polite"` alrededor de la lista, un lector de pantalla no tiene forma de anunciarlo. Se usa `polite` y no `assertive`: el cambio de estado de una subida no amerita interrumpir lo que la persona esté haciendo, a diferencia de un error crítico.

## Risks / Trade-offs

- **No hay mockup contra el cual verificar el resultado** → Mitigación: cada pieza visual reusa un ícono, un color o un componente ya validado en otro change de este catálogo (tabla de Context); lo único genuinamente nuevo es la composición, no los valores.
- **API controlada sin modo no controlado rompe la simetría con `DateField`/`Combobox`** → Mitigación: es una limitación real de la plataforma (la File API no permite precargar un `File` por script), documentada como tal para que quien lo use no la confunda con una inconsistencia de diseño.
- **Sin validación de tipo/tamaño, un consumidor podría aceptar cualquier archivo sin darse cuenta** → Mitigación: fue la opción de alcance elegida explícitamente; `accept` sigue disponible como paso nativo para al menos filtrar qué aparece en el selector del sistema, aunque no bloquee un archivo soltado por arrastre que no cumpla el filtro.
