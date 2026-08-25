## 1. Metadatos del registro

- [x] 1.1 Añadir `status: "estable" | "beta"` a `ComponentDefinition` en `packages/components/registry/definitions.ts` y declararlo en cada componente existente
- [x] 1.2 Calcular `bytes` en `packages/components/registry/generate.ts` sumando el tamaño del contenido de los archivos del componente y de sus dependencias internas, y emitirlo en cada entrada de `registry.json`
- [x] 1.3 Extender `RegistryComponent` en `apps/docs/src/data/registry.ts` con `status` y `bytes`, y añadir un helper que formatee el peso para mostrar
- [x] 1.4 Regenerar `registry.json` y verificar que el sitio actual sigue compilando

## 2. Modelo de navegación

- [x] 2.1 Reescribir `apps/docs/src/data/navigation.ts` con secciones de ítems planos (`label`, `to`, `badge` opcional), sin `NavGroup` ni `componentName`
- [x] 2.2 Poblar la navegación con las secciones Empezar, Fundamentos y Componentes, incluyendo las rutas de las páginas nuevas y la insignia de estado de los componentes no estables
- [x] 2.3 Exportar el aplanamiento ordenado de la navegación y un helper que, dada una ruta, devuelva su sección, su página anterior y su siguiente
- [x] 2.4 Adaptar `SearchDialog` para que construya su índice desde el aplanamiento de la navegación

## 3. Shell del sitio

- [x] 3.1 Rehacer `Header`: logotipo y wordmark, versión leída del `package.json` del paquete de componentes, campo de búsqueda inline con el atajo visible, enlaces de navegación global y enlace al repositorio
- [x] 3.2 Rehacer `Sidebar`: encabezados de sección en versalitas no interactivos, ítems planos, insignias, y marca del ítem activo con riel de color de marca, fondo y peso
- [x] 3.3 Añadir el componente de encabezado de página (migas `sección / página`, título y lede) y adoptarlo en todas las páginas
- [x] 3.4 Añadir el componente de pager Anterior / Siguiente derivado del orden de navegación, con los extremos marcados como no disponibles
- [x] 3.5 Ajustar `Layout` a las tres columnas del mockup y verificar el comportamiento pegajoso del sidebar y del rail al desplazarse

## 4. Retiro del tema oscuro

- [x] 4.1 Declarar `data-theme="light"` en `<html>` en `apps/docs/index.html`
- [x] 4.2 Eliminar `ThemeToggle`, `ThemeProvider` y `useTheme`, y sus usos en `Header` y en `main.tsx`
- [x] 4.3 Fijar el resaltado de sintaxis de `CodeBlock` al tema claro y retirar la alternancia de tema
- [x] 4.4 Verificar que ninguna superficie del sitio queda con contraste insuficiente tras el retiro

## 5. Primitivas de contenido

- [x] 5.1 Crear el componente `Canvas`: marco, fondo de retícula punteada y pie descriptivo
- [x] 5.2 Crear el componente de nota destacada con tonos informativo, de precaución y de riesgo, cuyo título enuncia la condición sin depender del color
- [x] 5.3 Crear el componente de tabla de referencia (encabezado en versalitas, celdas monoespaciadas donde corresponda) reutilizable por props, banderas del CLI, escalas y accesibilidad
- [x] 5.4 Añadir la confirmación visual de copia a `CodeBlock` y unificar su presentación con la de los fragmentos de ejemplo

## 6. Página de componente

- [x] 6.1 Rehacer la cabecera con el chip de comando de instalación copiable, el chip de peso y el chip de estado
- [x] 6.2 Reestructurar las pestañas a Uso, Anatomía, API, Código y Accesibilidad, conservando el reflejo de la pestaña activa en la URL y la operación por teclado
- [x] 6.3 Fusionar los ejemplos y la guía de uso en la pestaña Uso
- [x] 6.4 Adaptar `ExampleBlock` para renderizar sobre `Canvas` con pie descriptivo, y añadir el pie a los ejemplos existentes
- [x] 6.5 Añadir el tipo `AnatomyContent` a `apps/docs/src/content/types.ts` (partes con sus medidas en tokens, y estados de interacción) y la pestaña que lo renderiza
- [x] 6.6 Redactar el contenido de anatomía de `button`, `input`, `card` y `badge`
- [x] 6.7 Cambiar `AccessibilityNotes` a filas de aspecto / valor / explicación y adaptar `AccessibilityNotesView` a la tabla de referencia
- [x] 6.8 Reescribir las notas de accesibilidad de los cuatro componentes al nuevo formato, con valores concretos de ARIA y de contraste

## 7. Sección Empezar

- [x] 7.1 Definir los tipos de contenido de las tres páginas nuevas en `apps/docs/src/content/`
- [x] 7.2 Redactar y publicar la página de Instalación (requisitos, comando de inicialización con su diálogo y salida, archivo de configuración explicado opción por opción, primer componente)
- [x] 7.3 Redactar y publicar la página de CLI, con un bloque por comando y la tabla de banderas globales, verificando cada comando y bandera contra `packages/cli`
- [x] 7.4 Redactar y publicar la página de Anatomía de un proyecto (árbol de carpetas resultante y distinción entre archivos editables y gestionados)
- [x] 7.5 Registrar las tres rutas y publicar el índice de secciones de cada página al rail

## 8. Sección Fundamentos

- [x] 8.1 Crear la página de Tipografía leyendo familias y escala desde `@tuya-ui/tokens`, con el uso previsto de cada paso
- [x] 8.2 Crear la página de Color y tokens leyendo la paleta base y las semánticas desde `@tuya-ui/tokens`, con el nombre del token junto a cada valor y la regla de uso del color de marca
- [x] 8.3 Crear la página de Espaciado leyendo la escala desde `@tuya-ui/tokens`, con la relación entre elementos que expresa cada alias
- [x] 8.4 Retirar la página `Tokens` y redirigir `/tokens` a la página de Color y tokens
- [x] 8.5 Registrar las tres rutas y publicar su índice de secciones al rail

## 9. Ajustes de navegación

- [x] 9.1 Pasar `navigation.ts` a un árbol con nivel de grupo de categoría dentro de Componentes, y adaptar el aplanamiento para que el orden del pager y el índice de búsqueda encadenen páginas ignorando los nodos de grupo
- [x] 9.2 Quitar la entrada "Todos los componentes", retirar la ruta `/components` y la página `Catalog`, y apuntar el enlace del header y el acceso de la página de inicio al primer componente derivado del orden de navegación
- [x] 9.3 Rehacer `Sidebar` con los grupos de categoría plegables, derivando su estado de la ruta actual y sin persistirlo
- [x] 9.4 Dar a los tres niveles del sidebar sangría y tratamiento tipográfico propios, de modo que la jerarquía se lea sin desplegar y sin depender del color
- [x] 9.5 Restaurar el scroll al tope en el `Layout` cuando cambia el `pathname`, sin disparar en cambios de `hash` ni de query string
- [x] 9.6 Escalonar la sangría de los cuatro niveles del sidebar y anclar el riel del ítem activo a su fila
- [x] 9.7 Retirar la transformación de mayúsculas de las etiquetas en `Sidebar`, `PageHeader` y `Pager`, y capitalizar el nombre del componente en el modelo de navegación
- [x] 9.8 Ordenar las categorías por su etiqueta mostrada y retirar el contador del encabezado de grupo

## 10. Cierre

- [ ] 10.1 Recorrer cada escenario de `specs/docs-site/spec.md` en el sitio corriendo y confirmar que se cumple
- [ ] 10.2 Verificar el sitio con teclado: atajo de búsqueda, recorrido de pestañas por flechas, despliegue de los grupos del sidebar por Enter y Espacio con su estado expuesto, y foco visible en todo control interactivo
- [x] 10.3 Ejecutar `pnpm lint` y `pnpm build` en el monorepo y dejar ambos en verde
