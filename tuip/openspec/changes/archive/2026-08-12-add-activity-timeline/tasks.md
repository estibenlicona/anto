## 1. Componente

- [x] 1.1 Crear `packages/components/src/activity-timeline.tsx`: `ActivityTimeline` (`<ol>`, `children`, `className?`) y `ActivityTimelineItem` (`<li>`).
- [x] 1.2 `ActivityTimelineItem` props: `actor` (nodo, renderizado en negrita), `action` (nodo, regular, en la misma línea que `actor`), `detail?` (nodo, línea secundaria muted), `timestamp` (nodo, alineado a la derecha), `variant?` ("success" | "info" | "warning" | "danger" | "neutral" | "discovery", default "neutral") — cada prop con JSDoc. El tipo de `variant` se declaró local (`ActivityTimelineVariant`) en vez de importar `BadgeVariant` de `badge.tsx`: el registro no declara `badge` como dependencia, y un import entre archivos que el CLI no copia juntos rompería en el proyecto consumidor.
- [x] 1.3 Punto de color: mismo mapeo que `dotClasses` de `badge.tsx` (`bg-{role}-bold`, `neutral` con `bg-current text-neutral-subtle`) — sin declarar ningún token nuevo.
- [x] 1.4 Línea de conexión: segmento vertical entre el punto de una entrada y la siguiente, suprimido en la última entrada vía `group-last:hidden` (el `<li>` lleva `group`, sin lógica de posición en React).
- [x] 1.5 `ActivityTimeline.displayName`, `ActivityTimelineItem.displayName` asignados.

## 2. Registro

- [x] 2.1 Agregar entrada `activity-timeline` al registro: categoría `feedback`, `status: "stable"`, `npmDependencies: ["react"]`, `dependencies: ["utils"]`.
- [x] 2.2 Agregar `export * from "./activity-timeline"` a `packages/components/src/index.ts`.
- [x] 2.3 Ejecutar `pnpm --filter @tuya-ui/components build` para regenerar `registry.json` y confirmar que el componente extrae props, peso y código fuente correctamente. 32 componentes, `activity-timeline: 2 exported component(s), 5 own prop(s)`.

## 3. Documentación

- [x] 3.1 Crear `apps/docs/src/content/activity-timeline.tsx` (uso, anatomía, accesibilidad), incluyendo la guía de que `actor`/`action` son props separadas y no texto libre, y que el componente no trae superficie propia.
- [x] 3.2 Crear ejemplos en vivo en `apps/docs/src/examples/activity-timeline/*.tsx`: la traza de aprobación completa de la captura (las cuatro entradas, cuatro `variant` distintos), montada dentro de un `Card` para mostrar que no compite con la superficie del contenedor.
- [x] 3.3 Registrar `activityTimelineContent` en `apps/docs/src/content/index.ts` con la clave `"activity-timeline"`.

## 4. Cierre

- [x] 4.1 Levantar el sitio de docs y verificar visualmente: orden actor→acción con el actor distinguible tipográficamente, línea de conexión presente entre entradas y ausente después de la última, detalle opcional sin dejar hueco cuando falta. Verificado con capturas: la figura de anatomía confirma que sin Card detrás no hay ninguna superficie propia (se ve el patrón punteado del Canvas), la traza de 4 entradas muestra la línea de conexión ausente después de J. Betancur (la última), y el par de estados "Con detalle"/"Sin detalle" muestra la segunda entrada visiblemente más baja, sin hueco.
- [x] 4.2 Grep rápido de valores hex/px sueltos en `activity-timeline.tsx`. Sin coincidencias.
- [x] 4.3 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en la raíz del monorepo y dejar los tres en verde.
