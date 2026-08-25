## Context

El catálogo no tiene enlace. Lo más parecido es `Button variant="link"` (`button.tsx:63`): `text-brand-default underline underline-offset-2`, sobre un `<button>` — sirve para una acción que se parece a un enlace, no para navegar. Los otros dos `<a>` del paquete son internos y no exportables: el de `Breadcrumb` (`breadcrumb.tsx:69`) y el de `SidebarItem` (`sidebar.tsx:229`). Ver proposal.md — Why.

Restricciones que enmarcan el diseño:

- **El paquete no depende de ningún router**, y no va a empezar acá. `Sidebar` resolvió eso con un `<a href>` real más `onNavigate(id, href)` y un `event.preventDefault()` incondicional (`sidebar.tsx:232-235`).
- **Los tonos se resuelven con mapas literales de clases completas**, no con interpolación: es la restricción de Tailwind que `avatar.tsx`, `progress.tsx` y `card.tsx` ya documentan en su código.
- **Ningún color literal en el fuente**: `verify:colors` falla el build ante un hexadecimal fuera de un comentario.
- **Todo componente nuevo entra por cuatro puertas a la vez**: `src/index.ts`, `registry/definitions.ts`, el sitio de docs (contenido + ejemplos + navegación) y un changeset. La Skill y el `registry.json` se generan solos desde ahí.

## Goals / Non-Goals

**Goals:**

- Que el tono sea una propiedad de la pieza y no una reescritura del consumidor — es lo que hoy no existe y lo que motiva el change.
- Que integrarse con el router del consumidor no cueste perder el estilo, la accesibilidad ni el comportamiento nativo del ancla.

**Non-Goals:**

- **No se toca `Button variant="link"`.** Sigue existiendo con su tratamiento actual. Lo único que se agrega es el criterio documentado de cuándo va cada uno.
- **No se agregan tonos para superficie oscura.** `Breadcrumb` resolvió su caso con una prop `variant: "light" | "dark"` porque vive en una barra que puede ser oscura; `Link` nace para texto sobre lienzo claro. Cuando aparezca el primer enlace sobre fondo oscuro se agrega ahí, con el caso real a la vista.
- **No se agrega `rel="noopener noreferrer"` automático para `target="_blank"`.** Es una buena idea y no es esta: mezcla la parametrización del tono con una política de seguridad de enlaces externos, que merece su propio requisito y su propia decisión.
- **No se migran `Breadcrumb` ni `Sidebar` a usar `Link` internamente.** Ambos tienen tratamientos propios ligados a su contexto (tono invertido, riel de activo, densidad). Reescribirlos sobre `Link` es un refactor con riesgo de regresión visual y sin beneficio para el consumidor.

## Decisions

- **`tone: "brand" | "neutral"`, con `"brand"` por defecto.** El default reproduce exactamente lo que hoy se escribe a mano en los consumidores, así que adoptar la pieza no cambia el aspecto de ningún enlace existente; el tono neutro es lo nuevo. Alternativa considerada: nombrar la prop `variant`, como `Button` y `Breadcrumb`. Se descarta porque en `Button` `variant` significa énfasis de acción (primaria, secundaria, destructiva) y acá no hay énfasis que elegir: hay color de texto. `tone` es además el nombre que `Card` ya usa para exactamente esto.

- **Dos valores y no un color libre.** Alternativa considerada: aceptar cualquier token de texto (`tone="danger"`, `tone="success"`…). Se descarta porque un enlace no comunica estado, y abrir el vocabulario invita a usarlo para eso — el mismo error que la paleta de acento documenta explícitamente en fundamentos. Dos valores cubren los dos casos reales: el enlace que quiere destacarse y el que no.

- **El anillo de foco se deriva del tono** (`ring-brand-focus-ring` con `brand`, `ring-neutral-focus-ring` con `neutral`), en el mismo mapa literal que el color de texto. Dejarlo fijo en marca era lo más barato, pero un anillo rojo alrededor de un enlace deliberadamente neutro reintroduce por la puerta de atrás exactamente el color que el consumidor pidió quitar.

- **El subrayado va en hover y en foco, en los dos tonos, y no en reposo.** En `brand` el color ya distingue al enlace en reposo y el subrayado es refuerzo. En `neutral` no hay nada en reposo: es lo que el consumidor pide al elegir ese tono, y la contrapartida está en Riesgos. Alternativa considerada: subrayado permanente en `neutral`, que es la convención universal de hipervínculo y resuelve el riesgo de accesibilidad de un plumazo. Se descarta por decisión explícita del usuario, que prefiere la tabla sin subrayados repetidos fila a fila. Alternativa considerada y descartada por su cuenta: una tercera prop `underline: "hover" | "always"`. Agrega una dimensión de parametrización que ningún consumidor pidió, y multiplica por dos los estados a documentar y a probar.

- **La integración con el router se resuelve con `asChild`, no con `onNavigate`.** `asChild` cede la etiqueta al hijo vía el `Slot` de Radix: el consumidor escribe `<Link asChild tone="neutral"><RouterLink to={...}>Ana</RouterLink></Link>` y se renderiza un solo `<a>`, con las clases de `Link` y la navegación de su router.
  - Alternativa considerada: replicar el contrato de `Sidebar` (`href` + `onNavigate` + `preventDefault`). Se descarta por dos motivos. El primero es que ese `preventDefault` es incondicional, así que se traga también el ctrl+clic y el clic con el botón central: hoy `Sidebar` no puede abrir una sección en otra pestaña. En una barra de navegación eso se tolera; en el nombre de una persona dentro de una tabla, donde abrir varias fichas en pestañas es el uso natural, es una regresión frente a lo que el consumidor ya tiene hoy con el `Link` de su router. El segundo es que obligaría a cada componente de presentación a conseguirse un `navigate`, cuando hoy le basta con importar ese `Link`.
  - Alternativa considerada: replicar dentro de `Link` la regla de clic no modificado que usa react-router (botón izquierdo, sin ctrl/meta/shift/alt, sin `target`). Se descarta porque es reimplementar el router del consumidor dentro del sistema de diseño, y después mantenerlo al día con sus casos borde.
  - Costo aceptado: `@radix-ui/react-slot` pasa a ser dependencia directa de `@tuya-ui/components`. Ya viaja en el lockfile como transitiva de los diez paquetes de Radix que el catálogo usa — `Slot` es la base de `asChild` en todos ellos —, así que no agrega nada al árbol instalado; lo que agrega es una línea en `package.json` y en `npmDependencies` del registry.

- **Sin `asChild`, `Link` renderiza un `<a>` y acepta sus props nativas** (`href`, `target`, `rel`, `download`…). Es el caso del enlace externo o de la ancla dentro de la misma página, que no necesita router.

- **Estado deshabilitado: no existe.** Un ancla sin `href` no es enfocable ni navegable, que es todo lo que "deshabilitado" significaría acá; agregar una prop para eso sería documentar una tercera forma de hacer lo mismo. Un consumidor que necesita mostrar texto sin destino muestra texto.

## Risks / Trade-offs

- **[Un enlace de tono neutro no tiene ninguna señal en reposo — ni color, ni subrayado, ni peso. Frente a WCAG esto es más débil que el caso clásico de "color solo": ahí al menos hay una diferencia perceptible, acá no hay ninguna. Alguien que recorre la página con la vista no puede saber que ese texto navega hasta ponerle el puntero encima, y en un dispositivo táctil no hay puntero que poner]** → Aceptado explícitamente por el usuario, que eligió esta opción sabiendo que la alternativa era el subrayado permanente. Mitigaciones dentro del alcance: el cursor cambia a mano sobre el enlace, el anillo de foco por teclado se mantiene intacto, y la semántica de ancla hace que un lector de pantalla lo anuncie como enlace y lo liste entre los enlaces de la página — o sea, la vía asistida no pierde nada; la que pierde es la visual. La documentación del componente dice esto en su pestaña de accesibilidad, para que el tono neutro se elija a sabiendas y no por descarte. Si el uso muestra que la gente no encuentra los enlaces, la vuelta atrás es barata: se cambia el mapa de clases de un tono, sin tocar la API.

- **[`asChild` con más de un hijo, o con un hijo que no reenvía `ref` ni props, falla de formas poco obvias]** → Es el comportamiento conocido de `Slot` en todo el ecosistema Radix, y el paquete ya convive con él en `Accordion`, `Menu`, `Popover`, `Navbar` y `Modal`. Se cubre con una prueba del caso correcto (un solo `<a>` renderizado, sin anclas anidadas) y con la nota en la documentación.

- **[El tono neutro y el texto plano quedan indistinguibles también para quien revisa capturas de pantalla, lo que hace difícil detectar por revisión visual que un enlace se rompió]** → Las pruebas del componente asertan sobre el rol de ancla y sobre las clases del tono, no sobre la apariencia, así que una regresión de estilo se ve en la suite antes que en una captura.

- **[Aparece una segunda pieza que se parece a un enlace, y el criterio para elegir entre `Link` y `Button variant="link"` queda librado a que alguien lea la documentación]** → Por eso el criterio entra como requisito con su propio escenario, y no sólo como prosa de la página. La duplicación aparente ya existía — `Button variant="link"` está desde el principio —; lo que cambia es que ahora hay una pieza correcta a la que mandar a quien lo estaba usando para navegar.

## Migration Plan

Puramente aditivo: no hay nada que migrar. `Link` se publica en un `MINOR`, y ningún consumidor cambia de aspecto al tomarlo. El consumidor que espera la pieza — el listado de Personas de la aplicación de gestión de capacidad — la toma en su propio change, después de que `pnpm run publish:local` regenere el `.tgz`. Volver atrás es despublicar la versión: nada depende de `Link` hasta que ese change se aplique.
