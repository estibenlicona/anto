## 1. Iconos nuevos

- [x] 1.1 Dibujar `density-comfortable` en `design-system/Iconografia Tuya.dc.html`, sección "Datos y análisis", siguiendo el markup de celda existente (`<svg viewBox="0 0 24 24" ...><rect .../><path .../></svg><div>density-comfortable</div>`)
- [x] 1.2 Dibujar `density-compact` con el mismo patrón, en la misma sección
- [x] 1.3 Actualizar el encabezado de la sección de "Datos y análisis · 10" a "Datos y análisis · 12"
- [x] 1.4 Abrir el mockup renderizado y confirmar visualmente que ninguno de los dos iconos se confunde con `table`, `layout` ni `menu`, y que `density-compact` se lee con claridad junto a los demás en el tamaño de 16px — si no se lee, bajar a 4 filas en vez de 5 (ver design.md) antes de continuar
- [x] 1.5 Actualizar `expected` de la familia `data` de 10 a 12 en `packages/components/scripts/extract-icons.ts`
- [x] 1.6 Correr `pnpm --filter @tuya-ui/components extract:icons` y confirmar que `density-comfortable` y `density-compact` aparecen en `src/icons/paths.ts` dentro de la familia `data`, sin errores de conteo

## 2. Componente SegmentedControl

- [x] 2.1 Agregar `icon?: ReactNode` a `SegmentedControlOption`
- [x] 2.2 Cuando la opción trae `icon`, renderizar el icono en vez de `option.label`, y aplicar `option.label` como `aria-label` del `<input>` de esa opción
- [x] 2.3 Verificar que una opción sin `icon` sigue funcionando exactamente igual que antes (texto visible, sin `aria-label` extra)
- [x] 2.4 Declarar la prop `icon` con su tipo y descripción para la tabla de API derivada

## 3. Densidad de Table con iconos

- [x] 3.1 Actualizar `examples/segmented-control/01-densidad.tsx` para usar `icon={<Icon name="density-comfortable" />}` / `icon={<Icon name="density-compact" />}` en vez de los `label` de texto
- [x] 3.2 Actualizar `examples/table-toolbar/01-busqueda-y-densidad.tsx` de la misma forma
- [x] 3.3 Agregar a `content/segmented-control.tsx` la variante con icono en anatomía (o un estado adicional) y una nota de accesibilidad sobre el `aria-label`
- [x] 3.4 Actualizar `examples/table/03-integracion-completa.tsx` (el ejemplo de Table con filas reales) — quedó pendiente en la primera pasada, con el `SegmentedControl` todavía en texto

## 4. Cierre

- [x] 4.1 Regenerar `registry.json` y confirmar que la tabla de props de SegmentedControl incluye `icon`
- [x] 4.2 Recorrer en el sitio corriendo los escenarios de `specs/component-library/spec.md` (SegmentedControl): opción solo-icono con nombre accesible, estado seleccionado distinguible sin depender del propio icono
- [x] 4.3 Confirmar que ningún estilo nuevo usa un valor fuera de los tokens del sistema
- [x] 4.4 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
