## 1. Componente

- [x] 1.1 `progress.tsx`: cambiar `SegmentedBarSegment` a una unión discriminada — `{ value: number; label?: string; role: SegmentedBarRole; color?: never }` | `{ value: number; label?: string; role?: never; color: CategoricalColor }` — importando `CategoricalColor` desde `@/lib/categorical-color`.
- [x] 1.2 Declarar `categoricalColorClasses: Record<CategoricalColor, string>` con las mismas seis clases `bg-*-bold` que `avatar.tsx` (`gray→bg-neutral-bold`, `green→bg-success-bold`, `blue→bg-info-bold`, `amber→bg-warning-bold`, `red→bg-danger-bold`, `purple→bg-discovery-bold`).
- [x] 1.3 En `SegmentedBar`, resolver la clase de color de cada segmento: `segment.color ? categoricalColorClasses[segment.color] : roleClasses[segment.role]`.
- [x] 1.4 Actualizar el comentario JSDoc de `SegmentedBar` (hoy dice "nunca una paleta categórica arbitraria") para reflejar que ahora sí soporta color categórico, además del rol de estado.

## 2. Documentación

- [x] 2.1 Agregar un ejemplo en `apps/docs/src/examples/progress/` (ej. `04-barra-segmentada-categorica.tsx`) mostrando segmentos con `color` en vez de `role`, siguiendo el mismo patrón que `03-barra-segmentada.tsx`.
- [x] 2.2 Referenciar el nuevo ejemplo en `apps/docs/src/content/progress.tsx`. Los ejemplos se descubren automáticamente por carpeta (`examples/load.ts`, glob), sin índice manual — en su lugar se corrigió el texto de `whenToUse`/`whenNotToUse`, que afirmaba que SegmentedBar solo admite los 4 roles de estado (ya no es cierto) y no mencionaba `color`.

## 3. Verificación

- [x] 3.1 `pnpm --filter @tuya-ui/components build` (o el comando de tipos del paquete) sin errores — confirma que la unión discriminada rechaza pasar `role` y `color` a la vez. Build completo OK (tsup ESM/CJS + DTS sin errores de tipos).
- [x] 3.2 Ver ambos ejemplos (rol de estado y color categórico) en el dev server de docs y confirmar visualmente los seis tonos categóricos. Verificado en `/components/progress`: el ejemplo nuevo muestra 4 segmentos (gris/ámbar/azul/morado) correctamente, y el texto "Cuándo usarlo/no usarlo" quedó actualizado.
- [x] 3.3 `pnpm run publish:local` desde la raíz de `tuip`, para que `app-gestion-capacidad/frontend` pueda consumir la nueva versión cuando se retome `add-people-dashboard-cards`. Empaquetado OK en `.local-packages/tuya-ui-components-0.1.0.tgz`.
