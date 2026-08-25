## Context

Ver proposal.md - Why. El catálogo ya resuelve temporizador + cola + accesibilidad con primitivas headless de Radix para otros componentes con comportamiento no trivial (`Select`, `Combobox`, `Switch`, `Tabs`). `@radix-ui/react-toast` es la pieza equivalente para Toast: expone `Provider`, `Viewport`, `Root`, `Title`/`Description`, `Action` y `Close`, con el temporizador de auto-dismiss, el swipe-to-dismiss y el `aria-live` ya resueltos — nada de eso conviene reimplementarlo a mano.

`layer.notification` (`packages/tokens/src/layout.ts`, valor `800`) ya existe en la escala de capas con el comentario "Tooltip y toast", sin que ningún componente lo consuma todavía.

## Goals / Non-Goals

**Goals:**
- Un `ToastProvider` + `useToast()` que cubran exactamente las reglas mecánicas de la definición: posición fija, un toast a la vez, 5s por defecto, 10s con acción.
- Reusar el par de tokens que Avatar ya valida para "superficie siempre invertida respecto del canvas actual" (`bg-neutral-bold` + `text-neutral-inverse`), en vez de inventar un tono fijo que no responda al tema.

**Non-Goals:**
- Múltiples toasts visibles a la vez o apilados. La definición es explícita: "uno a la vez".
- Variantes de severidad como las de Alert (`danger`/`warning`/`success`/`info`). La propia definición limita el propósito de Toast a confirmar acciones del usuario — no a informar estados del sistema, que es el trabajo de Alert — así que no hay una razón de diseño para que Toast necesite las mismas cuatro severidades.
- Posicionamiento configurable (arriba, centro, etc.). La definición fija "abajo a la derecha" sin variantes; agregar una prop de posición sería una superficie de API que la definición no pide.

## Decisions

### API de hook + Provider, no un componente que el consumidor monta a mano

A diferencia de Alert (que el consumidor coloca donde quiere, dentro del flujo), Toast vive fuera del flujo normal de la pantalla y su ciclo de vida (aparecer, esperar, desaparecer, ceder el turno al siguiente) es responsabilidad compartida entre todos los puntos de la app que lo disparan. Eso es exactamente el problema que un Provider + hook resuelve: un único `<ToastProvider>` cerca de la raíz de la app, y cualquier componente hijo llama `const { toast } = useToast()` sin tener que saber dónde vive el elemento visual ni coordinar con otros disparadores.

### Cola de a uno, resuelta en nuestro Provider, no delegada a Radix

`@radix-ui/react-toast` no limita por sí solo cuántos `Toast.Root` pueden estar montados a la vez — eso es una decisión de la app que lo consume. El `ToastProvider` mantiene una cola interna (`useState<ToastItem[]>`) y monta un único `Toast.Root` a la vez con el primer elemento de la cola; al cerrarse (por tiempo o por el usuario), se descarta y se monta el siguiente si hay alguno.

### Duración: 5s por defecto, 10s si hay `action`, ambas overrideable

La regla de la definición ("si lleva «Deshacer», no desaparece hasta que pasen 10 segundos") se implementa como el valor por defecto del parámetro `duration` de `toast(...)`, condicionado a si el llamado incluye `action`. Un consumidor que necesite otra duración puede pasarla explícitamente — la regla fija el valor por defecto, no un piso ni un techo.

### Estilo: reusar el par `bg-neutral-bold` / `text-neutral-inverse` de Avatar

El toast del mockup es oscuro sobre fondo claro (`#17171B` sobre lo que sea que haya detrás), pero el sistema no fija colores por fuera del tema — la superficie debe seguir leyéndose "invertida respecto del canvas" tanto en modo claro como en modo oscuro. `background.neutral.bold` / `text.neutral.inverse` ya es exactamente ese par: en claro, fondo casi negro (`neutral-800`) con texto blanco; en oscuro, fondo casi blanco (`neutral-100`) con texto casi negro — la misma relación de alto contraste en ambas direcciones, y es el mismo par que ya usa `Avatar` (`bg-neutral-bold text-neutral-inverse`) en este catálogo. Se prefiere sobre `background.neutral.inverse`, que en modo claro da el mismo tono oscuro pero no tiene un texto emparejado que seguiría siendo legible en las dos direcciones sin repetir el mismo razonamiento.

### Ícono opcional, sin variante de severidad

El mockup ilustra un ícono de confirmación (`status-success`), pero como Toast no tiene severidades, el ícono es un `ReactNode` opcional en vez de resolverse por una tabla `variant → icon` como en Alert. La documentación sugiere `status-success` como el caso típico, sin imponerlo.

### Posición y capa: viewport fijo abajo a la derecha, `z-notification`

El `Toast.Viewport` de Radix se posiciona con `fixed bottom-* right-*` y `z-notification` (la clase que ya genera `layer.notification`), reusando la capa reservada en vez de declarar una nueva. El ancho mínimo del mockup (320px) coincide exactamente con el paso `w-80` de la escala de anchos por defecto de Tailwind (`20rem`), así que tampoco hace falta un valor arbitrario.

## Risks / Trade-offs

- [No existe en el sistema un token de "texto de marca que se lea bien sobre `neutral-bold` en las dos direcciones de tema" — la acción "Deshacer" usa `text-brand-default`, que sí está pensado para leerse sobre el canvas normal, no sobre una superficie ya invertida] → Mitigación: se deja como tarea explícita verificar el contraste de `text-brand-default` contra `bg-neutral-bold` con el script de `packages/tokens` en ambos temas durante la implementación, siguiendo el mismo procedimiento que ya destapó y resolvió un problema equivalente en el color de Switch; si no alcanza 4.5:1, la alternativa de respaldo es `text-neutral-inverse` con subrayado en vez de color de marca.
- [Un Provider que el consumidor tiene que acordarse de montar, a diferencia del resto del catálogo que son componentes sueltos] → Mitigación: se documenta como el primer paso obligatorio de la guía de uso, con un ejemplo mínimo de integración en la raíz de la app — el mismo tipo de paso que ya exige, por ejemplo, envolver la app en el proveedor de una librería de routing.
