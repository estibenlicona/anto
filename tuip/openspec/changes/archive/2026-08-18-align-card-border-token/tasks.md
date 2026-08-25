## 1. Card

- [x] 1.1 En `packages/components/src/card.tsx`, cambiar el contorno de `Card` de `border-neutral-soft` a `border-neutral-default`.
- [x] 1.2 Cambiar al mismo token las divisiones de `CardHeader` y `CardFooter`. Van juntas por obligación: el requisito vigente exige que el trazo interno sea consistente con el del contorno, así que mover sólo uno deja a Card en incumplimiento.
- [x] 1.3 Actualizar el comentario del contorno, que hoy explica el trazo translúcido. Conservar lo que dice sobre el reparto entre trazo y sombra, que no cambia.
- [x] 1.4 Confirmar que la sombra sigue intacta.

## 2. Documentación

- [x] 2.1 En la anatomía de Card en `apps/docs`, actualizar el token si aparece nombrado.

## 3. Reconstrucción y propagación

- [x] 3.1 Reconstruir `@tuya-ui/components`.
- [x] 3.2 Empaquetar con `pnpm pack`.
- [x] 3.3 Reinstalar el `.tgz` en `frontend` y limpiar la caché de Vite.

## 4. Verificación

- [x] 4.1 Confirmar que Card y otro contenedor con borde —una Table sin `flush`, por ejemplo— dibujan ahora exactamente el mismo trazo. Compararlos entre sí es la verificación que importa; mirar Card sola no dice nada, porque el cambio es casi invisible.
- [x] 4.2 Confirmar que el contorno y las divisiones internas de Card siguen siendo el mismo trazo entre sí.
- [x] 4.3 Confirmar que `border-neutral-soft` sigue en uso en el botón `secondary`, para no dejar un token huérfano sin darse cuenta.
- [x] 4.4 Comprobarlo también en modo oscuro, donde `soft` es translúcido y `default` es opaco — es el único lugar donde su naturaleza distinta podría notarse.
- [x] 4.5 En `frontend`, confirmar que el cambio llegó.
