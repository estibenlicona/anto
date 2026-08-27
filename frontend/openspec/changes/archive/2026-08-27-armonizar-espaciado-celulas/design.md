## Context

`SquadsContainer` apila resumen y listado con `gap-2` (8px), fijado por la spec `squads-list` en `compactar-vista-celulas`. `SquadsStatsCards` pinta sus tres cards con `grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1.2fr]` (16px). `compactar-vista-ausencias` unificó las dos medidas de ausencias a `gap-3` (12px) y dejó anotado en su design que células y personas seguían en 8px + 16px y que replicarlo era un ajuste aparte. Ver proposal.md — Why.

Las dos medidas son clases de Tailwind sobre el elemento raíz de cada componente; no hay un token de espaciado compartido entre módulos ni ningún test que afirme sobre ellas.

## Goals / Non-Goals

**Goals:**
- Que células y ausencias se lean con la misma separación, en vertical y entre cards.
- Dejar el requisito cubierto por un test, como el resto de requisitos de `squads-list`.

**Non-Goals:**
- Tocar el detalle de célula (`SquadDetailContainer`, `SquadTeamStatsCards`): distinta anatomía y distinta regla (ver proposal.md — Impact).
- Tocar el listado de Personas: su spec `people-list` fija 8px y va en su propio change.
- Cambiar las columnas del grid del resumen o el contenido de las cards.
- Introducir una constante o componente compartido de "vista de listado" para las tres pantallas.

## Decisions

**1. Se cambian las dos clases en su sitio, sin abstraer.**
Son dos literales: `gap-2` → `gap-3` en el raíz de `SquadsContainer` y `gap-4` → `gap-3` en el grid de `SquadsStatsCards`. Alternativa descartada: una constante `LIST_VIEW_GAP` compartida con ausencias y personas. Tres módulos con la misma clase todavía no justifican el acoplamiento, y la spec de cada módulo ya es el lugar donde la medida queda escrita.

**2. El grid de las cards conserva sus columnas asimétricas.**
Ausencias usa `sm:grid-cols-3` con tres cards iguales; células tiene dos `DistributionCard` con leyenda en línea que necesitan más ancho que la card de conteo, de ahí `lg:grid-cols-[1fr_1.2fr_1.2fr]`. Sólo se armoniza la separación, no el reparto de columnas.

**3. En la spec se reemplaza el requisito (REMOVED + ADDED) en vez de modificarlo.**
El requisito viejo se llama "espaciado vertical compacto" y ya no describe lo que fija: la nueva regla cubre también la separación horizontal entre cards. Renombrarlo y modificarlo en el mismo delta es más frágil que retirarlo con motivo y migración y añadir el nuevo con el mismo nombre y redacción que en `absences-month-view`, para que las dos specs se lean igual.

**4. Se añaden asserts sobre las clases de separación.**
Hoy ningún test afirma sobre `gap-*` en el módulo; el requisito quedaría sin cobertura. Se afirma sobre la clase (`gap-3`) en el raíz del contenedor y en el grid del resumen, que es lo que `AbsencesContainer.test.tsx` / `AbsencesStatsCards.test.tsx` deberían hacer también; es un assert de clase, no de píxeles, porque jsdom no calcula layout.

## Risks / Trade-offs

- [Las cards de resumen de células se acercan 4px y el contenedor se abre 4px] → Es exactamente lo que ya se ve en ausencias; se revisa en el navegador antes de cerrar.
- [Personas queda como única pantalla de listado en 8px + 16px] → Aceptado y anotado en el proposal; es un change gemelo de dos líneas.
- [El detalle de célula sigue en `gap-6`/`gap-4`] → Decisión de alcance explícita; si el usuario quiere también el detalle, es una regla nueva para pantallas de detalle (persona, célula, Torre de control), no una extensión de ésta.
