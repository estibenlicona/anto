## 1. Componente EmptyState

- [x] 1.1 Construir `EmptyState`: icono (32px, decorativo/`aria-hidden`), título (`<p>` semibold, sin forzar heading), descripción opcional, acción opcional — todo centrado, sin contenedor propio con borde ni fondo
- [x] 1.2 Declarar props públicas (`icon`, `title`, `description`, `action`) con tipos explícitos y descripciones para la tabla de API derivada
- [x] 1.3 Confirmar que ningún estilo del componente impone un ancho, borde o fondo que compita con el contenedor que lo aloja

## 2. Componente Skeleton

- [x] 2.1 Construir `Skeleton`: `animate-pulse bg-neutral-subtle rounded-control` como base, tamaño y forma completamente delegados a `className`
- [x] 2.2 Declarar la prop `className` (heredada) con descripción suficiente para que la tabla de API explique que ahí se controla tamaño y forma
- [x] 2.3 Verificar visualmente que `className="h-9 w-9 rounded-pill"` produce un círculo y `className="h-2.5 w-1/2"` produce una línea, sin CSS adicional

## 3. Registro

- [x] 3.1 Añadir las entradas `empty-state` y `skeleton` a `definitions.ts`, categoría `feedback`, `status: "stable"`
- [x] 3.2 Regenerar `registry.json` y confirmar que el peso, la tabla de props y el código fuente mostrados en el sitio son correctos para ambos

## 4. Documentación del componente

- [x] 4.1 Escribir `content/empty-state.tsx`: guía de uso con las tres situaciones (sin datos aún, sin resultados, sin permiso) y su icono/título/acción sugeridos; anatomía; notas de accesibilidad (icono decorativo, título sin heading forzado)
- [x] 4.2 Escribir `content/skeleton.tsx`: guía de uso con el umbral de 300ms para empezar a mostrarlo y de 10s para reemplazarlo por un mensaje con opción de cancelar; anatomía; notas de accesibilidad (cómo anunciar el estado de carga a tecnologías de asistencia, ya que el propio Skeleton no lleva rol vivo)
- [x] 4.3 Escribir los ejemplos en vivo de `examples/empty-state/*.tsx`: sin datos con acción de creación, sin resultados, sin permiso
- [x] 4.4 Escribir los ejemplos en vivo de `examples/skeleton/*.tsx`: fila estilo lista (avatar circular + dos líneas, como el mockup), grupo de líneas de texto
- [x] 4.5 Registrar ambos módulos de contenido en `content/index.ts`

## 5. Cierre

- [x] 5.1 Recorrer los escenarios de `specs/component-library/spec.md` (EmptyState y Skeleton) en el sitio corriendo y confirmar que se cumplen
- [x] 5.2 Confirmar que ningún estilo de EmptyState ni de Skeleton usa un valor fuera de los tokens del sistema
- [x] 5.3 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
