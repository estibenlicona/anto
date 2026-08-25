## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **La altura de la franja la fija la card de distribución**: la grilla (`grid` con `items-stretch` implícito) estira las tres cards a la más alta. Compactar la tercera achica las tres; los ajustes en las dos primeras son de acompañamiento, no la causa.
- **La app no compila Tailwind**: sólo existen las clases presentes en el CSS compilado de `tuip`. Del repertorio verificado en uso: `gap-2`, `gap-1.5` (lo usa Button `small`), `text-label`, `text-body-sm`, `truncate`, `rounded-pill`, `bg-neutral-subtle`, `border-t-default`, `border-neutral-default`. Cualquier medida propia (altos de barra, paddings puntuales, plantilla de grilla) va por estilo inline, como la card ya hace.
- **`CardBody` es `px-4 py-3` + `cn` de concatenación simple** (sin tailwind-merge): pisar su padding con otra clase depende del orden del stylesheet, no del orden en el `className`. No se pelea con eso — `px-4 py-3` (16/12 px) ya es razonable y no es el costo dominante.
- Las pruebas actuales assertan textos (descriptor, %, conteo), clases de acento y anchos inline — nada de eso cambia con la densidad.

## Goals / Non-Goals

**Goals:**

- Bajar el alto de la card de distribución ~35–40% conservando cada dato que hoy muestra.
- Que las tres cards se lean como una franja compacta, sin vacíos dominantes en las dos primeras.

**Non-Goals:**

- No se cambia la grilla del resumen ni el orden de las cards.
- No se quita ni se degrada ningún dato (eje y pie incluidos).
- No se ajusta nada en `tuip` ni en otras pantallas.

## Decisions

- **Etiqueta de fila en una línea: nombre + "·" + descriptor, con truncado y `title`.** El nombre conserva `text-body-sm font-semibold`; el descriptor va en `text-label` neutralizado (mismo truco del correo del listado) y tono sutil, separado por un punto medio. La línea trunca con `truncate` y lleva el texto completo en `title` para que el descriptor recortado se recupere al pasar el puntero. Alternativa considerada: descriptor sólo en tooltip. Se descarta: el usuario eligió conservar la información visible, y "con acompañamiento" es la que da sentido a la lectura del pie.
- **Columna de etiquetas más ancha en la plantilla: `minmax(0, 11rem)`** (antes `7.5rem` para dos líneas). Una línea combinada necesita más ancho para no truncar siempre; `minmax(0, …)` mantiene el truncado posible en pantallas angostas.
- **Medidas de densidad**: barra de `0.875rem` → `0.625rem` de alto; separación entre filas `gap-1.5` (6px, clase existente) en vez de `gap-2`; el `gap` general de la card `gap-3` → `gap-2`; el pie pasa su respiración a `paddingTop: 0.5rem` inline (un `pt-2` suelto no está garantizado en el CSS compilado). Las dos primeras cards bajan su `gap-3` interno a `gap-2`.
- **El interlineado de la fila lo fija la línea única**: sin segunda línea, la fila mide el alto del texto más el de la barra en su columna — no hace falta tocar `leading`.
- **Los cálculos no se tocan**: eje, porcentajes y lecturas del pie quedan idénticos; este change no entra a esa lógica.

## Risks / Trade-offs

- **[El descriptor truncado en pantallas angostas pierde su cola ("con acompañami…")]** → Es el mismo comportamiento de la referencia original del usuario, que ya truncaba; el `title` recupera el texto completo. La lectura del pie repite "acompañamiento" completo, así que el concepto nunca desaparece de la card.
- **[`gap-1.5` podría no estar en el CSS compilado si Button dejara de usarlo]** → Hoy está (Button `small`); la tarea de verificación en pantalla incluye confirmar que ningún espaciado cayó en el vacío, y el fallback es trivial (inline `rowGap`).
- **[Densificar puede apretar el objetivo táctil del `title`/hover del descriptor]** → El descriptor no es interactivo — el `title` es cortesía, no control; no hay objetivo táctil que cuidar.
- **[Las queries de las pruebas podrían asumir la estructura de dos líneas]** → Se revisan: hoy toman la fila por `getByText(label).closest("li")` y el label sigue siendo un span propio dentro de la fila; la aserción de textos usa `textContent` del `li`, que no distingue líneas.

## Migration Plan

Un solo archivo (`PeopleStatsCards.tsx`) más su prueba si alguna query lo pide. Rollback: revertir el archivo — no hay datos, contratos ni dependencias involucrados.
