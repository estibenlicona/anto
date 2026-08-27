## Context

`AbsencesContainer` apila hoy sus bloques con `gap-6`, empezando por `AbsencesHeader`: título "Ausencias", dos líneas de descripción, el navegador de mes (anterior / título del mes / siguiente) y el botón "Registrar ausencia". `LeadAbsencesPage` es un one-liner sin `h1` propio, así que el único encabezado de nivel 1 de la pantalla es el visible del header. Bajo la tabla hay un `Alert` informativo sobre el alcance del registro.

El mecanismo del shell ya está construido por `compactar-vista-celulas`: `useLeadBreadcrumbActions(node)` publica un `ReactNode` en la franja del breadcrumb mientras el componente está montado y lo limpia al desmontar; fuera del provider es un no-op. `ChapterLeadLayout` pinta la franja como `flex items-center justify-between` con `py-2`, y `compactar-vista-personas` ya replicó el patrón una vez. Este change lo consume; no lo toca. Ver proposal.md — Why.

La diferencia con células y personas: aquí no sube un botón suelto sino dos controles, y el mes visible vive en la URL (`?mes=YYYY-MM`), no en estado local.

## Goals / Non-Goals

**Goals:**
- Recuperar el alto del encabezado para la tabla, sin perder ni el navegador de mes ni la acción de registrar.
- Dejar un único `h1`, `sr-only`, coincidente con el breadcrumb.
- Misma disposición y mismo espaciado que células y personas, para que los tres módulos de Capacidad se lean igual.

**Non-Goals:**
- Tocar el shell (`LeadBreadcrumbContext`, `ChapterLeadLayout`).
- Tocar `AbsencesTable`, los drawers de registro/rechazo, el diálogo de aprobación, los hooks o el servicio.
- Cambiar dónde vive el mes visible: sigue en `?mes=YYYY-MM`.
- Extraer un componente compartido de "listado de módulo" a partir de las tres pantallas.

## Decisions

**1. Se publica un solo nodo con los dos controles: navegador de mes y, a su derecha, el botón.**
`useLeadBreadcrumbActions` acepta cualquier `ReactNode`, así que el contenedor publica un `<div className="flex items-center gap-2">` con el navegador y el botón, en el mismo orden que hoy tienen dentro del header. La spec de `lead-shell-page-actions` habla de "las acciones que la pantalla publique", en plural, así que no hace falta ampliarla. Alternativa descartada: dejar el navegador en el contenido como fila propia sobre las cards — gasta justo la fila que este change quiere recuperar.

**2. `AbsencesHeader` se parte: el navegador sobrevive como componente propio, el resto se borra.**
El navegador es markup con detalle (chevron girado por falta de `chevron-left` en el set, ancho mínimo inline para que el título del mes no salte al cambiar de mes) que no conviene inline en el contenedor. Se extrae a `AbsencesMonthNav` en `components/`, con las props `monthTitle`, `onPreviousMonth`, `onNextMonth`, conservando ese markup tal cual (incluidos sus comentarios y los `aria-label` "Mes anterior"/"Mes siguiente", de los que dependen los tests). `AbsencesHeader` se elimina.

**3. El botón pasa a `size="small"`; el navegador ya lo era.**
Mismo criterio que en células y personas: la franja es una banda de navegación. Los dos botones del navegador ya son `subtle` `size="small"`, así que el bloque queda homogéneo. Se conserva el icono `calendar` a 16.

**4. `LeadAbsencesPage` pasa de one-liner a `div` con `h1` `sr-only`.**
Hoy no envuelve nada porque el `h1` visible del header cubría el landmark; al retirarlo hay que reponerlo, con el texto del breadcrumb ("Gestionar Ausencias"), igual que `LeadPeoplePage` y `LeadSquadsPage`. Se añade `LeadAbsencesPage.test.tsx` que afirme que es único.

**5. `gap-3` como única medida de separación de la vista.**
Se parte del `gap-2` medido en células y verificado en personas, pero al verlo aquí saltó que la pantalla mezclaba dos medidas: 8px entre bloques y 16px entre cards. A pedido del usuario las dos pasan a `gap-3` (12px), que es el punto medio y deja una sola regla para toda la vista. El `py-2` de la franja y del `<main>` es del shell y no cambia. Queda la inconsistencia con células y personas, que siguen en 8px + 16px: replicarlo allí es un ajuste aparte, porque sus specs archivadas fijan los 8px.

**6. Se retiran el `Alert` de alcance y el pie de la card de impacto, por decisión del usuario.**
Los dos son texto explicativo; el `Alert` cuelga bajo la tabla y el pie vive dentro de la card. Del pie se retira la línea entera —las dos ramas—: dejar sólo "Ninguna ausencia aprobada este mes descuenta capacidad." haría que el pie apareciera justo en el mes en que menos aporta. `mostAffectedSquadName` deja de usarse en la vista; se conserva en el adaptador y en el mock, que son contrato con el backend y no cuestan nada. Al quitar ese pie la card quedaba con la referencia al FTE colgando de la cifra como sufijo, así que —a pedido del usuario tras verlo— esa referencia baja al pie: las tres cards quedan con la misma anatomía (rótulo, cifra sola, pie) y sus pies alineados.

**7. Los tests del contenedor montan `LeadBreadcrumbProvider` con una sonda que pinta `actions`.**
No es opcional aquí como en personas: dos tests existentes hacen clic en "Mes anterior"/"Mes siguiente", que pasan a vivir en lo publicado. Sin la sonda esos botones no se renderizan y los tests fallan. Se replica la sonda de `SquadsContainer.test.tsx`/`PeopleContainer.test.tsx`.

## Risks / Trade-offs

- [La franja queda cargada: breadcrumb + navegador + botón] → Aceptado y verificado en la revisión manual; si el navegador aprieta, reducir el `minWidth` del título del mes es un cambio de una línea. La alternativa (navegador en el contenido) contradice el objetivo del change.
- [Perder el aviso de alcance deja sin explicar de dónde saldrán factura y ajuste de capacidad] → Decisión explícita del usuario; queda registrada acá y en la spec para que no se lea como un descuido.
- [Al quitar el pie, la card de impacto pierde la única mención de que sólo cuenta lo aprobado] → Aceptado; la cifra sigue etiquetada "Impacto en capacidad" y contrastada contra el FTE del chapter.
- [Duplicación del patrón con `SquadsContainer` y `PeopleContainer`] → Tercera copia; sigue siendo más barata que una abstracción, pero si aparece una cuarta pantalla conviene reconsiderarlo.
