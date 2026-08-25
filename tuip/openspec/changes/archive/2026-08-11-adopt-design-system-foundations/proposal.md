## Why

El repositorio implementa un sistema de diseño que no es el de Tuya. El color de marca publicado hoy es `#0B5FFF` —el azul de Atlassian—, los neutros son los de Atlassian, la tipografía es Inter, y los semánticos de danger, warning y success no coinciden con ninguno de los valores definidos por la marca. El spec de `docs-site` afirma que "los colores y tipografía visibles corresponden a los design tokens de marca de Tuya CA": ese requisito no se cumple, y no puede cumplirse mientras los tokens sean los de otro sistema.

La carpeta `design-system/` contiene ahora la definición autoritativa —fundamentos, componentes, iconografía y la decisión tipográfica— y es la fuente de verdad del sistema. Este change cierra la Fase 1 que esa misma definición establece: fundamentos publicados, tipografía servida y librería de iconos, **sin componentes nuevos todavía**. Todo lo demás depende de esta base, y construir componentes sobre tokens equivocados multiplica el costo de corregirlos después.

## What Changes

**Color**

- **BREAKING** La familia primitiva `brand` pasa del azul de Atlassian a la escala de Tuya Red, con `500 = #ED1C29` como acción principal y navegación activa, y `600 = #C9151F` para hover y para texto rojo sobre blanco.
- **BREAKING** Los neutros pasan a la escala de grises fríos de la definición, con un paso `25` nuevo, de modo que el rojo cálido de marca resalte por contraste de temperatura.
- **BREAKING** Los semánticos toman sus valores de la definición: danger `#8E0F18`, warning `#B57A00`, success `#116B4B`, discovery `#5B3FC4`.
- Se añade el rol `info` (`#1B5FBF`), que hoy no existe, para progreso, ayuda contextual y enlaces de sistema.
- Se incorpora la regla de escasez del color de marca —una acción primaria por vista— y la separación entre el rojo de marca y el rojo de error, que nunca comunica solo por matiz.
- Los valores de modo oscuro pasan a los de la definición: las superficies se aclaran con la elevación en vez de con sombras, y el rojo de marca sube a `400`.

**Nomenclatura**

- **BREAKING** Los tokens se renombran al esquema `--color-[propiedad]-[rol]-[énfasis]-[estado]` que define el documento. `--tuya-color-background-brand-bold` pasa a `--color-bg-brand-bold`.

**Tipografía**

- **BREAKING** La familia de interfaz pasa de Inter a IBM Plex Sans, y la monoespaciada de JetBrains Mono a IBM Plex Mono, servidas por el propio sistema en vez de asumirse presentes.
- **BREAKING** La escala pasa a los siete estilos de la definición (`display`, `heading.lg`, `heading.md`, `body`, `body.sm`, `label`, `numeric`) en reemplazo de la escala de encabezados `heading.xxsmall`–`heading.xxlarge`, con tres pesos en uso.
- Las cifras de negocio adoptan `tabular-nums`, y la monoespaciada queda reservada a cadenas literales.

**Espacio, layout y forma**

- La escala de espaciado se reexpresa como `100`–`900` (4px a 96px) y gana **nueve alias semánticos** (`space.hug`, `.inline`, `.stack`, `.group`, `.inset`, `.block`, `.section`, `.page-top`, `.page-bottom`) que son lo que se usa al maquetar.
- **BREAKING** Los radios pasan a `3px` para controles y `6px` para superficies, con pill reservado a chips y avatares.
- Se añaden grupos de token que hoy no existen: alturas de control (32 / 40 / 48), anchos máximos por tipo de contenido (página, formulario, prosa, panel), capas de z-index con seis valores nombrados, y puntos de quiebre.
- Los tokens de motion se alinean a 100 / 200 / 300 ms con la curva de la definición.

**Iconografía**

- Se introduce la librería de 72 iconos en seis familias, sobre retícula de 24×24 con trazo de 1.5px, y el componente `Icon` que los renderiza heredando `currentColor`.
- Los iconos se distribuyen por el CLI como el resto del código fuente.

**Sitio de documentación**

- Las páginas de fundamentos pasan a documentar el sistema real: los alias de espaciado con la relación que expresa cada uno, la anatomía de página y sus puntos de quiebre, las alturas de control, los anchos máximos y las capas.
- Se añade una página de iconografía con la librería navegable y las reglas de dibujo.

**Fuera de alcance**

- Los catorce componentes que la definición documenta y el repositorio no tiene (Select, Checkbox, Radio, Switch, Date field, Alert, Toast, Modal, Drawer, Tabs, Tooltip, Menu, Data table, Empty, Skeleton, Avatar, Progress, Pagination, Breadcrumb). Son las Fases 2 y 3 del roadmap y necesitan esta base publicada antes de existir.
- El modelo de distribución. El CLI que copia código fuente se conserva como la forma de distribuir los componentes; la recomendación de paquetes npm del documento queda cerrada en ese sentido.

## Capabilities

### New Capabilities

- `iconography`: la librería de iconos del sistema —su retícula, sus reglas de trazo, su vocabulario de nombres, sus tamaños, su comportamiento de color y accesibilidad, y el método para incorporar uno nuevo.

### Modified Capabilities

- `design-tokens`: cambia la paleta primitiva (marca, neutros y semánticos), se añade el rol `info`, cambia el esquema de nomenclatura de los tokens, la escala tipográfica pasa a los siete estilos de la definición con familias nuevas, el espaciado gana alias semánticos, y se incorporan tokens de altura de control, anchos máximos de contenido, capas de z-index y puntos de quiebre.
- `docs-site`: las páginas de fundamentos pasan a documentar los alias de espaciado, la anatomía de página, los puntos de quiebre, las alturas de control y las capas; y se añade la página de iconografía.

## Impact

- `packages/tokens`: reescritura de `primitives.ts`, `semantic-colors.ts`, `typography.ts`, `tokens.ts` y del preset de Tailwind; archivos nuevos para espaciado con alias, layout (anchos, alturas, capas, breakpoints) y familias tipográficas.
- `packages/components`: los cuatro componentes existentes se retokenizan al esquema nuevo. Su comportamiento no cambia, así que `component-library` no cambia de requisitos.
- `packages/cli`: el CSS de tokens que escribe `init` cambia de nombres y de valores; hay que decidir qué pasa con los proyectos ya inicializados.
- `apps/docs`: páginas de fundamentos reescritas, página de iconografía nueva, y adopción de las familias tipográficas nuevas.
- **Consumidores existentes**: cualquier proyecto que haya corrido `tuya-ui init` tiene el CSS viejo con los nombres viejos. El renombre los rompe al actualizar.
- **Dependencias**: se incorporan IBM Plex Sans e IBM Plex Mono como fuentes servidas por el sistema.
