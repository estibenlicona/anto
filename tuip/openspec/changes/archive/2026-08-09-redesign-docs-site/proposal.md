## Why

El sitio de documentación ya tiene identidad de marca, temas claro/oscuro y navegación header + sidebar, pero como documentación de componentes sigue siendo superficial: no dice qué props acepta cada componente, muestra un único preview genérico junto a un volcado del archivo fuente completo en vez de ejemplos enfocados, y no da ninguna orientación sobre cuándo usar cada componente ni cómo se comporta con teclado o lector de pantalla. Hoy, un desarrollador que quiere usar `Button` tiene que leer su código fuente para descubrir su API. Falta además lo que hace navegable a un sitio de documentación real: búsqueda, una página de inicio, y un índice dentro de cada página.

## What Changes

**Documentación por componente**
- Agregar una **tabla de props/API** por componente (nombre, tipo, valor por defecto, si es requerida, descripción), generada automáticamente a partir de los tipos TypeScript y sus comentarios de documentación.
- Reemplazar el preview único + volcado de código por **múltiples ejemplos enfocados**, cada uno con su título, su render en vivo y su propio snippet copiable que corresponde exactamente al código que se está renderizando.
- Agregar **guías de uso** por componente: cuándo usarlo, cuándo no, y pares de do's & don'ts.
- Agregar **notas de accesibilidad** por componente: comportamiento de teclado, roles ARIA y consideraciones de lectores de pantalla.
- Organizar todo eso en **pestañas** dentro de la página de detalle (Ejemplos / Props / Uso / Accesibilidad), enlazables por URL.

**Navegación y estructura**
- Agregar **búsqueda de componentes** accesible desde el header y por atajo de teclado.
- Agregar una **página de inicio** en `/` con introducción al sistema e instalación del CLI; el catálogo de componentes se mueve a su propia ruta. **BREAKING** (solo para enlaces guardados): la ruta `/` deja de mostrar el catálogo.
- Agregar un **índice lateral derecho** con las secciones de la página actual y resaltado de la sección visible.

**Presentación**
- Rediseñar las tarjetas del catálogo para incluir una **vista previa en vivo** del componente.
- Alinear la tipografía del sitio a los tokens `heading.*` ya definidos, y refinar espaciado, densidad y jerarquía visual.

**Contrato sobre los componentes**
- Exigir que las props públicas de cada componente estén documentadas, para que la tabla de props generada tenga descripciones y no solo tipos.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `docs-site`: se agregan requisitos de tabla de props por componente, ejemplos múltiples con snippet fiel al render, guías de uso, notas de accesibilidad, pestañas enlazables, búsqueda, página de inicio separada del catálogo, índice de página, y vista previa en vivo en las tarjetas del catálogo.
- `component-library`: se agrega el requisito de que las props públicas de cada componente estén documentadas de forma legible por herramientas, para alimentar la tabla de props del sitio.

## Impact

- **`apps/docs`**: cambios extensos — nuevas páginas (inicio, catálogo en su propia ruta), rediseño de la página de detalle con pestañas, nuevos componentes (búsqueda, índice de página, tabla de props, visor de ejemplos), nuevos módulos de contenido curado (guías de uso y accesibilidad por componente) y un directorio de ejemplos ejecutables por componente.
- **`packages/components`**: el generador del manifiesto extrae metadata de props desde los tipos TypeScript; las interfaces de props de los 4 componentes existentes reciben comentarios de documentación. El campo nuevo en el manifiesto es aditivo — el CLI lo ignora.
- **`packages/tokens`**: el preset de Tailwind expone la escala `heading.*` como utilidades. Es implementación de un requisito ya especificado en `design-tokens` (tokens de encabezado consumibles), no un cambio de comportamiento especificado.
- **Dependencias nuevas**: `react-docgen-typescript` como dependencia de build en `packages/components`.
- **Sin impacto** en el comportamiento del CLI ni en los componentes distribuidos a proyectos consumidores.
