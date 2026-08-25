## 1. Props en el manifiesto

- [x] 1.1 Agregar `react-docgen-typescript` como dependencia de build de `packages/components`
- [x] 1.2 Documentar con comentarios de documentación las props propias de Button, Input, Card y Badge
- [x] 1.3 Declarar en `registry/definitions.ts` qué elemento HTML nativo extiende cada componente
- [x] 1.4 Extraer las props en `registry/generate.ts` filtrando las declaradas en `node_modules`, y emitir el campo `props` en cada entrada del manifiesto
- [x] 1.5 Hacer que el generador falle si un componente del registro no pudo analizarse, distinguiéndolo de un componente que legítimamente no tiene props propias
- [x] 1.6 Extender los tipos de `apps/docs/src/data/registry.ts` con el campo `props` y el elemento extendido

## 2. Ejemplos ejecutables

- [x] 2.1 Definir la convención de ejemplo (`export const meta` + export por defecto) y su tipo compartido
- [x] 2.2 Escribir los ejemplos de Button (variantes, estados)
- [x] 2.3 Escribir los ejemplos de Input (básico, con error, deshabilitado)
- [x] 2.4 Escribir los ejemplos de Card (composición de header, body y footer)
- [x] 2.5 Escribir los ejemplos de Badge (variantes)
- [x] 2.6 Cargar módulos y texto fuente con `import.meta.glob` (incluido `?raw`), ordenarlos por prefijo de archivo y recortar el `meta` del snippet mostrado
- [x] 2.7 Construir el componente que renderiza un ejemplo: título, descripción, render en vivo y snippet copiable con la misma presentación del visor de código

## 3. Contenido curado de uso y accesibilidad

- [x] 3.1 Definir el tipo del contenido de uso y accesibilidad, y el mapa por nombre de componente
- [x] 3.2 Escribir las guías de uso (cuándo usar, cuándo no, pares de recomendado/desaconsejado con justificación) de los 4 componentes
- [x] 3.3 Escribir las notas de accesibilidad (teclado, atributos ARIA, lector de pantalla) de los 4 componentes
- [x] 3.4 Implementar el estado "documentación pendiente" para componentes sin contenido cargado

## 4. Tipografía y base visual

- [x] 4.1 Exponer la escala `heading.*` como utilidades compuestas de `fontSize` en el preset de Tailwind
- [x] 4.2 Reemplazar en el sitio las combinaciones tipográficas sueltas por las clases de encabezado
- [x] 4.3 Refinar espaciado, densidad y jerarquía visual del layout y de las páginas

## 5. Rutas, página de inicio y catálogo

- [x] 5.1 Reestructurar las rutas: `/` inicio, `/components` catálogo, `/components/:name` detalle, `/tokens` tokens
- [x] 5.2 Construir la página de inicio (introducción al sistema, instalación del CLI, accesos al catálogo y a tokens)
- [x] 5.3 Actualizar el sidebar con las entradas de inicio y catálogo
- [x] 5.4 Rediseñar las tarjetas del catálogo para incluir la vista previa en vivo del ejemplo principal de cada componente

## 6. Página de detalle con pestañas

- [x] 6.1 Construir el componente de pestañas accesible (roles ARIA, `tabindex` móvil, navegación con flechas, Home y End)
- [x] 6.2 Sincronizar la pestaña activa con el parámetro de búsqueda de la URL, con caída a la pestaña de ejemplos si falta o no es válido
- [x] 6.3 Implementar la pestaña Ejemplos con la lista de ejemplos del componente
- [x] 6.4 Implementar la pestaña Código con el código fuente completo del componente
- [x] 6.5 Implementar la pestaña Props: tabla de props propias, nota del elemento HTML extendido, y estado para componentes sin props propias
- [x] 6.6 Implementar la pestaña Uso a partir del contenido curado
- [x] 6.7 Implementar la pestaña Accesibilidad a partir del contenido curado

## 7. Búsqueda

- [x] 7.1 Construir la búsqueda sobre el elemento `<dialog>` nativo abierto con `showModal()`
- [x] 7.2 Filtrar componentes y secciones de tokens por nombre, descripción y categoría, incluyendo el estado explícito de "sin resultados"
- [x] 7.3 Implementar la navegación por teclado dentro de los resultados (flechas y Enter) y el atajo global de apertura
- [x] 7.4 Integrar el disparador de búsqueda en el header

## 8. Índice de página

- [x] 8.1 Construir el componente de índice a partir de secciones declaradas, con resaltado de la sección visible mediante `IntersectionObserver`
- [x] 8.2 Declarar las secciones de la página de tokens y renderizar sus encabezados desde esa misma lista
- [x] 8.3 Ubicar el índice como columna derecha del layout, renderizándolo solo cuando la página declara secciones

## 9. Corrección de navegación pegajosa

- [x] 9.0 Hacer que el sidebar y el índice lateral permanezcan visibles al desplazar el contenido, con su propio scroll

## 10. Estados de interacción para el rol `danger`

- [x] 10.1 Agregar `background.danger.boldHover` y `background.danger.boldPressed` derivados de la escala primitiva `danger`
- [x] 10.2 Sumar las combinaciones nuevas a la verificación de contraste WCAG AA y confirmar que pasan

## 11. Button ampliado

- [x] 11.1 Agregar las variantes `subtle`, `danger` y `link` a Button, consumiendo tokens semánticos
- [x] 11.2 Agregar los tamaños `small`, `medium` y `large`
- [x] 11.3 Soportar ícono antes y después de la etiqueta, ocultándolo a tecnologías de asistencia
- [x] 11.4 Agregar el estado de carga: indicador visible, sin disparar clicks y comunicado por ARIA
- [x] 11.5 Documentar las props nuevas y regenerar el manifiesto
- [x] 11.6 Escribir ejemplos de las variantes, tamaños, íconos, carga y botón solo de ícono
- [x] 11.7 Actualizar las guías de uso de Button para cubrir las opciones nuevas

## 12. Selector de tema como panel de opciones

- [x] 12.1 Construir el panel de modo de color con radios nativos y miniatura de vista previa por modo
- [x] 12.2 Indicar el modo activo y cerrar el panel con Escape y con clic fuera
- [x] 12.3 Reemplazar el botón de alternancia del header por el nuevo control

## 13. Navegación por componente

- [x] 13.1 Desplegar en el sidebar los ejemplos del componente activo, manteniendo colapsados los demás
- [x] 13.2 Publicar los ejemplos como secciones del índice lateral en la página de detalle, solo con la pestaña de ejemplos activa
- [x] 13.3 Dar ancla y desplazamiento con margen a cada ejemplo para que ambos menús salten correctamente
- [x] 13.4 Agregar controles de despliegue/contracción por categoría y por componente en el sidebar, independientes del enlace de navegación
- [x] 13.5 Reestructurar el sidebar en secciones de primer nivel desplegables (Empezar, Fundamentos, Componentes) con encabezados de categoría estáticos y resaltado de item activo estilo Atlassian
- [x] 13.6 Actualizar el README con el flujo real de agregar un componente (props documentadas, ejemplos, contenido curado) y la estructura de tokens en dos capas

## 14. Verificación

- [x] 14.1 Verificar que la tabla de props de cada componente muestra sus props propias y ningún atributo DOM heredado
- [x] 14.2 Verificar que el snippet de cada ejemplo corresponde al código que produce su render
- [x] 14.3 Verificar la operación por teclado de pestañas y búsqueda, y que un enlace directo a una pestaña la abre activa
- [x] 14.4 Build de producción del monorepo completo sin errores de tipos ni de Tailwind
- [x] 14.5 Revisar el sitio en tema claro y en tema oscuro
