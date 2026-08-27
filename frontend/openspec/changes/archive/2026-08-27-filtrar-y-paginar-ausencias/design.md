## Context

`AbsencesTable` es hoy una `Table` desnuda: cabeceras y una fila por ausencia del mes, sin `toolbar` ni `footer`. Carga, error y estado vacío viven en `AbsencesContainer`, como bloques hermanos que **reemplazan** a la tabla según el estado.

`PeopleList` y `SquadsList` ya resuelven este mismo problema con los slots de `Table` de tuip: `toolbar` con `SearchField` + `FilterButton`, `footer` con `PaginationBar`, y carga/error/sin-resultados como `TableStatusRow` bajo las cabeceras —con un comentario que explica por qué: con returns tempranos, el filtro abierto se cerraba y el buscador perdía el foco en cada recarga—. La diferencia es de dónde salen los datos: `usePeople` pide al servidor con página, búsqueda y filtros; el endpoint de ausencias (`GET /absences?month=`) devuelve el mes entero de una y no acepta más parámetros. Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Poder responder "¿qué me queda por aprobar?" y "¿qué hizo esta persona este mes?" sin recorrer la tabla entera.
- Misma barra, mismo paginador y mismos estados que Personas y Células, para que las tres tablas se usen igual.
- No tocar el contrato con el backend ni las cifras del resumen.

**Non-Goals:**
- Paginar o filtrar en el servidor: mientras el endpoint devuelva el mes completo, hacerlo en el cliente es exacto y no cuesta una petición.
- Filtrar por célula, ordenar columnas o llevar el estado de los filtros a la URL (el mes sí sigue en `?mes=`).
- Tocar `AbsencesStatsCards`, los drawers, el diálogo de aprobación o la franja del breadcrumb.

## Decisions

**1. Acotar y paginar en el cliente, en un hook propio `useAbsencesFilters(items)`.**
El mes ya está en memoria; pedirlo otra vez por cada tecla sería peor en todo. El hook recibe las filas del mes y devuelve `{ visible, total, page, pageSize, totalPages, search, types, statuses, ...setters }`, con la misma forma que `PeopleList` espera de `usePeople`, para que `AbsencesTable` reciba props del mismo tipo que `PeopleList`. Así, si algún día el endpoint acepta parámetros, se sustituye el hook sin tocar la tabla.

**2. Sin *debounce* en el buscador.**
`usePeople` lo necesita porque cada tecla es una petición; aquí filtrar es recorrer un array de decenas de elementos en memoria. Un `useDebouncedValue` sólo añadiría un retardo perceptible sin ahorrar nada.

**3. La normalización del texto quita acentos, además de mayúsculas.**
Los nombres del chapter llevan tildes ("María", "López") y escribirlas es justo lo que nadie hace al buscar. Se normaliza con `normalize("NFD")` y se quitan los diacríticos, en los dos lados de la comparación.

**4. Los filtros se quedan con los valores del dominio, no con las etiquetas.**
`FilterButton` trabaja con `{value, label}`: las opciones se arman desde `TYPE_LABELS` y `STATUS_LABELS` del adaptador, con el valor crudo (`Vacation`, `Requested`, …) como `value`. Comparar por etiqueta ataría el filtro al idioma de la interfaz.

**5. Las opciones de los filtros son fijas, no derivadas del mes.**
Los tres tipos y los tres estados existen siempre; derivarlas de las filas del mes haría desaparecer opciones según el mes y volvería el control impredecible. (Es lo contrario del filtro de stacks en Personas, donde el universo sí es dinámico.)

**6. Cualquier cambio de búsqueda o filtro vuelve a la página 1.**
Sin eso, filtrar desde la página 3 deja la tabla vacía con paginador lleno. Se resuelve en los setters del hook, no en la tabla.

**7. Cambiar de mes reinicia búsqueda, filtros y página, ajustando el estado durante el render.**
El mes es el eje de la pantalla; arrastrar un filtro de "Solicitada" a un mes que no tiene ninguna daría un "Sin resultados" que se lee como un error. El reinicio compara la clave del mes con la del render anterior y ajusta el estado en el propio render, no en un `useEffect`: así la tabla no llega a pintarse una vez con los filtros del mes que se acaba de dejar, y además el lint del repo prohíbe `setState` dentro de un efecto (`react-hooks/set-state-in-effect`).

**8. Carga, error y "sin resultados" se mudan de `AbsencesContainer` a `AbsencesTable`, como `TableStatusRow`.**
Es el arreglo que `PeopleList` ya documenta: mantener la barra montada. El estado vacío del mes (sin ninguna ausencia) se queda fuera, reemplazando la tabla entera —no hay barra que ofrecer cuando no hay nada que acotar—, igual que `PeopleList` hace con "Todavía no hay personas".

## Risks / Trade-offs

- [Filtrar en el cliente no escala si un mes trae miles de filas] → Aceptado: un mes de ausencias de un chapter son decenas. Si eso cambia, la decisión 1 deja el reemplazo acotado al hook.
- [El resumen y la tabla pueden contarse distinto y confundir] → Las cards siguen siendo del mes y el paginador dice el total filtrado; son dos lecturas distintas y así queda especificado. El riesgo real sería filtrar también el resumen, que es lo que se descarta.
- [Mudar carga y error dentro de la tabla cambia dónde aparecen] → Es el precio de no desmontar la barra, y alinea Ausencias con Personas y Células; los tests que los buscaban por texto siguen encontrándolos.
- [Dos meses distintos con el mismo filtro obligan a re-marcarlo] → Aceptado por la decisión 7: es preferible a un "Sin resultados" heredado.
- [Aprobar o rechazar puede sacar la fila del filtro activo y dejar "Sin resultados"] → Es correcto: la fila dejó de cumplir lo que el usuario pidió ver, y la barra sigue puesta para deshacerlo. La página, en cambio, sí se acota sola al encogerse el conjunto, para no quedar vacía con paginador lleno.
