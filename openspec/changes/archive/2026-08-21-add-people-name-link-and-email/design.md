## Context

La celda de la primera columna de `PeopleList.tsx` es hoy un `flex` horizontal con `Avatar` y el nombre como texto plano. El dato del correo (`userPrincipalName`) ya viaja en el DTO y ya está en el modelo `Person`: no hay nada que pedirle al backend ni al mock. Ver proposal.md - Why.

La ruta destino `/app/lead/personas/:id` no existe. El router tiene `/app/lead` con hijos `index`, `celulas`, `personas` y `capacidades`; ninguno anida un `:id`, así que una URL con id cae en el `{ path: "*", element: <NotFoundPage /> }` de nivel superior — que se renderiza fuera del `ChapterLeadLayout`, o sea sin sidebar ni breadcrumb.

## Goals / Non-Goals

**Goals:**
- Mostrar el correo sin que compita con el nombre por la atención.
- Fijar ahora la forma de la URL de detalle, para que el change que construya esa pantalla no tenga que rehacer los enlaces del listado.

**Non-Goals:**
- No se crea la pantalla de detalle ni su ruta. Es lo que hace que este change sea chico; construirla acá lo convertiría en otra cosa.
- No se toca el menú de acciones por fila: editar y eliminar siguen viviendo ahí. El enlace del nombre es un camino nuevo, no un reemplazo.

## Decisions

- **El enlace apunta desde ya a `/app/lead/personas/:id`, aunque hoy termine en la pantalla de "no encontrado".** Alternativa considerada y descartada por elección explícita del usuario: darle al nombre la apariencia de enlace sin destino, y conectarlo cuando exista la pantalla. Se descarta porque un enlace que no navega es una promesa rota — el usuario hace clic y no pasa nada, que se lee como un defecto y no como algo pendiente. Caer en "no encontrado" es un estado honesto y además deja el contrato de la URL fijado para el change siguiente. La contrapartida está anotada en Riesgos.
- **El enlace es el nombre, no la celda entera ni el avatar.** Una celda completa clickeable agranda el blanco pero vuelve ambiguo dónde termina el enlace, y hace incómodo seleccionar el texto del correo. El avatar queda decorativo: ya tiene su `label` con el nombre para lectores de pantalla, y volverlo un segundo enlace al mismo destino duplicaría la parada de teclado por fila sin agregar nada.
- **Se usa el `Link` de react-router, no un `<a>` con `href`.** Un `<a>` provoca una recarga completa de la aplicación; `Link` navega dentro del router, que es lo que el escenario "Cambiar de página" ya espera del resto del listado. Además `Link` renderiza un `<a>` real, así que el foco por teclado y el menú contextual del navegador siguen funcionando solos.
- **El correo va en `text-body-sm text-neutral-subtle`**, el mismo par que ya usan los textos secundarios del formulario y de la tarjeta del switch. La jerarquía la da el color y el tamaño, no una tipografía distinta.

## Risks / Trade-offs

- [Entre este change y el que construya la pantalla, cada clic en un nombre lleva a "no encontrado", que además se renderiza sin el shell de Chapter Lead: el usuario pierde sidebar y breadcrumb y tiene que volver con el botón atrás] → Aceptado explícitamente por el usuario, que prefirió fijar el enlace ahora. La mitigación real es que el change de la pantalla de detalle sea el siguiente; si se demora, conviene reconsiderar y dejar el nombre sin enlace hasta entonces.
- [La fila crece de alto al sumar una segunda línea, y con ella la altura de toda la tabla] → Es la contrapartida que el usuario eligió a sabiendas frente a un tooltip, a cambio de que el correo esté siempre visible y no sólo al pasar el mouse (los tooltips además no existen en táctil).
- [`PeopleList` pasa a depender del router: sus tests tienen que envolverlo en un router o fallan al renderizar un `Link` suelto] → No es un riesgo nuevo del componente sino de sus pruebas, y el repo ya tiene el patrón resuelto: `ChapterLeadLayout.test.tsx` y `routes.test.tsx` usan `MemoryRouter` para exactamente esto.
