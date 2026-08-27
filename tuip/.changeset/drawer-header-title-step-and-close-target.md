---
"@tuya-ui/components": patch
---

`DrawerHeader` recupera el tamaño de su título, pone su eyebrow en el paso de rúbrica del sistema y le da al botón de cerrar un área de clic y un anillo de foco; `Drawer` deja de salirse de la pantalla en móvil.

- **Título en `text-heading-md`.** Igual que en `ModalHeader`: `text-lg` no existe en el preset y no emitía regla, así que el título heredaba el tamaño del cuerpo. Ahora usa el paso de título de card (18 / 26, semibold).
- **Eyebrow en `text-label`.** Era body-sm en mayúsculas con el tracking de fábrica de Tailwind, una rúbrica que no está en la escala. Pasa al paso de rúbrica del sistema (12 / 16, semibold, 0.09em), el mismo que la cabecera de columna de `Table` y el título de grupo de `Sidebar`.
- **Cerrar con caja de 32px.** Misma caja que `Modal` y las utilidades de `Navbar`: esquinas de control, fondo sutil al hover y anillo de foco de marca. Un margen negativo la centra con la primera línea del bloque de texto, así el glifo queda donde estaba.
- **Ancho máximo en móvil.** Los dos tamaños son fijos (480 / 720px); anclado a la derecha, el panel se salía por la izquierda en un teléfono. Ahora se topa en el ancho de la ventana, que es lo que el sistema documenta para los paneles laterales bajo 640px; desde ahí el tope no interviene.

No cambia ninguna prop.
