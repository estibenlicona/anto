## Context

`PeopleContainer` apila hoy tres bloques con `gap-6`: `PeopleHeader` (h1 "Personas" + descripción + botón "Nueva persona"), `PeopleStatsCards` y `PeopleList`. `LeadPeoplePage` ya tiene un `h1` `sr-only` "Gestionar Personas", así que la pantalla arrastra **dos** encabezados de nivel 1 y el visible no coincide con el breadcrumb.

El mecanismo del shell ya está construido por `compactar-vista-celulas`: `LeadBreadcrumbContext` expone `useLeadBreadcrumbActions(node)`, que publica un `ReactNode` en la franja del breadcrumb mientras el componente está montado y lo limpia al desmontar; fuera del provider es un no-op. `ChapterLeadLayout` pinta esa franja como `flex items-center justify-between` con el breadcrumb a la izquierda y las acciones a la derecha, con `py-2` en la franja y en el `<main>`. Este change **consume** ese mecanismo; no lo toca. Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Recuperar el alto del encabezado para el listado, sin perder la acción de crear.
- Dejar un único `h1`, `sr-only`, coincidente con el breadcrumb.
- Misma disposición y mismo espaciado que células, para que los dos módulos del lead se lean igual.

**Non-Goals:**
- Tocar el shell (`LeadBreadcrumbContext`, `ChapterLeadLayout`): ya quedó como debe estar.
- Tocar `PeopleList`, `PeopleStatsCards`, el detalle de persona o el plan de carrera.
- Extraer un componente compartido "listado de módulo" a partir de células y personas; con dos casos la abstracción no se paga todavía.
- Replicar el cambio en otros módulos con encabezado propio.

## Decisions

**1. `PeopleContainer` publica el botón con `useLeadBreadcrumbActions`; se elimina `PeopleHeader`.**
El contenedor es dueño de `openCreate`, así que es quien publica. `PeopleHeader` queda sin contenido y se borra en vez de dejarle una fila con sólo el botón —que es justo el espacio a recuperar—; grep confirma que `PeopleContainer` es su único consumidor. Se copia el patrón de `SquadsContainer` al pie de la letra, incluido el comentario que explica por qué no hay encabezado.

**2. El botón va `size="small"` con `iconBefore` `<Icon name="user" size={16} />`.**
Mismo criterio que en células: la franja es una banda de navegación y un botón de altura completa la volvería un encabezado. Se conserva el icono `user` que ya usaba `PeopleHeader`, bajando el tamaño de 20 a 16 para acompañar al botón pequeño.

**3. `LeadPeoplePage` no cambia; el `h1` `sr-only` que ya tiene pasa a ser el único.**
No hace falta añadir nada: quitar el `h1` visible de `PeopleHeader` resuelve el duplicado. Se añade `LeadPeoplePage.test.tsx` —hoy inexistente— que afirme un único `heading` nivel 1 "Gestionar Personas", siguiendo `LeadSquadsPage.test.tsx`.

**4. `gap-6` → `gap-2` en la raíz del contenedor.**
El valor no se re-deriva: en células se llegó a `gap-2` tras mirarlo en el navegador, y el padding de la franja y del `<main>` (`py-2`) ya es global al shell. Copiar el mismo número es lo que hace que las dos pantallas se vean iguales.

**5. Los tests del contenedor montan `LeadBreadcrumbProvider` con una sonda que pinta `actions`.**
Es la única forma de afirmar "el botón publicado abre el formulario" sin montar el layout entero; `SquadsContainer.test.tsx` ya tiene la sonda escrita y se replica.

## Risks / Trade-offs

- [Los tests actuales de `PeopleContainer` afirman el encabezado visible] → Se reemplazan por asserts de ausencia de "Personas"/"Perfiles y seniority del equipo" como encabezado y de presencia del botón dentro de la sonda; los asserts de las cards y del listado siguen igual.
- [Dos botones "Nueva persona" en el vacío inicial] → Aceptado; es la situación actual con el encabezado y ambos abren lo mismo. Idéntico a células.
- [Duplicación entre `SquadsContainer` y `PeopleContainer`] → Aceptada a propósito (ver Non-Goals): dos copias del mismo patrón de cinco líneas son más baratas que una abstracción prematura.
