## 1. Superficie del Sidebar

- [x] 1.1 En `packages/components/src/sidebar.tsx`, cambiar la superficie de la barra de `bg-neutral-subtlest` a `bg-neutral-default`.
- [x] 1.2 Anotar junto a ella que comparte token con la barra superior a propósito, y que eso es lo que hace que el shell se lea como una pieza — para que nadie lo "simplifique" a un blanco propio.
- [x] 1.3 Revisar si el Sidebar usa `subtlest` en algún otro lugar además de su superficie principal.

## 2. Ítem activo

- [x] 2.1 Cambiar el fondo del ítem activo de `bg-neutral-default` a `bg-neutral-selected`.
- [x] 2.2 Confirmar que conserva su riel y su peso de texto: son dos de las tres señales que el requisito exige.
- [x] 2.3 Anotar por qué no puede ser blanco: es el color de la barra, y un fondo que iguala a su superficie deja de ser señal.
- [x] 2.4 Revisar el hover del ítem activo, que hoy es `hover:opacity-80`. Sobre un fondo con tinte puede leerse distinto que sobre blanco.

## 3. Documentación

- [x] 3.1 Revisar la página de Sidebar en `apps/docs` y corregir lo que describa sus superficies o el fondo del ítem activo.
- [x] 3.2 Si la anatomía del componente lista sus superficies, actualizar los valores.

## 4. Reconstrucción y propagación

- [x] 4.1 Reconstruir `@tuya-ui/components`.
- [x] 4.2 Empaquetar con `pnpm pack`.
- [x] 4.3 Reinstalar el `.tgz` en `frontend` y limpiar la caché de Vite antes de levantarlo.

## 5. Verificación

- [x] 5.1 Confirmar que el Sidebar se distingue del área de contenido, y que su superficie es la misma que la de la barra superior — medir los dos valores, no mirarlos.
- [x] 5.2 Poner un ítem activo, uno en hover y uno en reposo a la vista al mismo tiempo y confirmar que se leen como **tres** estados distintos. Es el riesgo principal del cambio y no se verifica de a uno.
- [x] 5.3 Confirmar que el ítem activo conserva sus tres señales: riel, fondo y peso.
- [x] 5.4 Comprobar todo lo anterior en modo oscuro, donde `selected` es un rojo muy oscuro y la superficie del Sidebar también es oscura — es el caso donde más fácil se pierden entre sí.
- [x] 5.5 Confirmar que el texto del ítem activo sigue legible sobre su fondo nuevo, en los dos modos.
- [x] 5.6 En `frontend`, confirmar en el navegador que el cambio llegó.
- [x] 5.7 Mostrar el resultado y confirmar que se ve como se esperaba. Es un cambio de criterio visual; quien decide si quedó bien no es una medición.
