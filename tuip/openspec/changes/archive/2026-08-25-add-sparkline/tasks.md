## 1. El componente

- [x] 1.1 `packages/components/src/sparkline.tsx`: `points` (etiqueta + valor), `tone` para el último punto, `label` como nombre accesible, alto configurable con un valor por defecto.
- [x] 1.2 Escalar contra el mayor de la serie, con piso visible para el cero.
- [x] 1.3 `role="img"` con el nombre en el contenedor y barras `aria-hidden` con su `title`.
- [x] 1.4 Exportar desde `src/index.ts`.

## 2. La prueba

- [x] 2.1 Cubrir: una barra por punto en orden; alturas proporcionales al mayor; el último distinto de los anteriores en el tono elegido; el cero con altura mínima; un solo punto; serie vacía sin dibujar nada; y que el árbol de accesibilidad reciba un solo elemento con su nombre.

## 3. El catálogo

- [x] 3.1 Entrada en `registry/definitions.ts`.
- [x] 3.2 Contenido de documentación (`apps/docs/src/content/sparkline.tsx`) con cuándo usarlo, cuándo no, anatomía y props, más un ejemplo en `apps/docs/src/examples/sparkline/`.
- [x] 3.3 Registrar el contenido en el índice de la documentación.

## 4. Cierre

- [x] 4.1 `pnpm test` en `packages/components`: tipos, verificaciones y suite.
- [x] 4.2 `publish:local` y reinstalar en la aplicación de gestión de capacidad.
