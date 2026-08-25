## Context

Ver proposal.md - Why. La sección fuente (`design-system/Componentes Compuestos Tuya.dc.html:410-463`) es un mockup completo de un flujo real ("Solicitud de ampliación"): la fila de pasos, un formulario de dos campos más un área de texto larga, y un pie con estado de borrador y acciones. Solo la fila de pasos es el componente nuevo — el resto de la tarjeta es la propia demostración del mockup de cómo se usa `Stepper` dentro de un flujo, la misma relación que ya tienen "Confirm modal destructivo" y "Detail drawer" en ese archivo con `Modal` y `Drawer`, ya construidos.

Valores exactos leídos de la fuente, y su mapeo:

| Elemento | Valor en el mockup | Token que lo resuelve |
|---|---|---|
| Círculo, diámetro | `28px` | `h-7 w-7` — coincide exacto con un paso de la escala de espaciado por defecto de Tailwind (`7 × 4px`), sin valor arbitrario |
| Círculo completado, fondo | `#1E6B3A` | `bg-success-bold` (`p.success[600]` = `#116B4B`) — mismo verde de familia, no idéntico píxel a píxel; ver Decisions |
| Círculo en curso, fondo | `#ED1C29` | `bg-brand-bold` — coincide exacto con `p.brand[500]`, el mismo tono que ya usa el botón primario |
| Círculo pendiente, borde | `#C9C9CE` | `border-neutral-default` (`p.neutral[300]`) — coincide exacto |
| Número/ícono en círculo en curso | blanco | `text-brand-on-bold` — el mismo par que ya prueban `Button` primario y `DateCalendar` para el día seleccionado |
| Línea de conexión | `background:#E3E3E6` | `bg-neutral-default` — el mismo token que ya usa la línea vertical de `ActivityTimeline` |
| Paso pendiente, atenuación | `opacity:.55` sobre el grupo ícono+etiqueta | sin token equivalente; ver Decisions |
| Ícono de completado | checkmark, trazo 2 | `check`, ya publicado en la librería — el `d` del mockup difiere en formato de comandos SVG del `d` ya extraído, pero dibuja el mismo trazo |

## Goals / Non-Goals

**Goals:**
- Un `StepperStep` cuyo estado sea siempre explícito, para que la fila de pasos siga la misma filosofía compositiva del resto del catálogo: ni `Table` reordena filas, ni `Menu` reordena su ítem destructivo, ni `ActivityTimeline` ordena sus entradas — todos reciben la verdad ya resuelta desde afuera.

**Non-Goals:**
- Un `Stepper` que reciba un índice (`currentIndex`) y calcule el estado de cada `StepperStep` hijo por posición. Sería el primer componente compuesto del catálogo que inspecciona y reinterpreta a sus `children` en vez de renderizarlos tal cual — un patrón nuevo que ningún otro componente necesitó, para un ahorro que el propio consumidor ya resuelve con una expresión de una línea (`index < current ? "completed" : index === current ? "current" : "pending"`).
- Un componente `Textarea` y un `Input` con sufijo de unidad. El mockup los usa para "Justificación" y "Capacidad adicional", pero ninguno de los dos existe todavía en el catálogo y ninguno es el componente que este change vino a agregar — el ejemplo en vivo se construye con lo que ya existe (`Input`, `DateField`, `Button`) en vez de forzar dos componentes nuevos sin pedido explícito.
- Prevenir en código que dos `StepperStep` tengan `status="current"` a la vez, o que un `completed` aparezca después de un `pending`. La definición lo espera como uso correcto, no como una invariante que el componente deba validar — mismo criterio ya aceptado para el orden del ítem destructivo de `Menu`.
- Reproducir la tarjeta completa del mockup (borde, fondo, pie con "Borrador guardado") como parte de `Stepper`. Ese marco es del flujo que lo contiene, no del componente — la misma razón por la que `ActivityTimeline` no trae su propia superficie.

## Decisions

### `status` explícito por paso, sin cómputo por posición

Ver Non-Goals. `StepperStep` recibe `status: "completed" | "current" | "pending"` directamente. `Stepper` en sí es solo el contenedor de layout (`<ol className="flex items-center">`) — no lee ni reinterpreta sus `children`.

### Círculo completado: verde de familia, no de píxel

`#1E6B3A` del mockup no coincide exacto con ningún paso de la escala `success` de los primitivos (el más cercano, `p.success[600] = #116B4B`, comparte el canal verde exacto y difiere apenas en rojo y azul). Es la misma situación que ya resolvió `ActivityTimeline` para sus puntos de estado: en vez de declarar un verde nuevo solo para esta sección, se reusa `bg-success-bold` — el mismo verde que ya usan los badges y alerts de éxito — porque la coincidencia de rol (paso completado = éxito) es más fuerte que la coincidencia de píxel, y declarar un tono nuevo rompería la regla de que el catálogo tiene un solo verde de estado.

### Círculo en curso: exacto el mismo tratamiento que el botón primario

`#ED1C29` con texto blanco es, sin aproximación, `bg-brand-bold text-brand-on-bold` — el mismo par que ya prueban `Button` variante primaria y el día seleccionado de `DateCalendar`. No hace falta ninguna decisión nueva acá, solo reconocer el patrón ya validado.

### Atenuación del paso pendiente: `opacity-[.55]`, valor arbitrario documentado

El mockup atenúa el grupo ícono+etiqueta completo del paso pendiente con `opacity:.55`, no con colores más claros por separado — es una técnica válida y distinta de los pasos "disabled" que ya tiene el sistema en otros componentes (que sí recolorean cada parte). Ningún token de opacidad existe para esto y `.55` no es un paso de la escala por defecto de Tailwind (que salta de `.50` a `.60`). Se usa como valor arbitrario, con el mismo criterio ya aplicado al ancho de `Tooltip` (240px) y de `Menu` (220px): el propio mockup fija ese número como parte deliberada del diseño, no como una medida aproximable al paso más cercano de la escala.

### Línea de conexión: mismo mecanismo que ya resolvió `ActivityTimeline`, en horizontal

Cada `StepperStep` (salvo el último) dibuja un segmento (`flex-1 bg-neutral-default`) hacia el siguiente paso, suprimido en el último vía `group-last:hidden` — el `<li>` lleva `group`, exactamente la misma técnica CSS que ya resolvió la línea vertical de `ActivityTimeline`, ahora horizontal. El color de la línea no cambia según el estado de los pasos que conecta — el propio mockup usa el mismo `#E3E3E6` entre cualquier combinación de estados, así que no hay lógica condicional que agregar.

### Categoría de registro: `layout`

Junto a `Tabs` y `Breadcrumb` — los dos componentes de navegación secundaria que ya existen en esa categoría. `Stepper` es la misma familia: orienta a la persona dentro de una secuencia, no informa un estado del sistema (`feedback`) ni flota sobre el contenido (`overlays`).

### Ícono `check` reusado sin cambios

El `d` del checkmark en el mockup (`M5 12.5l4.5 4.5L19 7`, con comandos relativos) y el `d` ya publicado en `paths.ts` (`M5 12.5 10 17.5 19.5 7`, con coordenadas absolutas) dibujan el mismo trazo — la diferencia es solo de formato de exportación del SVG, no de forma. No hace falta agregar ni regenerar ningún ícono.

## Risks / Trade-offs

- **`status` explícito no impide una combinación inválida (dos pasos "current", un "completed" después de un "pending")** → Mitigación: es la misma clase de confianza que ya se le da al orden de `MenuItem`; el costo de una lista mal armada es visible de inmediato en pantalla, no un fallo silencioso.
- **El verde del círculo completado no es el hex exacto del mockup** → Mitigación: la diferencia es de tono dentro de la misma familia de verde (canal verde idéntico), y reusar `bg-success-bold` evita declarar un segundo verde de estado en el sistema — la razón semántica pesa más que la coincidencia de píxel, mismo criterio ya aplicado en cada change de esta serie que partió de una fuente visual.
- **El ejemplo en vivo no reproduce el formulario completo del mockup** (sin `Textarea`, sin sufijo de unidad en `Input`) → Mitigación: es deliberado, no un recorte accidental — ver Non-Goals. Si más adelante se agregan `Textarea` o un `Input` con adornos, ese es el momento de acercar el ejemplo al mockup, no antes.
