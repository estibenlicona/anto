## Context

`PeopleContainer.tsx` hoy no tiene ningún encabezado — arranca directo en `PeopleList` (toolbar + tabla). El botón "Crear persona" vive en su propia fila arriba del toolbar, dentro de `PeopleList.tsx`. `tuip` ya tiene `Card`/`CardHeader`/`CardBody` (superficie genérica), `AvatarGroup` (superpone avatares con overflow "+N", `max` configurable), y `Progress` (barra 0-100 de un solo valor) — los tres sirven tal cual para las cards de "Personas activas" y "FTE disponible". `SegmentedBar` también existe (vive en `progress.tsx`); hasta hace poco sus segmentos solo aceptaban `role: "info"|"warning"|"success"|"danger"` (4 colores de estado), sin el vocabulario categórico de 6 tonos que ya usan `Tag`/`Avatar` (gris/verde/azul/ámbar/rojo/morado). Ver proposal.md - Why.

**Dependencia externa resuelta**: el change `add-segmented-bar-categorical-color`, en el root de OpenSpec de `tuip`, extendió `SegmentedBar` para aceptar `color` (vocabulario categórico) además de `role`, ya se archivó, y el paquete se publicó localmente (`pnpm run publish:local`) — la card de distribución ya no está bloqueada.

**Dependencia externa pendiente (fidelidad con el mockup)**: al comparar las cards implementadas contra el mockup HTML de referencia quedaron tres diferencias que no se pueden cerrar desde la app porque viven en componentes/tokens de `tuip` — ver "Fidelidad con el mockup" en Decisions. Requieren un change propio en el root de `tuip`, aún sin proponer, y ese change debe ir primero.

**Seniority y nivel SFIA se fusionaron**: el change `merge-seniority-and-sfia-level` (implementado, aún sin archivar al momento de esta revisión) eliminó "nivel SFIA" como concepto separado — el dato de seniority pasó a ser la escala de 4 niveles que antes era SFIA (Principiante/Competente/Avanzado/Experto). Por eso la card de distribución, que originalmente eran dos (seniority de 5 valores + nivel SFIA de 4), colapsa en una sola de 4 niveles.

## Goals / Non-Goals

**Goals:**
- Encabezado de Personas (título + descripción + botón "Nueva persona") y 3 cards de resumen, igual a la imagen de referencia (con la distribución por seniority y por nivel SFIA ya colapsadas en una sola card, ver Context).
- El resumen agrega sobre el total de personas registradas, independiente de la búsqueda/filtro/página activos en la tabla de abajo.
- Contrato de datos nuevo (`GET /people/stats`) implementado en el mock, calculado de verdad sobre las personas en memoria.

**Non-Goals:**
- No se implementa `GET /people/stats` en el backend .NET real en este cambio — queda como brecha documentada, igual que la paginación en su momento.
- No se agrega tracking histórico ni el badge de tendencia trimestral ("+2 este trim.") — no hay datos para calcularlo.
- No se agrega un concepto real de "capacidad objetivo" configurable — el mock la asume como un valor fijo; el cálculo real es responsabilidad del backend, fuera de alcance.
- No se agrega buscador global, botón de exportar, ni el breadcrumb de 3 niveles de la imagen de referencia — son cambios de layout compartido, no de esta pantalla.

## Decisions

**Contrato de `GET /people/stats`** (ya implementado en el mock y en `personService.ts`, ver `frontend/src/features/people/services/personService.ts`):
```ts
interface PeopleStats {
  activeCount: number;
  fteAvailable: number;
  fteTarget: number;
  bySeniority: { seniority: number; label: string; count: number }[];
  sample: { id: string; name: string }[]; // primeras 5 personas por nombre, para los avatares
}
```
`sample` se agregó durante la implementación: la card de "Personas activas" necesita nombres reales para derivar iniciales de avatar, y un conteo agregado no alcanza — el contrato original no lo contemplaba.
El campo `bySfiaLevel` que tenía el contrato original ya no existe: `merge-seniority-and-sfia-level` fusionó ambos conceptos, así que `bySeniority` es la única distribución, y ganó el campo `label` (antes solo lo tenía el catálogo de nivel SFIA).
`activeCount`, `fteAvailable` y `bySeniority` se calculan de verdad sobre el array `people` en memoria del mock (mismo patrón que ya usa `SENIORITIES` para el catálogo). `fteTarget` es un valor fijo asumido por el mock (ej. `12`), documentado en el handler como un placeholder hasta que el backend real lo calcule — el Chapter Lead pidió explícitamente asumirlo en el mock en vez de modelar una "capacidad objetivo" real en este cambio.

**"Personas activas" = total de personas registradas**: hoy no existe un campo de estado activo/inactivo en `Person` — todas las personas registradas se consideran activas. El nombre de la card anticipa un estado futuro (el Chapter Lead confirmó que en el futuro podría haber personas de baja/inactivas), pero agregar ese campo es un cambio de modelo aparte, fuera de alcance aquí. `activeCount` en el contrato de arriba es, por ahora, literalmente `people.length`.

**FTE disponible con `Progress`**: el % de capacidad asignada se deriva en el cliente como `((fteTarget - fteAvailable) / fteTarget) * 100`, pasado como `value` a `Progress`.

**Personas activas con `AvatarGroup`**: se listan las personas registradas como children de `Avatar` (mismas iniciales que ya usa `PeopleList`), envueltos en `AvatarGroup` con `max={5}` para que el overflow "+N más" salga solo.

**Distribución con `SegmentedBar` (color categórico)**: una sola card mapea los 4 niveles de seniority a colores categóricos fijos y estables — Principiante=gray, Competente=amber, Avanzado=blue, Experto=purple (mismo mapeo usado en el ejemplo de la documentación de `SegmentedBar` en tuip) — mismo criterio que ya documenta `Avatar` ("color siempre una elección explícita del consumidor, nunca derivado"). La leyenda debajo de la barra repite el mismo color como punto, más la etiqueta y el conteo.

**Botón "Nueva persona"**: mismo botón que hoy es "Crear persona" (mismo `onCreate`/flujo de alta), solo cambia de texto y de posición — se mueve del toolbar de `PeopleList` al encabezado nuevo en `PeopleContainer`.

**Fidelidad con el mockup**: el mockup HTML de referencia se comparó contra las cards ya implementadas. Los colores categóricos coinciden exactamente (Principiante gris, Competente ámbar, Avanzado azul, Experto morado), pero quedaron estas diferencias:

*Resolubles en la app (esta pantalla, sin tocar tuip):*
- La métrica principal de cada card es el elemento dominante del mockup (40px, peso 700, `tabular-nums`, `letter-spacing` negativo) y hoy usa `text-heading-lg` (24px / 600).
- El bloque inferior de cada card (avatares, barra+leyenda, footer del progress) lleva `margin-top: auto` en el mockup, para que las tres cards alineen su contenido inferior aunque el bloque de arriba tenga alturas distintas. Sin eso, la card de "Personas activas" queda con un hueco visible abajo.
- La leyenda de la card de distribución es un grid de **2 columnas** (`1fr 1fr`, gap 8px/14px), no una lista de una sola columna.
- El slot derecho del header de la card de distribución muestra el **total de personas**, no un icono (las otras dos cards sí llevan icono).
- El conteo de cada entrada de la leyenda va en peso 700 con `tabular-nums`.
- El divisor de FTE (`/ 12.0`) es visiblemente más grande y de más peso que el `text-body-sm` actual.

*No resolubles desde la app — requieren un change en `tuip` (ver Context):*
- **Separación entre segmentos de `SegmentedBar`**: el mockup deja `gap: 3px` entre segmentos y redondea cada uno por separado; `SegmentedBar` hoy pinta una barra continua dentro de un único contenedor redondeado, con los segmentos pegados entre sí.
- **Relleno del `Progress`**: el mockup usa un degradado de marca (rojo). `Progress` hoy usa relleno sólido `bg-success-bold` y sólo cambia a `danger` cuando el valor supera 100. El Chapter Lead pidió adoptar el degradado del mockup; se recomienda que en `tuip` se agregue como una **opción explícita** del componente y no como el nuevo default, porque el color actual codifica un significado (verde = dentro de capacidad, rojo = sobreasignado) del que dependen otros consumidores.
- **Token tipográfico para la métrica**: el token más grande de `tuip` hoy es `display` (34px). El Chapter Lead eligió agregar un token nuevo en `tuip` para el tamaño del mockup, en vez de usar un valor suelto (`text-[40px]`) que rompería la escala tipográfica del sistema.

*Fuera de alcance, ya decidido antes y no contabilizado como diferencia:* el badge de tendencia "+2 este trim." (no hay datos históricos), el buscador global y el botón de exportar del header, y la card de "Distribución por nivel SFIA" (eliminada por la fusión de seniority y SFIA).

**Descripción del encabezado**: el texto actual en `PeopleHeader.tsx` ("Perfiles, seniority y niveles SFIA del equipo") quedó desactualizado por la fusión — se corrige a algo que no mencione "niveles SFIA" como concepto separado (ej. "Perfiles y seniority del equipo").

## Risks / Trade-offs

- [`fteTarget` fijo no refleja la realidad de ningún chapter] → Aceptado explícitamente por el Chapter Lead como una asunción del mock; el cálculo real queda documentado como brecha de backend.
- [Verificación end-to-end del cálculo real de capacidad objetivo] → No aplica en este cambio (mock-only); se retoma cuando el backend real implemente `GET /people/stats`.
- [El degradado del `Progress` reasigna el significado del color] → Mitigado proponiéndolo en `tuip` como opción explícita del componente, no como default: los consumidores que hoy dependen de "verde = dentro de capacidad" no cambian solos.
- [Bloqueo cross-root de nuevo] → Las tres diferencias de tuip vuelven a bloquear el cierre visual de las cards hasta que ese change se implemente, se archive y se publique el paquete (`pnpm run publish:local`). El resto de los ajustes de fidelidad no dependen de eso y pueden cerrarse antes.
