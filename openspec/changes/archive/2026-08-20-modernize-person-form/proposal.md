## Why

El formulario de crear/editar persona (`PersonFormDrawer`) es hoy una lista plana de 13 campos apilados verticalmente, sin agrupación visual ni jerarquía. El usuario proveyó una imagen de referencia con un lenguaje visual más moderno (secciones agrupadas, campos en grilla, controles segmentados, adornos de unidad/moneda) y pidió modernizar el diseño evaluando qué tanto de eso ya cubre el design system (tuip) y qué habría que agregarle.

## What Changes

- Reorganizar los 13 campos del formulario en 3 secciones agrupadas visualmente: Identidad (nombre, documento, usuario principal), Perfil (cargo, rol, seniority, modalidad) y Capacidad y costo (FTE, costo mensual, fecha de inicio, externo/proveedor).
- Demarcar cada sección con un filete de ancho completo entre zonas (superficie plana, sin panel relleno) y un encabezado fuerte: ícono en pastilla tintada (`bg-brand-subtle` + `text-brand-default`) junto a un título en caja normal (`text-body font-semibold`), no un eyebrow diminuto en mayúscula. Los nombres de las zonas siguen la referencia: "Información personal", "Información laboral" y "Asignación y disponibilidad".
- Distribuir los campos de cada sección en una grilla de 2 columnas (1 en mobile) en vez de una columna única, para reducir el alto total del formulario.
- Mantener Seniority y Modalidad como `Select`, siguiendo la segunda imagen de referencia. Nota: tuip documenta en `Select` que "Between 7 and 20 options is what this component is for — fewer, use a radio group", y estos campos tienen 4 y 3 opciones, así que esto es una desviación consciente de la guía del design system, elegida explícitamente por el usuario sobre la alternativa de control segmentado.
- **Agregar una variante `separated` a `SegmentedControl` de tuip**: cada opción como su propio botón redondeado con separación visible entre segmentos, todas dentro del mismo `<fieldset>`. Queda en el catálogo pero **sin consumidor en la app** tras volver Seniority/Modalidad a `Select` (cambio aditivo y con default `joined`, así que no afecta a nadie).
- Quitar el número del label de las opciones de Seniority ("Principiante" en vez de "1 · Principiante"): el número no aporta información que el usuario necesite para elegir.
- **Extender `Input` y `Select` de tuip con `hint` y `required`**: texto de ayuda bajo el campo (desplazado por el error cuando lo hay) y asterisco de obligatorio junto al rótulo, ambos con su cableado de `aria-describedby`/`aria-required`. La lógica compartida vive en un módulo interno `field.tsx` para que los dos controles no puedan divergir en cómo marcan lo mismo.
- Rediseñar los adornos de `Input` como celda propia del control (fondo escalonado + filete que la separa del valor), en vez de texto gris suelto dentro del campo.
- Sumar al formulario los elementos de la referencia que hoy faltan: subtítulo en el encabezado del Drawer, `placeholder`s de ejemplo ("Ej. Juan Pérez Gómez"), textos de ayuda en UPN y FTE, y botón primario con ícono y etiqueta según el modo ("Crear persona" / "Guardar cambios").
- **Extender el componente `Input` de tuip** con soporte de adornos `prefix`/`suffix` (slots opcionales antes/después del campo), y usarlo para mostrar la unidad en "FTE disponible" (sufijo "FTE") y la moneda en "Costo mensual" (prefijo "COP"). El campo de usuario principal (UPN) se queda como texto libre de una sola pieza — sin sufijo de dominio fijo tipo "@tuya.com.co" — porque ese dominio es solo un ejemplo de la imagen y no hay evidencia en specs ni en el backend de que sea un valor fijo correcto para todos los casos.
- Envolver el switch "Personal externo" en un contenedor tipo tarjeta (`bg-neutral-subtle` + borde) con texto de ayuda debajo del label — composición local con tokens existentes, sin nuevo componente en tuip.
- Agregar en el footer del Drawer un texto de ayuda con la cantidad de campos obligatorios sin completar, junto a los botones Cancelar/Guardar.
- Mantener el contenedor `Drawer` (no `Modal`, a diferencia de la imagen de referencia): ya se eligió deliberadamente sobre `Modal` por el alto del formulario, y la reorganización en secciones/grilla no lo achica lo suficiente como para revertir esa decisión.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `people`: el requisito "Crear persona" (y por extensión "Editar persona", que reutiliza sus reglas de validación) suma un nuevo escenario: el formulario muestra la cantidad de campos obligatorios sin completar cuando el usuario intenta confirmar sin llenarlos todos.
- `people`: el requisito "Selección de seniority y modalidad desde catálogo" cambia el formato del label de seniority — nombre del nivel sin el número (antes mandaba mostrarlo con número, ej. "1 Principiante").

## Impact

- `frontend/src/features/people/components/PersonFormDrawer.tsx`: reestructuración de layout (secciones, grilla) y de los campos de Seniority/Modalidad (Select → SegmentedControl variante `separated`, label sin número en Seniority).
- `frontend/src/features/people/components/personFormValidation.ts`: exponer el conteo de campos obligatorios faltantes para el texto del footer.
- `tuip/packages/components/src/input.tsx`: nuevas props opcionales `prefix`/`suffix`/`hint`/`required` en `Input`, y adornos rediseñados como celda. Cambio aditivo y retrocompatible — ningún consumidor existente de `Input` pasa esas props hoy, así que no cambia su render actual.
- `tuip/packages/components/src/select.tsx`: nuevas props opcionales `hint`/`required`, mismas semánticas que en `Input`.
- `tuip/packages/components/src/field.tsx` (nuevo, interno): `FieldLabel`, `FieldHint` y `useFieldDescription` — el asterisco de obligatorio, la precedencia error-sobre-ayuda y el cableado de `aria-describedby`, en un solo lugar para `Input` y `Select`. No se exporta desde el índice del paquete.
- `tuip/packages/components/src/segmented-control.tsx`: nueva prop `variant?: "joined" | "separated"` (default `"joined"`, el look actual). Cambio aditivo; hoy queda sin consumidor en la app.
- Sin cambios de API/backend: los datos capturados y enviados no cambian (mismos campos, mismos límites de validación); solo cambia cómo se presentan.
