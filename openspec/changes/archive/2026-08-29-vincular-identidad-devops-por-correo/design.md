## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **La vinculación ya existe, atada a las candidatas.** `PersonDetailStatsCards` pinta el indicador *Trabajo en DevOps* y su botón "Vincular identidad", deshabilitado cuando `detail.devOpsCandidates` viene vacío. `PersonDetailContainer` abre `LinkDevOpsIdentityModal` (un `Modal` con `RadioGroup` de candidatas) y llama `usePersonDetailMutations().linkIdentity(personId, identityId)`, que hace `POST /people/{id}/devops-identity { identityId }` y refresca el detalle. Ese armado —estado `open/key/error` en el contenedor, componente presentacional con `key` para remontarlo limpio, mutación en un hook— es el mismo de todos los paneles del detalle y se conserva.
- **El correo ya está en la persona.** `PersonDto.userPrincipalName` es obligatorio en el alta y es lo que el encabezado del detalle muestra en monoespaciada. Es la clave natural de la búsqueda.
- **El mock tiene dos consumidores de la identidad.** `personDetail.handlers.ts` guarda `identities[personId] = { id, userName, linkedAt, …items }` y `backlog.handlers.ts` resuelve la persona de cada historia por `userName` vía `getDevOpsIdentitiesSnapshot()`. Cualquier cambio en cómo se vincula tiene que dejar ese `userName` poblado, o las historias de una persona recién vinculada no entran a la cola (escenario ya exigido por `api-mocking`).
- **No hay backend de DevOps en este repo.** Ni `oas.json` ni el código .NET exponen nada de Azure DevOps; el servicio de búsqueda por correo que ya tiene el usuario vive fuera. La forma del contrato se decide acá y el mock la sirve.
- **El drawer del sistema de diseño.** tuip trae `Drawer` (`sm` 480 px / `lg` 720 px) con `DrawerHeader` (eyebrow, título, cierre), `DrawerBody` y `DrawerFooter`; `PersonFormDrawer` y `EditStacksDrawer` ya lo usan. El diseño aprobado del panel está en el lienzo *Vincular con Azure DevOps* (artifact `43790ac9`, página "Vincular con DevOps").
- **Decisiones ya tomadas con el usuario:** el contrato de búsqueda se define ahora; al vincular viaja sólo el identificador del usuario de DevOps; el alcance es frontend con mocks.

## Goals / Non-Goals

**Goals:**

- Que vincular una persona no dependa de que su nombre coincida con nada: el correo corporativo resuelve al usuario de DevOps.
- Que el Líder de Expertise vea *qué* va a vincular antes de hacerlo (nombre, correo, identificador, proyectos, equipos, tableros).
- Dejar escrito el contrato que el backend tendrá que honrar, y un mock que lo ejercita de punta a punta, incluido el efecto en la cola del Backlog.

**Non-Goals:**

- Implementar la búsqueda en el backend .NET.
- Desvincular, cambiar de identidad o vincular desde el listado.
- Mostrar proyectos, equipos y tableros en la ficha de una persona ya vinculada.

## Decisions

- **La búsqueda es un recurso propio: `GET /devops/users?email=<correo>`.** Es una consulta al directorio de Azure DevOps, no un estado de la persona, así que no cuelga de `/people/{id}`. Responde `{ id, displayName, email, avatarUrl, projects: string[], teams: string[], boards: string[] }` o `404`; `400` sin `email`. *Alternativa considerada:* `GET /people/{id}/devops-identity/candidates?email=` — se descartó porque el resultado no depende de la persona, y anidarlo obligaría al backend a validar una persona para responder una pregunta que no la necesita.
- **Vincular sigue enviando `{ identityId }`, y ese id es el del usuario de DevOps.** Es lo que el usuario decidió: el backend guarda la relación y resuelve el resto cuando lo necesite. El endpoint no cambia de ruta ni de forma, sólo de significado del id. En el mock, el `POST` busca el id entre los usuarios de DevOps sembrados (no entre candidatas), responde `409` si ya está vinculado a otra persona, y guarda `userName = email` del usuario para que el backlog lo resuelva.
- **Un `Drawer` `sm` reemplaza al `Modal`.** Un panel lateral es lo que el resto del detalle usa para editar (stacks, asignación) y el contenido —un campo, un resultado con tres listas de chips y dos acciones— cabe en 480 px sin encoger nada. `LinkDevOpsIdentityDrawer` sustituye a `LinkDevOpsIdentityModal`, con la misma interfaz hacia el contenedor: `open`, `onOpenChange`, `person` (nombre y correo), `linking`, `serverError`, `onConfirm(identityId)`. *Alternativa:* agrandar el modal a `md` — descartada porque el modal de tuip no encoge su cuerpo para scrollear (la nota de `PersonFormDrawer` lo documenta) y el resultado de DevOps puede crecer con los tableros.
- **La búsqueda vive en un hook propio, `useDevOpsUserSearch`.** Estado `idle | searching | found | notFound | error` con el usuario encontrado y el mensaje; `search(email)` llama a `personDetailService.searchDevOpsUser(email)` y traduce `404` a `notFound`. Separarlo del drawer permite probar la máquina de estados sin montar el `Drawer` (ver *Riesgos*) y deja la mutación de vincular donde ya está, en `usePersonDetailMutations`.
- **El correo llega prellenado y se puede corregir.** Se inicializa con `person.userPrincipalName`; el drawer se monta con `key` para que cada apertura arranque limpio. Antes de buscar se valida sólo la forma del correo (algo `@` algo `.` algo) para no consultar DevOps con un texto vacío; el resto lo dice el servidor. Cambiar el texto después de una búsqueda vuelve el resultado a `idle`: nunca se puede vincular un usuario encontrado con un correo distinto al que se ve.
- **`Vincular` sólo se habilita con un usuario encontrado**, y `Buscar` se deshabilita mientras busca. `Enter` en el campo equivale a Buscar. Sin coincidencia se muestra un `Alert` de advertencia con el correo buscado; un error de red o del servidor, un `Alert` de peligro con reintento. El `409` del `POST` se muestra como `serverError` dentro del drawer con el nombre de la persona que ya tiene esa identidad, sin cerrarlo.
- **`devOpsCandidates` desaparece del DTO y de las semillas.** Dejarlo "por compatibilidad" mantendría vivo un concepto que ya no existe y obligaría a seguir sembrándolo. Es un cambio del contrato del mock: el backend real nunca lo sirvió. Fixtures, adapter y pruebas se actualizan en el mismo change.
- **Tras vincular, refrescar el detalle** con el mismo `refreshAll` que usan las demás mutaciones (detalle + overview), cerrar el drawer y mostrar el toast "Identidad vinculada". El encabezado, el indicador y la fila *Identidad DevOps* de la ficha se actualizan solos a partir del `GET`.
- **El indicador ofrece la acción siempre.** El botón pasa a "Vincular con Azure DevOps" con el icono `link`, sin la condición sobre candidatas; el pie del indicador deja de contar candidatas.

## Risks / Trade-offs

- **[El backend implementa otro contrato]** → El acuerdo queda escrito en la spec de `api-mocking` y en `personDetailService` con el DTO tipado; si el servicio real devuelve otra forma, el cambio es un adapter en el servicio, no en el drawer. El avatar viaja como URL y puede requerir autenticación contra DevOps: el drawer muestra iniciales cuando `avatarUrl` es `null` o la imagen no carga.
- **[El correo de DevOps no es el UPN]** → Externas registradas con el dominio del proveedor no van a coincidir con su UPN. Por eso el campo es editable: el Líder de Expertise corrige el correo y vuelve a buscar. La spec lo exige.
- **[Una identidad vinculada a dos personas]** → El mock responde `409` y el drawer lo muestra nombrando a la otra persona; el backend real tiene que aplicar la misma regla, que ya estaba en el modal actual ("una identidad sólo puede vincularse a una persona").
- **[La lógica queda atrapada en el drawer]** → `EditStacksDrawer.test.tsx` demuestra que el `Drawer` de tuip sí se monta con Testing Library, así que el componente se prueba montado, como ese. Aun así la máquina de estados va en `useDevOpsUserSearch` y las reglas puras (correo con forma válida, cuándo se puede vincular) en un módulo aparte, probadas sin el componente, siguiendo el patrón `personFormOptions`: es lo que permite cubrir todos los estados sin esperar respuestas de red en cada prueba.
- **[Romper el backlog al cambiar cómo se guarda la identidad]** → El `userName` de la identidad vinculada por correo tiene que ser el correo del usuario de DevOps y las historias sembradas del backlog tienen que usar ese mismo `userName`; la prueba del handler cubre que una historia excluida entra a la cola tras vincular.

## Migration Plan

1. Contrato y servicio: `DevOpsUserDto`, `personDetailService.searchDevOpsUser`, `devOpsCandidates` fuera del DTO.
2. Mock y semillas: usuarios de DevOps buscables por correo (uno para la persona sin identidad, uno ya vinculado a otra), `GET /devops/users`, `POST` de vinculación por id de usuario con `404`/`409`, y la prueba del backlog tras vincular.
3. `useDevOpsUserSearch` y las reglas puras del drawer, con sus pruebas.
4. `LinkDevOpsIdentityDrawer` en lugar del modal; indicador con la acción siempre disponible; contenedor con refresco y toast.
5. Pruebas de componentes y fixtures sin candidatas; borrar `LinkDevOpsIdentityModal`.

Sin rollback especial: el cambio vive en frontend y mocks; revertir el change devuelve el modal de candidatas.

## Open Questions

- Cuando el backend exista, si el avatar de DevOps se sirve como URL directa (con la sesión del navegador) o proxied por el backend. No cambia el drawer: con `null` o carga fallida muestra iniciales.
