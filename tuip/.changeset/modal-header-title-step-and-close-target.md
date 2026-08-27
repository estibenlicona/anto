---
"@tuya-ui/components": patch
---

`ModalHeader` recupera el tamaño de su título y le da al botón de cerrar un área de clic y un anillo de foco; `Modal` deja de desbordar en pantallas angostas.

- **Título en `text-heading-md`.** El preset de Tailwind reemplaza la escala de tamaños de fábrica, así que `text-lg` no emitía ninguna regla y el título heredaba el tamaño del cuerpo. Ahora usa el paso de título de card del sistema (18px / 26px, semibold), que es el que la anatomía documentada siempre describió.
- **Cerrar con caja de 32px.** El botón era el glifo desnudo de 20px, sin superficie al pasar el puntero ni anillo de foco visible al navegar con teclado. Toma la misma caja de icono que usan las utilidades de `Navbar`: 32×32, esquinas de control, fondo sutil al hover y anillo de foco de marca. Un margen negativo compensa la caja para que el glifo quede donde estaba; no se mueve nada más.
- **Ancho máximo en móvil.** Los tres tamaños son anchos fijos (480 / 640 / 880px) y el menor no entra en un teléfono. El panel ahora se topa en el ancho de la ventana menos 16px por lado; desde 640px ese tope no interviene y el desktop no cambia.

No cambia ninguna prop.
