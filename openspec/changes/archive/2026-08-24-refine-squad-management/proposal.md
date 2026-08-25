## Why

Cuatro cosas de Gestionar Células, tres pedidas y una que apareció al buscar la causa de la tercera.

- **La descripción es un campo de una línea para 500 caracteres.** El formulario lo dice —"Opcional, máximo 500 caracteres"— y ofrece un renglón para escribirlos.
- **BAU y Transformación usan el vocabulario equivocado.** Se colorean con tonos de acento (`sky` y `violet`), que son los mismos que la escala de seniority, y se confunden con ella. No es casualidad: el acento distingue **pasos de una escala ordinal**, y BAU y Transformación no son pasos de nada — son dos categorías. El vocabulario categórico del sistema existe para eso.
- **El filtro se cierra al marcar una opción**, así que hay que reabrirlo por cada criterio. La causa no es el filtro: `SquadsList` devuelve un texto de carga y **desmonta la barra de controles entera** mientras recarga. No se cierra el popover — desaparece con su botón, junto con la búsqueda.
- **La confirmación de borrado habla en voseo**: "¿Seguro que querés eliminar…?". Y no está sola: el texto de la interfaz usa voseo en 56 lugares repartidos por toda la app —marcadores de posición, mensajes de validación, estados vacíos—, tres de ellos en diálogos de borrado que comparten patrón y se leen a un clic de distancia.

## What Changes

- **La descripción pasa a un campo multilínea**, con alto suficiente para lo que el propio formulario dice que acepta.
- **BAU y Transformación pasan al vocabulario categórico**, en el listado y en las tarjetas de resumen, dejando de tomar prestados los tonos de la escala de seniority.
- **La barra de controles deja de desmontarse al recargar.** El estado de carga pasa a ocupar sólo la tabla. Con eso el filtro conserva su popover abierto entre selecciones —que es lo que se pedía— y de paso la búsqueda deja de perder el foco mientras escribe.
- **El registro del lenguaje pasa a ser neutro en toda la app**, no sólo en esta pantalla: 56 ocurrencias en 27 archivos. Hacerlo por pantallas dejaría dos diálogos de borrado idénticos redactados distinto.
- **Los badges de criticidad pierden el punto**, que no aporta nada en una clasificación fija y compite con el texto que ya la dice.

### Fuera de alcance

- Renombrar los roles del catálogo ("Backend Dev" → "Backend Developer"): se muestra en media docena de pantallas y es una decisión sobre el catálogo, no sobre esta.
- Animaciones y transiciones: es un change propio, sobre el catálogo entero.
- Qué colores categóricos exactamente: el par elegido se propone acá pero se confirma mirando la pantalla junto a la escala de seniority, que es lo que motivó el cambio.

## Capabilities

### New Capabilities

- `ui-writing`: el registro del lenguaje de la interfaz. Es transversal —ninguna pantalla es dueña de cómo habla el producto— y sin un lugar donde esté escrito, la regla se pierde en la primera cadena que alguien agregue.

### Modified Capabilities

- `squads`: el color de BAU y Transformación deja de salir del vocabulario de acento; la descripción pasa a un campo multilínea; los controles de búsqueda y filtro dejan de desaparecer mientras el listado recarga; la criticidad se muestra sin el punto de estado.

## Impact

- Frontend: `src/features/squads` — `SquadFormDrawer`, `SquadsList`, `SquadTeamStatsCards`; y el texto de la interfaz en 27 archivos repartidos por casi todas las features.
- **tuip**: depende de `adjust-badge-and-capacity-bar` —el badge sin punto y las partes de `CapacityBar` con color categórico—, que debe estar publicado y reinstalado antes de aplicar éste.
- **Orden**: `squads` ya existe en `openspec/specs`, así que no hay dependencias de archivado. `ui-writing` es nueva.
