---
"@tuya-ui/components": minor
---

Enlace de texto con tono parametrizable.

- **`Link`** (nuevo, beta): el hipervínculo de texto que faltaba en el catálogo. Renderiza un ancla real, así que el foco por teclado, el menú contextual del navegador y la apertura en otra pestaña funcionan solos, sin que el componente los reimplemente.

  **`tone` es la opción que motiva la pieza**: `brand` (por defecto) es el enlace que quiere destacarse, y `neutral` toma el color de texto de la superficie, para el enlace que se repite fila a fila en una tabla y con el color de marca terminaría tiñendo la columna entera. El anillo de foco se deriva del tono elegido: un enlace neutro no muestra un foco de marca.

  **El tono neutro no se distingue en reposo.** El subrayado —que en los dos tonos aparece sólo en hover y en foco— es la única señal que tiene, y en un dispositivo táctil no hay hover que lo revele. Es una contrapartida deliberada, no un descuido: se elige a sabiendas. Lo que no se pierde es la vía asistida, porque sigue siendo un ancla y un lector de pantalla lo anuncia como enlace igual.

  **`asChild`** cede la etiqueta al hijo, para aplicar el estilo del sistema sobre el componente de enlace de un router sin anidar dos anclas. `Link` no conoce ningún router.

- **No confundir con `Button variant="link"`**, que no cambia: ése es un botón que se parece a un enlace, para una acción que no navega. `Link` navega; `Button variant="link"` ejecuta.

- **`@radix-ui/react-slot`** pasa a ser dependencia directa del paquete, para resolver `asChild`. Ya viajaba como transitiva de los demás paquetes de Radix que el catálogo usa, así que no agrega nada al árbol instalado.

**Actualizar es seguro**: la adición es puramente aditiva. Ninguna pieza existente cambia de comportamiento ni de aspecto, así que subir la versión no mueve nada de lo que ya se consume.
