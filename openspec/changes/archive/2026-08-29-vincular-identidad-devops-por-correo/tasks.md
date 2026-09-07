## 1. El contrato y el servicio

- [x] 1.1 Definir `DevOpsUserDto` en `personDetailService` (`id`, `displayName`, `email`, `avatarUrl | null`, `projects`, `teams`, `boards`) y `personDetailService.searchDevOpsUser(email)` contra `GET /devops/users?email=<correo>`, propagando el `404` para que el hook lo lea como "sin coincidencia".
- [x] 1.2 Quitar `devOpsCandidates` y `DevOpsCandidateDto` del DTO del detalle; dejar `linkDevOpsIdentity(personId, identityId)` como está, documentando que `identityId` es el identificador del usuario de Azure DevOps.
- [x] 1.3 Actualizar `PersonDetailAdapter`, sus pruebas y las fixtures de `components/detail/__test__/fixtures.ts` para que ninguna dependa de las candidatas.

## 2. El mock y las semillas

- [x] 2.1 Sembrar `DEVOPS_USERS` en `personDetail.seeds.ts`: un usuario cuyo correo es el UPN de la persona sin identidad (Camila), con proyectos, equipos, tableros e items de ejemplo; los usuarios que ya están vinculados (María, Carlos…) con su correo como `userName`; y borrar `CANDIDATE_IDENTITIES`.
- [x] 2.2 Agregar `GET /devops/users` al handler del detalle: busca por correo sin distinguir mayúsculas, responde el usuario o `404`, y `400` sin `email`.
- [x] 2.3 Cambiar el `POST /people/:id/devops-identity`: buscar el id entre los usuarios de DevOps, responder `404` si no existe, `409` con el nombre de la otra persona si ya está vinculado, y guardar la identidad con `userName = email`, `linkedAt` de hoy y los items de ese usuario (o cero).
- [x] 2.4 Dejar el `GET` del detalle sin `devOpsCandidates` y con `devOpsIdentity` en `null` para la persona sin identidad; `resetPersonDetailMock` reinicia también los usuarios de DevOps.
- [x] 2.5 Pruebas del handler: buscar por correo en mayúsculas responde el usuario; correo sin usuario `404`; sin parámetro `400`; vincular con un id de usuario `200` y el siguiente `GET` trae la identidad con `userName` = correo, fecha de hoy y sus items; id desconocido `404`; usuario ya vinculado `409`; y una historia del backlog excluida por identidad entra a la cola tras vincular.

## 3. La búsqueda y las reglas del drawer

- [x] 3.1 Crear `hooks/useDevOpsUserSearch.ts`: estado `idle | searching | found | notFound | error`, el usuario encontrado, el mensaje de error, `search(email)` y `reset()`; `404` pasa a `notFound`, cualquier otro fallo a `error` con mensaje.
- [x] 3.2 Crear `components/detail/linkDevOpsIdentityRules.ts` con las reglas puras: `hasEmailShape(text)` y `canLink(state)` (sólo con un usuario encontrado para el correo actual), más `initialsOf(displayName)` para el avatar sin imagen.
- [x] 3.3 Pruebas del hook (con el mock: encontrado, sin coincidencia, error) y de las reglas (correo vacío o sin `@`/dominio no busca; editar el correo tras un resultado deshabilita vincular).

## 4. El drawer y el indicador

- [x] 4.1 Crear `LinkDevOpsIdentityDrawer` (`Drawer` `sm`, `DrawerHeader` con el nombre de la persona como eyebrow, título "Vincular con Azure DevOps" y la nota de una identidad por persona; `DrawerBody` con el campo **Correo corporativo** prellenado con el UPN, **Buscar** con icono `search` y `Enter`; el resultado con avatar o iniciales, nombre, correo, identificador, badge "Coincide" y las tres listas de `Tag`; `Alert` de advertencia sin coincidencia y de peligro con reintento ante error; `DrawerFooter` con **Cancelar** y **Vincular** con icono `link`, habilitado sólo con `canLink`; `serverError` debajo del resultado).
- [x] 4.2 En `PersonDetailStatsCards`, renombrar la acción a "Vincular con Azure DevOps" con icono `link`, quitar la condición y el conteo de candidatas del pie del indicador.
- [x] 4.3 En `PersonDetailContainer`, montar el drawer con `key` en lugar del modal, pasarle la persona (nombre y UPN), `linking` y `serverError`; al confirmar, `linkIdentity(personId, user.id)`, y con éxito cerrar, `refreshAll()` y toast "Identidad vinculada"; el `409` se muestra dentro del drawer sin cerrarlo.
- [x] 4.4 Borrar `LinkDevOpsIdentityModal` y ajustar `usePersonDetailMutations` para que el mensaje del `409` sea el del servidor (nombra a la otra persona) y el del `404` diga que el usuario ya no existe en Azure DevOps.

## 5. Pruebas de la pantalla y cierre

- [x] 5.1 Pruebas del drawer montado, como `EditStacksDrawer.test.tsx`: abre con el correo prellenado y Vincular deshabilitado; tras buscar muestra nombre, identificador, proyectos, equipos y tableros y habilita Vincular; sin coincidencia muestra el aviso con el correo; editar el correo descarta el resultado; confirmar llama `onConfirm` con el id del usuario; `serverError` se ve y el drawer sigue abierto.
- [x] 5.2 Pruebas de `PersonDetailStatsCards`: sin identidad, el botón "Vincular con Azure DevOps" está habilitado aunque no haya nada más que la persona; con identidad, muestra los items.
- [x] 5.3 Prueba de `PersonDetailContainer`: vincular desde el indicador cierra el drawer, muestra el toast y el encabezado pasa a "DevOps vinculado" con la fecha en la ficha.
- [x] 5.4 Correr lint, prettier y la suite completa; verificar en `pnpm dev:mock` el flujo de punta a punta sobre Camila (buscar, vincular, ver los items y la historia en la cola del Backlog).
