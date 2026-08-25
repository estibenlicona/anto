## 1. Mock

- [x] 1.1 Agregar el handler `GET /people/stats` en `people.handlers.ts`: calcula `activeCount`, `fteAvailable` y `bySeniority` sobre el array `people` en memoria; `fteTarget` es un valor fijo asumido (documentado con un comentario). (El `bySfiaLevel` que tenía originalmente esta tarea se eliminó al fusionarse con seniority en `merge-seniority-and-sfia-level`.)
- [x] 1.2 Tests del nuevo handler: cuenta correcta por seniority, `fteAvailable` suma bien, `activeCount` refleja el total en memoria (incluye altas/bajas de la sesión).

## 2. Frontend — datos

- [x] 2.1 Agregar tipo `PeopleStats` y `personService.getStats()` en `personService.ts`.
- [x] 2.2 Crear un hook (`usePeopleStats`) que cargue el resumen una vez al montar la pantalla, independiente de `usePeople` (no depende de página/búsqueda/filtros).

## 3. Frontend — encabezado

- [x] 3.1 Crear el encabezado de Personas (título "Personas", descripción, botón "Nueva persona" a la derecha) en `PeopleContainer.tsx`, reusando el `onCreate` existente. (La descripción original mencionaba "niveles SFIA"; se corrige en la tarea 4.4 tras la fusión con seniority.)
- [x] 3.2 Quitar la fila de "Crear persona" de `PeopleList.tsx` (ya no aplica, se reemplaza por el botón del encabezado). Se dejó el botón del EmptyState de registro inicial, renombrado a "Nueva persona" por consistencia.

## 4. Frontend — cards de resumen

- [x] 4.1 Card "Personas activas": `activeCount` + `AvatarGroup` (`max={5}`) con las iniciales de las personas registradas.
- [x] 4.2 Card "FTE disponible": `fteAvailable`/`fteTarget` + `Progress` con el % de capacidad asignada derivado en el cliente.
- [x] 4.3 Card "Distribución por seniority": `SegmentedBar` (con `color` categórico, no `role`) + leyenda con color/etiqueta/conteo para los 4 niveles de seniority (Principiante=gray, Competente=amber, Avanzado=blue, Experto=purple). Ya no está bloqueada — `add-segmented-bar-categorical-color` se archivó en tuip y el paquete se publicó localmente. Implementada en `PeopleStatsCards.tsx`; requirió reinstalar `@tuya-ui/components` en el frontend (caché de pnpm servía el tarball viejo).
- [x] 4.4 Corregir la descripción del encabezado en `PeopleHeader.tsx` ("Perfiles, seniority y niveles SFIA del equipo" → sin mencionar "niveles SFIA" como concepto separado) y su assertion en `PeopleContainer.test.tsx`. Nuevo texto: "Perfiles y seniority del equipo".

## 5. Fidelidad con el mockup de referencia

Ajustes surgidos de comparar las cards implementadas contra el mockup HTML. Ver "Fidelidad con el mockup" en design.md.

- [x] 5.1 `PeopleStatsCards.tsx`: dar a la métrica principal de cada card el peso visual del mockup — tamaño grande, peso 700, `tabular-nums` y tracking ajustado. **Depende del token nuevo de tuip** (tarea 5.7).
- [x] 5.2 `PeopleStatsCards.tsx`: `margin-top: auto` (`mt-auto`) en el bloque inferior de las tres cards (avatares, footer del progress, barra+leyenda), para que alineen su contenido inferior aunque el bloque superior tenga alturas distintas.
- [x] 5.3 `PeopleStatsCards.tsx`: la leyenda de la card de distribución pasa de lista de una columna a grid de 2 columnas (gap 8px vertical / 14px horizontal).
- [x] 5.4 `PeopleStatsCards.tsx`: el slot derecho del header de la card de distribución muestra el total de personas en vez del icono `chart-column` (las cards de Personas activas y FTE conservan su icono).
- [x] 5.5 `PeopleStatsCards.tsx`: el conteo de cada entrada de la leyenda va en peso 700 con `tabular-nums`.
- [x] 5.6 `PeopleStatsCards.tsx`: subir el tamaño/peso del divisor de FTE (`/ 12.0`) respecto al `text-body-sm` actual.
- [x] 5.7 **Bloqueado — requiere un change en el root de `tuip`, aún sin proponer**: separación entre segmentos de `SegmentedBar` con esquinas redondeadas individuales; opción de relleno con degradado de marca en `Progress` (como opción explícita, no como default); y un token tipográfico nuevo para la métrica de las cards. Después: `pnpm run publish:local` en tuip y reinstalar en el frontend (borrar la entrada stale de `.pnpm` y la caché `.vite`).
- [x] 5.8 Aplicar en `PeopleStatsCards.tsx` lo que habilite la tarea 5.7 (barra con separación, progress con degradado, token de la métrica).

## 6. Verificación

- [x] 6.1 Ejecutar la suite de tests del frontend y confirmar que pasan. Re-ejecutado tras agregar la card de distribución: 314/315 OK; las 2 fallas (`App.test.tsx`, `httpClient.test.ts`) son preexistentes y no están relacionadas con este cambio. `tsc --noEmit` también limpio salvo el mismo `App.test.tsx`.
- [x] 6.2 Probar en el navegador (modo mock): encabezado con título/descripción/botón, las 3 cards con datos reales, y que el resumen no cambia al buscar/filtrar/paginar el listado de abajo. Verificado completo: encabezado con la descripción corregida ("Perfiles y seniority del equipo"); las 3 cards con datos reales; card de distribución con la barra segmentada coloreada (ámbar/azul/morado, Principiante en 0 sin ocupar espacio) y su leyenda; "Nueva persona" abre el drawer con el selector único de Seniority. Nota: la barra apareció sin color en el primer intento — la caché de dependencias pre-empaquetadas de Vite (`frontend/node_modules/.vite`) tenía la versión vieja de `@tuya-ui/components`; se resolvió borrando esa caché y reiniciando el dev server (además del borrado de caché de pnpm ya documentado para este flujo).
- [x] 6.3 Re-verificar en el navegador contra el mockup una vez cerrados los ajustes de fidelidad (grupo 5). Verificado midiendo estilos computados: métrica 40px/700/-1.6px (`text-metric`), leyenda en 2 columnas, barra con `gap: 4px` y segmentos `rounded-pill`, progress con el degradado de marca, y las tres cards con altura idéntica (143px), que confirma el `mt-auto`. Suite: 314/315, con las 2 fallas preexistentes de siempre (`App.test.tsx`, `httpClient.test.ts`).

  **Bloqueo encontrado y resuelto**: `text-metric` no se aplicaba pese a estar en el marcado. Causa: el `tailwind.config.js` del frontend **no usa el preset de tuip** — consume el `styles.css` ya construido, que tuip genera escaneando solo su propio `src`. Como ningún componente de tuip usa `text-display`, `text-heading-lg`, `text-heading-md` ni `text-metric`, las cuatro se purgaban antes de publicarse. Se resolvió agregando la escala al `safelist` de tuip (tarea 1.5 de `add-metric-text-style-and-bar-options`), que ya existía justamente para este caso. **Efecto colateral valioso**: el título "Personas" llevaba renderizando a 16px/400 en vez de 24px/600 por este mismo motivo, y quedó reparado.
