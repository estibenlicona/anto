## Why

El sitio de documentación actual documenta bien los componentes, pero no documenta el sistema: no explica cómo instalar tuip, qué hace cada comando del CLI, dónde queda el código copiado, ni cuáles son las decisiones de tipografía, color y espaciado que sostienen los componentes. Un desarrollador que llega por primera vez encuentra un catálogo, no una plataforma.

El mockup `mockup/Docs TUIP.html` resuelve eso con una estructura de tres columnas más densa (topbar de navegación global, sidebar plano, rail "En esta página"), páginas de fundamentos y de CLI, y un tratamiento editorial de las páginas de componente —lienzo de ejemplo con pie descriptivo, callouts de regla, chips de instalación/peso/estado— que convierte la referencia en guía. Este change alinea el sitio con ese mockup.

## What Changes

**Shell y navegación**

- Topbar ampliado: marca `tuip` con logotipo y versión del paquete, campo de búsqueda inline (en vez de un botón), y enlaces de navegación global a las áreas del sitio.
- **BREAKING** Sidebar de tres niveles: secciones como encabezados en versalitas no interactivos; dentro de Componentes, un nivel de grupos de categoría plegables; y las páginas como ítems. Se retiran los desplegables de las secciones de primer nivel y los sub-ítems de ejemplos bajo el componente activo. El ítem activo se marca con riel de color de marca, fondo y peso. Los ítems pueden llevar una insignia corta (`core`, `beta`).
- Las categorías de componentes llegan contraídas, salvo la que contiene la página actual. Los tres niveles se distinguen por sangría y tipografía, no solo por color.
- Rail derecho "En esta página" con el índice de secciones de la página.
- Pager Anterior / Siguiente al pie de cada página, siguiendo el orden lineal de la navegación.
- Encabezado de página unificado: breadcrumb `sección / página`, título grande y lede.
- Al cambiar de página, la nueva se abre desde su inicio en vez de conservar el desplazamiento de la anterior.

**Páginas nuevas**

- Sección Empezar: Instalación, CLI tuip, Anatomía de un proyecto.
- Sección Fundamentos: Tipografía, Color y tokens, Espaciado — en reemplazo de la página única de tokens actual.

**Páginas de componente**

- Cabecera con chip de comando de instalación copiable, chip de peso del componente y chip de estado (`estable` / `beta`).
- Pestañas renombradas y reordenadas: Uso, Anatomía, API, Código, Accesibilidad. Uso reúne los ejemplos y la guía de cuándo no usar el componente; Anatomía documenta medidas, estados y foco; API es la tabla de props; Código conserva el archivo fuente completo.
- Ejemplos presentados sobre un lienzo con retícula punteada y un pie que describe qué varía en el ejemplo.
- Notas de accesibilidad en forma de tabla (aspecto / valor / explicación).

**Contenido**

- Callouts de color como primitiva de contenido reutilizable, con tono semántico (informativo, precaución, riesgo) para reglas de uso.

**Removals**

- **BREAKING** Se retira el modo oscuro: el sitio adopta un único tema claro y desaparecen el selector de tema del topbar y la persistencia de la elección.
- **BREAKING** Se retiran del sidebar los desplegables de sección de primer nivel y los sub-ítems de ejemplos por componente. El despliegue se conserva únicamente en las categorías de componentes.
- **BREAKING** Se retira la página de catálogo de componentes y su ruta: el sidebar agrupado pasa a ser el único índice del catálogo. El enlace del header y el acceso de la página de inicio llevan a la documentación de un componente. Se pierde la vista previa en vivo por entrada, que no se reemplaza.

## Capabilities

### New Capabilities

Ninguna. Todo el alcance vive dentro de la capacidad existente del sitio de documentación.

### Modified Capabilities

- `docs-site`: cambia la estructura de navegación (sidebar plano, topbar con navegación global y búsqueda inline, rail de página, pager); se añaden páginas de Empezar y se divide Fundamentos en tres páginas; cambia la organización y el contenido de la página de componente (chips de metadatos, nuevas pestañas, lienzo de ejemplo, tabla de accesibilidad); se elimina el selector de tema claro/oscuro y el modo oscuro.

## Impact

- `apps/docs/src/components/`: `Header`, `Sidebar`, `Layout`, `PageToc`, `Tabs`, `ExampleBlock`, `AccessibilityNotesView`; se retiran `ThemeToggle` y el proveedor de tema; el `Layout` gana la restauración de scroll al cambiar de ruta.
- `apps/docs/src/pages/`: `Home`, `ComponentDetail`; se retiran `Tokens` (se divide en tres páginas de fundamentos) y `Catalog`; páginas nuevas para Instalación, CLI, anatomía de proyecto, tipografía, color y espaciado.
- `apps/docs/src/data/navigation.ts`: modelo de navegación en árbol —secciones, grupos de categoría dentro de Componentes, e ítems con insignia— del que se derivan el sidebar, el orden lineal del pager y el índice de la búsqueda.
- `apps/docs/src/content/`: nuevo contenido de anatomía y notas de accesibilidad tabulares por componente; contenido de las páginas de fundamentos y de CLI.
- `apps/docs/tailwind.config.js` e `index.css`: se retira la variante oscura.
- `packages/components`: sin cambios. El sistema de tokens (`packages/tokens`) se consume tal como está; solo cambia qué tokens usa el sitio.
