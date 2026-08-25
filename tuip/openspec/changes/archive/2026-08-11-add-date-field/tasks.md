## 1. Dependencias

- [x] 1.1 Agregar `react-day-picker` a `packages/components/package.json` (`@radix-ui/react-popover` ya está declarado por `combobox`)
- [x] 1.2 Verificar que el monorepo instala y compila con la dependencia nueva

## 2. Pieza compartida de calendario

- [x] 2.1 Construir el wrapper de calendario sobre `react-day-picker`, estilado con los tokens del sistema (color, tipografía, espaciado, radio)
- [x] 2.2 Soporte de límites (`minDate`/`maxDate`) que deshabilita los días fuera de rango sin ocultarlos
- [x] 2.3 Modo simple y modo rango de `react-day-picker` verificados sobre el mismo wrapper, sin duplicar la grilla de días

## 3. Componente DateField

- [x] 3.1 Construir `DateField` sobre `Input` (texto con formato ISO) más `@radix-ui/react-popover` para el calendario desplegable
- [x] 3.2 Entrada manual siempre operativa: el calendario nunca es la única vía de capturar la fecha
- [x] 3.3 Selección desde el calendario actualiza el texto en formato ISO y cierra el desplegable
- [x] 3.4 Estado de error igual al de Input cuando el texto escrito no es una fecha ISO válida
- [x] 3.5 Verificar navegación por teclado: apertura del calendario, recorrido de días con flechas, confirmación con Enter, cierre con Escape devolviendo el foco al campo
- [x] 3.6 Declarar props públicas con tipos explícitos y descripciones para la tabla de API derivada

## 4. Componente DateRangeField

- [x] 4.1 Construir `DateRangeField` sobre dos campos de texto ISO (inicio y fin) más el mismo calendario desplegable en modo rango
- [x] 4.2 Formato de lectura abreviado y localizado (ej. «28 jul – 8 ago») cuando el campo no está en edición
- [x] 4.3 Selección de inicio y fin desde el calendario actualiza ambos campos de texto en formato ISO
- [x] 4.4 Entrada manual de ambos extremos siempre operativa, sin depender del calendario
- [x] 4.5 Verificar navegación por teclado equivalente a DateField, incluida la selección del segundo extremo del rango
- [x] 4.6 Declarar props públicas con tipos explícitos y descripciones

## 5. Registro

- [x] 5.1 Añadir las entradas `date-field` y `date-range-field` a `definitions.ts`, categoría `forms`, con sus `npmDependencies` declaradas y `status: "stable"`
- [x] 5.2 Regenerar `registry.json` y confirmar que el peso, la tabla de props y el código fuente mostrados en el sitio son correctos para ambos

## 6. Documentación del componente

- [x] 6.1 Escribir `content/date-field.tsx`: guía de uso, anatomía y notas de accesibilidad con los valores concretos de ARIA que aplica el calendario
- [x] 6.2 Escribir `content/date-range-field.tsx`: guía de uso (cuándo un rango en vez de dos DateField sueltos), anatomía y notas de accesibilidad
- [x] 6.3 Escribir los ejemplos en vivo de `examples/date-field/*.tsx`: uso simple, con límites (`minDate`/`maxDate`), con error
- [x] 6.4 Escribir los ejemplos en vivo de `examples/date-range-field/*.tsx`: uso simple, con límites, en modo lectura con formato abreviado
- [x] 6.5 Registrar ambos módulos de contenido en `content/index.ts`

## 7. Cierre

- [x] 7.1 Recorrer los escenarios de `specs/component-library/spec.md` (DateField y DateRangeField) en el sitio corriendo y confirmar que se cumplen
- [x] 7.2 Verificar con teclado el ciclo completo de ambos componentes, incluida la devolución de foco al cerrar el calendario
- [x] 7.3 Confirmar que ningún estilo de DateField ni de DateRangeField usa un valor fuera de los tokens del sistema
- [x] 7.4 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
