## Context

La celda del nombre en `PeopleList.tsx:160-172` es un `<Link>` de react-router con cinco clases escritas a mano: `leading-5 text-brand-default hover:underline focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring`. Es el único enlace con tratamiento visual de toda la aplicación — el otro `<Link>` del código, en `HomePage.tsx:8`, no tiene ninguna clase. Ver proposal.md — Why.

La pieza que reemplaza esas clases no existe todavía: la crea el change `add-link-component` del repositorio `tuip`, que agrega `Link` al catálogo con `tone: "brand" | "neutral"` y con `asChild` para ceder su etiqueta al enlace del router del consumidor. Este change es el consumo, y no puede aplicarse antes de que ese `.tgz` esté republicado.

El `Link` de `react-router-dom` y el `Link` de `@tuya-ui/components` comparten nombre. `PeopleList` importa hoy el primero sin alias.

## Goals / Non-Goals

**Goals:**

- Quitar el rojo de marca de la columna de nombres sin perder ninguna de las cuatro cosas que el enlace hace hoy: navegar dentro del router, ser alcanzable con Tab, mostrar foco visible y ser anunciado como enlace.
- Dejar de decidir en la pantalla cómo se ve un enlace. El tratamiento pasa a ser una elección entre los tonos que ofrece el sistema.

**Non-Goals:**

- No se agrega ningún componente ni utilidad local a la aplicación: `frontend/src/shared/components/` sigue sin tener piezas propias, y lo que hay ahí sigue siendo sólo la prueba desde el lado del consumidor de piezas de `tuip`.
- No se toca el destino del enlace ni la pantalla de detalle. Un clic sigue cayendo en "no encontrado" hasta que esa pantalla exista.
- No se revisan los demás usos del rojo de marca de la pantalla (el botón primario del encabezado, el riel del ítem activo del sidebar). El pedido es sobre los hipervínculos.

## Decisions

- **Se usa `asChild`, con el `Link` de react-router como hijo.**
  ```tsx
  import { Link as RouterLink } from "react-router-dom";
  import { Link } from "@tuya-ui/components";

  <Link asChild tone="neutral" className="leading-5">
    <RouterLink to={`/app/lead/personas/${person.id}`}>{person.name}</RouterLink>
  </Link>
  ```
  Sale un único `<a>`, con las clases del tono neutro y con la navegación del router. Alternativa considerada: pasarle `href` al `Link` del sistema y dejar que navegue el navegador. Se descarta porque provoca una recarga completa de la aplicación, que es exactamente lo que el escenario "Cambiar de página" del spec de `people` ya prohíbe para el resto del listado.

- **El alias va en el import de react-router (`RouterLink`), no en el del sistema de diseño.** Los dos se llaman `Link` y hay que renombrar uno. Se renombra el del router porque el del sistema es el que se lee en el JSX de la celda y el que un lector busca en la documentación de `tuip`; dejarlo con su nombre propio es lo que hace que la línea se entienda sin ir a los imports. Es además lo que ya se hace con el resto del paquete, que se importa siempre con su nombre.

- **`leading-5` se conserva y viaja como `className`.** No es tratamiento de enlace sino de composición: acerca el nombre al correo para que se lean como un bloque, y el comentario que lo explica ya está en el código. `Link` compone el `className` recibido sobre el suyo, así que sobrevive al cambio de tono.

- **Las otras cuatro clases desaparecen sin reemplazo local.** `text-brand-default` lo reemplaza `tone="neutral"`; `hover:underline`, `focus-visible:outline-none`, `focus-visible:ring-focus` y `focus-visible:ring-brand-focus-ring` los trae la pieza, y el anillo pasa a ser neutro por derivar del tono. Si algo de eso hubiera que volver a escribir acá, sería señal de que la pieza quedó corta y el arreglo va en `tuip`, no en la pantalla.

- **La prueba nueva asserta la ausencia del rojo, no la presencia del gris.** `expect(link.className).not.toMatch(/brand/)` sobre el enlace del nombre: es lo que el usuario pidió, y no se rompe si el sistema cambia el paso concreto de neutro que usa el tono. Alternativa considerada: asertar la clase exacta del tono neutro. Se descarta porque ata la prueba de la pantalla a un detalle interno de `tuip`, que ya tiene su propia prueba para eso.

- **El delta del spec se escribe sobre la unión de los tres deltas pendientes de `Listar personas`, no sobre el spec principal.** Hoy hay tres changes sin archivar que modifican ese mismo requisito con textos divergentes: `add-people-name-link-and-email` (correo + enlace), `add-identity-avatar-colors` (color de avatar) y `adopt-seniority-card-in-people` (componente de nivel). Como el archivado reemplaza el requisito entero con el texto del delta, el último en archivarse pisa a los otros dos. Las tres cosas ya están construidas y visibles en `PeopleList.tsx`, así que el delta de este change las incluye a las tres además de lo suyo: si éste archiva último, no se pierde nada. No es una ampliación de alcance —no agrega comportamiento nuevo ni tareas— sino un seguro contra una pérdida de texto que el orden de archivado decidiría al azar. Se anota como riesgo la contrapartida.

## Risks / Trade-offs

- **[El nombre deja de tener cualquier señal en reposo: mismo color y mismo peso que Cargo, Rol y Modalidad. Nadie sabe que es un enlace hasta que le pasa el puntero por encima, y en una tablet o un teléfono no hay puntero que pasar]** → Aceptado explícitamente por el usuario, que eligió esta opción frente al subrayado permanente. Lo que no se pierde: el foco por teclado sigue visible, el ancla sigue siendo un ancla, y un lector de pantalla sigue anunciando el nombre como enlace y listándolo entre los enlaces de la página. Lo que sí se pierde es el descubrimiento visual, y el spec lo dice ahora en su propio escenario en vez de dejarlo implícito. Si en uso resulta que nadie encuentra el enlace, la vuelta atrás es cambiar un valor de prop —a `tone="brand"`, o a un tono con subrayado permanente si se agrega— sin tocar la estructura de la celda.

- **[Este change no puede aplicarse hasta que `tuip` publique `Link`]** → Es una dependencia dura y está declarada como primera tarea. Mientras tanto, el listado sigue funcionando exactamente como hoy: no hay estado intermedio roto, porque no se toca nada hasta tener la pieza.

- **[Escribir el delta como unión de tres changes pendientes significa que este archivo afirma comportamiento que otros changes construyeron. Si alguno de ellos se abandona o cambia de forma antes de archivarse, este delta queda afirmando algo que no se cumple]** → Los tres están construidos y visibles en `PeopleList.tsx` hoy (`Avatar colorId`, `SeniorityCard`, correo y enlace), así que el texto describe la pantalla real y no una intención. La revisión que corresponde es al archivar: si alguno de esos changes cambió de forma en el ínterin, el texto de este delta hay que reconciliarlo antes.

- **[`asChild` exige un hijo único que reenvíe props y `ref`. El `Link` de react-router los reenvía, pero un futuro envoltorio intermedio podría no hacerlo, y el fallo no es obvio]** → La prueba del `href` que ya existe en `PeopleList.test.tsx` lo detecta: si el `Slot` no llega al ancla, no hay `href` que encontrar.

## Migration Plan

Un solo paso reversible. `pnpm install` en `frontend/` toma el `.tgz` regenerado —la ruta en `package.json` no cambia, porque el nombre del archivo conserva la versión `0.1.0`—, y el cambio en la pantalla son cinco líneas en una celda. Volver atrás es restaurar el `<Link>` de react-router con sus clases y reinstalar el `.tgz` anterior.
