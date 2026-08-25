## 1. Dependencias

- [x] 1.1 Agregar `@radix-ui/react-select`, `@radix-ui/react-popover` y `cmdk` a `packages/components/package.json`
- [x] 1.2 Verificar que el monorepo instala y compila con las dependencias nuevas

## 2. Componente Select

- [x] 2.1 Construir `Select` sobre `@radix-ui/react-select`: trigger, contenido, viewport y opciones, estilados con tokens
- [x] 2.2 Variantes de tamaño consistentes con las de Input (altura de `size.control`)
- [x] 2.3 Estado de carga dentro del desplegable para opciones asíncronas, en vez de un desplegable vacío
- [x] 2.4 Estado deshabilitado y estado de error, con el mismo tratamiento visual que Input
- [x] 2.5 Verificar navegación por teclado: apertura con Enter/Espacio/flecha, recorrido con flechas, confirmación con Enter, cierre con Escape devolviendo el foco al trigger
- [x] 2.6 Declarar props públicas con tipos explícitos y descripciones para la tabla de API derivada

## 3. Componente Combobox

- [x] 3.1 Construir `Combobox` sobre `@radix-ui/react-popover` para el trigger y el posicionamiento, y `cmdk` para la lista filtrable
- [x] 3.2 Filtrado en vivo mientras se escribe, sin exigir coincidencia exacta
- [x] 3.3 Modo de selección múltiple: opciones elegidas como elementos removibles dentro del campo
- [x] 3.4 Estado sin resultados, explícito
- [x] 3.5 Estado de carga para opciones asíncronas, igual que Select
- [x] 3.6 Verificar navegación por teclado: tipeo filtra, flechas recorren el resultado filtrado, Enter confirma, Escape cierra sin perder lo escrito hasta ese momento, Backspace sobre un chip vacío quita el último elegido
- [x] 3.7 Declarar props públicas con tipos explícitos y descripciones

## 4. Registro

- [x] 4.1 Añadir las entradas `select` y `combobox` a `definitions.ts`, categoría `forms`, con sus `npmDependencies` declaradas
- [x] 4.2 Regenerar `registry.json` y confirmar que el peso, la tabla de props y el código fuente mostrados en el sitio son correctos para ambos

## 5. Documentación del componente

- [x] 5.1 Escribir `content/select.ts`: guía de uso con el umbral de 7 a 20 opciones y la referencia a radios por debajo y a Combobox por encima; anatomía; notas de accesibilidad con los valores concretos de ARIA que aplica Radix Select
- [x] 5.2 Escribir `content/combobox.ts`: guía de uso con el umbral de más de 20 opciones y la referencia a Select por debajo; anatomía; notas de accesibilidad
- [x] 5.3 Escribir los ejemplos en vivo de `examples/select/*.tsx`: tamaños, estado de carga, deshabilitado, con error
- [x] 5.4 Escribir los ejemplos en vivo de `examples/combobox/*.tsx`: selección simple, selección múltiple con chips, sin resultados
- [x] 5.5 Registrar ambos módulos de contenido en `content/index.ts`

## 6. Cierre (implementación original)

- [x] 6.1 Recorrer los escenarios de `specs/component-library/spec.md` en el sitio corriendo y confirmar que se cumplen
- [x] 6.2 Verificar con teclado el ciclo completo de Select y de Combobox, incluida la devolución de foco al cerrar
- [x] 6.3 Confirmar que ningún estilo de Select ni de Combobox usa un valor fuera de los tokens del sistema
- [x] 6.4 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde

## 7. Vocabulario de madurez

- [x] 7.1 Cambiar `ComponentStatus` de `"estable" | "beta"` a `"stable" | "beta"` en `packages/components/registry/definitions.ts`, y actualizar las seis entradas del registro (Button, Input, Card, Badge a `"stable"`; Select y Combobox a `"stable"`)
- [x] 7.2 Espejar el mismo tipo en `apps/docs/src/data/registry.ts`
- [x] 7.3 Actualizar `STATUS_CLASSES` en `apps/docs/src/components/ComponentChips.tsx` para indexar por `"stable"` en vez de `"estable"`
- [x] 7.4 Buscar `"estable"` en `apps/docs/src` y `packages/components` y confirmar que no queda ninguna aparición del valor viejo
- [x] 7.5 Regenerar `registry.json` y confirmar que los seis componentes leen `stable` donde corresponde

## 8. Cierre (vocabulario)

- [x] 8.1 Recorrer el sitio corriendo y confirmar que el chip de estado de cada uno de los seis componentes muestra `stable` o `beta`, sin insignia `beta` en los cuatro que ya eran estables
- [x] 8.2 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
