## 1. Paleta de color

- [x] 1.1 Reescribir las escalas primitivas de `packages/tokens/src/primitives.ts` con los valores de la definición: marca Tuya Red, neutros fríos con el paso `25` nuevo, y las familias semánticas
- [x] 1.2 Añadir la familia primitiva `info`, que hoy no existe
- [x] 1.3 Reasignar los semánticos de `semantic-colors.ts` a los primitivos nuevos, conservando los nombres de rol y variante actuales, y añadir el rol `info`
- [x] 1.4 Reescribir los valores de modo oscuro según la definición: superficies que se distinguen por claridad, acentos aclarados y texto que no llega al blanco puro
- [x] 1.5 Verificar que el sitio y los componentes siguen compilando con los valores nuevos y los nombres viejos

## 2. Verificación de contraste

- [x] 2.1 Extender la lista de pares de `scripts/verify-tokens.ts` con las combinaciones que introduce la paleta nueva, incluido el rol `info`
- [x] 2.2 Correr la verificación y dejar la paleta en verde; si un par no alcanza el mínimo, ajustar el valor antes de seguir
- [x] 2.3 Comprobar en particular los pares de `warning`, que en la paleta anterior quedaban por debajo del mínimo sobre su propio tinte

## 3. Nomenclatura

- [x] 3.1 Cambiar `cssVarName` y `flattenTokens` para que reciban el prefijo según la capa, emitiendo `--tuya-*` en primitivas y `--color-*` en semánticas
- [x] 3.2 Abreviar `background` a `bg` en la emisión, conservando `background` como nombre del modelo TypeScript
- [x] 3.3 Actualizar el preset de Tailwind a los nombres nuevos
- [x] 3.4 Traducir los cuatro componentes de `packages/components` a los tokens renombrados
- [x] 3.5 Traducir el sitio de documentación a los tokens renombrados
- [x] 3.6 Buscar en todo el repositorio los nombres retirados y confirmar que no queda ninguno

## 4. Tipografía

- [x] 4.1 Incorporar IBM Plex Sans e IBM Plex Mono auto-hospedadas en el sitio, con sus declaraciones de `@font-face`
- [x] 4.2 Cambiar las familias de `typography.ts` y declarar el respaldo del sistema
- [x] 4.3 Reemplazar la escala de encabezados por los siete estilos de la definición, con sus tamaños, interlineados y pesos
- [x] 4.4 Añadir el tratamiento de cifras tabulares para datos de negocio
- [x] 4.5 Traducir por rol cada uso de un token `heading.*` en los componentes y en el sitio, y anotar los que no tengan equivalente exacto
- [x] 4.6 Documentar en la página de instalación que el proyecto anfitrión debe servir las familias
- [x] 4.7 Cerrar la escala reemplazando el tema de tamaños de Tailwind en vez de extenderlo, y migrar el sitio y los componentes a los siete estilos

## 5. Espaciado, layout y forma

- [x] 5.1 Reexpresar la escala de espaciado como `100`–`900` y añadir los nueve alias semánticos
- [x] 5.2 Exponer los alias en el preset de Tailwind como la forma normal de espaciar
- [x] 5.3 Cambiar los radios a los de la definición: controles, superficies y pill
- [x] 5.4 Crear el módulo de layout con las alturas de control, los anchos máximos por tipo de contenido, las capas de superposición y los puntos de quiebre
- [x] 5.5 Añadir el token de anillo de foco —grosor, separación y color— al módulo de borde
- [x] 5.6 Alinear los tokens de motion a las duraciones y la curva de la definición

## 6. Iconografía

- [x] 6.1 Extraer los `<svg>` del documento de iconografía y emparejar cada dibujo con su nombre de la librería, reportando los que queden sin pareja en vez de asumir el orden
- [x] 6.2 Revisar el emparejamiento icono por icono contra el documento
- [x] 6.3 Generar el mapa de trazos como archivo propio, separado del componente
- [x] 6.4 Crear el componente `Icon` con los tamaños admitidos, herencia de `currentColor` y el comportamiento de accesibilidad —oculto cuando es decorativo, etiquetado cuando es la única etiqueta del control
- [x] 6.5 Registrar `Icon` como entrada del registro con el mapa de trazos como dependencia interna, y verificar cómo queda su peso en la documentación

## 7. Páginas de fundamentos

- [x] 7.1 Reescribir la página de color: paleta de marca separada de las semánticas, valores de modo oscuro con su explicación, y la regla de escasez del color de marca como nota destacada
- [x] 7.2 Reescribir la página de tipografía sobre la escala de siete estilos, con las familias y el uso previsto de cada estilo
- [x] 7.3 Reescribir la página de espaciado como espaciado y layout: alias con la relación que expresa cada uno, anatomía de página, puntos de quiebre, alturas de control, anchos máximos y capas
- [x] 7.4 Añadir la regla de pertenencia del espacio como nota destacada
- [x] 7.5 Confirmar que cada valor mostrado en las tres páginas se lee del paquete de tokens y no está transcrito

## 8. Página de iconografía

- [x] 8.1 Crear la página con la librería agrupada por familia, mostrando el nombre junto al dibujo de cada icono
- [x] 8.2 Documentar la retícula, el grosor de trazo, los tamaños admitidos y su uso previsto
- [x] 8.3 Documentar el comportamiento de color y de accesibilidad del icono
- [x] 8.4 Documentar el método para incorporar un icono nuevo
- [x] 8.5 Registrar la ruta y publicar el índice de secciones al rail

## 9. Cierre

- [x] 9.1 Recorrer cada escenario de `specs/` en el sitio corriendo y confirmar que se cumple
- [x] 9.2 Confirmar que el requisito de identidad visual del sitio pasa a ser cierto: los colores y la tipografía visibles son los de Tuya
- [x] 9.3 Verificar con teclado el foco visible en todo control, con el anillo definido por el token nuevo
- [x] 9.4 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
