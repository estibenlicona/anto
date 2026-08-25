## 1. Modal y Drawer

- [x] 1.1 En `packages/components/src/modal.tsx`, sumar `border border-neutral-default` al panel. Son dos clases: el ancho y el color — sin la primera el borde no se dibuja.
- [x] 1.2 Lo mismo en el panel de `packages/components/src/drawer.tsx`.
- [x] 1.3 Anotar en uno de los dos por qué lo llevan y Tooltip y Toast no: la distinción es la superficie del panel, clara contra oscura, no el hecho de ser una superposición.
- [x] 1.4 Confirmar que la sombra de ambos queda intacta: delimitar y elevar son cosas distintas y el cambio sólo agrega lo primero.
- [x] 1.5 Revisar que el borde nuevo no se pise con el `border-t` del pie del Modal ni con ningún borde interno del Drawer.

## 2. Documentación

- [x] 2.1 Revisar las páginas de Modal y Drawer en `apps/docs` y actualizar lo que describa la superficie del panel.

## 3. Reconstrucción y propagación

- [x] 3.1 Reconstruir `@tuya-ui/components`.
- [x] 3.2 Empaquetar con `pnpm pack`.
- [x] 3.3 Reinstalar el `.tgz` en `frontend` y limpiar la caché de Vite.
- [x] 3.4 Antes de verificar, confirmar que no quedó más de un dev server escuchando: si hay uno viejo ocupando el puerto, el nuevo toma otro y se termina mirando el bundle anterior. Ya pasó.

## 4. Verificación

- [x] 4.1 Abrir un Modal y confirmar que su contorno se ve por los cuatro lados, en particular **arriba**, que es donde la sombra no llega y donde se notaba el hueco.
- [x] 4.2 Abrir un Drawer y confirmar lo mismo en su lado expuesto.
- [x] 4.3 Comparar el panel de un Modal con el de un Select o un Popover abiertos: tienen que dibujar el mismo trazo. Es la verificación que importa, porque el objetivo es consistencia.
- [x] 4.4 Confirmar que Tooltip y Toast siguen sin borde.
- [x] 4.5 Comprobarlo en modo oscuro, donde el trazo queda en 1.64:1 contra el panel — presente pero tenue.
- [x] 4.6 En `frontend`, abrir el modal de "Editar datos de las bandas" y confirmar que el borde llegó. Es el caso concreto que originó el pedido.
- [x] 4.7 Mostrar el resultado y confirmar que es lo que se buscaba. El cambio nace de una observación visual, así que la última palabra no es una medición.
