## Why

La razón de registrar a una persona en la plataforma es poder seguir su trabajo en Azure DevOps: sus items sólo cuentan para el FTE real y para la cola del Backlog cuando su identidad DevOps está vinculada. Hoy esa vinculación depende de un **espejo de Entra ID que propone candidatas por nombre**: el indicador *Trabajo en DevOps* de la ficha ofrece "Vincular identidad" únicamente si hay candidatas, y el modal deja elegir entre ellas. Cuando el nombre no coincide —apellidos en otro orden, una externa registrada con el dominio del proveedor, un homónimo— no hay candidatas, el botón queda deshabilitado y la persona se queda sin identidad sin que el Líder de Expertise pueda hacer nada desde la pantalla.

Ya existe una forma más directa y sin ambigüedad de encontrar al usuario: **buscarlo en Azure DevOps por su correo corporativo**, que la persona ya tiene registrado (su UPN). El alta de personas no cambia —se decidió conservar el formulario actual—; lo que falta es una acción de vinculación que use esa búsqueda y muestre lo que DevOps sabe de ese usuario (identificador, nombre, avatar, proyectos, equipos y tableros) antes de vincularlo.

## What Changes

- **La acción de vincular deja de depender de las candidatas por nombre.** El botón del indicador *Trabajo en DevOps* pasa a llamarse *Vincular con Azure DevOps* y está siempre disponible mientras la persona no tenga identidad.
- **Un drawer nuevo reemplaza al modal de candidatas.** Abre con el correo corporativo de la persona ya escrito; *Buscar* consulta Azure DevOps por ese correo y muestra la identidad encontrada —identificador, nombre, avatar, correo, proyectos, equipos y tableros— con la marca "Coincide"; *Vincular* guarda la relación. Sin coincidencia, el drawer lo dice y no deja vincular. El correo se puede corregir y volver a buscar.
- **Se define el contrato de búsqueda** (`GET /devops/users?email=<correo>`), que el mock honra y que el backend deberá implementar. La vinculación conserva `POST /people/{id}/devops-identity` enviando sólo el identificador del usuario DevOps.
- **Tras vincular**, el detalle se refresca: el encabezado pasa a "DevOps vinculado", el indicador muestra los items (cero hasta la próxima ingesta) y la ficha guarda la fecha de vinculación. Un toast confirma.
- **BREAKING** (contrato del mock, no de producción): el detalle deja de devolver `devOpsCandidates` y el `POST` de vinculación deja de aceptar el id de una candidata; recibe el id del usuario de Azure DevOps devuelto por la búsqueda.

### Fuera de alcance

- El alta y la edición de personas: el drawer de persona queda como está.
- El backend .NET de este repo: el contrato de búsqueda queda escrito para quien lo implemente; en frontend lo sirve el mock.
- Desvincular o cambiar una identidad ya vinculada, y la acción desde el menú de cada fila del listado. Se anotan como siguientes pasos.
- Traer proyectos, equipos y tableros a la ficha de una persona ya vinculada: el detalle sigue mostrando la identidad y sus items como hoy.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `people`: el requisito **Detalle de persona** cambia la acción del indicador *Trabajo en DevOps* —de "Vincular identidad" entre candidatas por nombre a *Vincular con Azure DevOps* buscando por correo— y gana el requisito **Vincular identidad DevOps por correo**, que describe el drawer, la búsqueda, sus estados y el efecto de vincular.
- `api-mocking`: el requisito **Handler de mock para el detalle de una persona** deja de servir candidatas por nombre, gana el `GET` de búsqueda de usuarios de Azure DevOps por correo y cambia el `POST` de vinculación para recibir el id de un usuario devuelto por esa búsqueda.

## Impact

- **Contrato de API** — nuevo `GET /devops/users?email=<correo>` que responde el usuario de Azure DevOps con ese correo (`id`, `displayName`, `email`, `avatarUrl`, `projects[]`, `teams[]`, `boards[]`) o `404` si no existe. Es un acuerdo con quien implemente el backend: hoy no existe ningún endpoint de DevOps en el backend de este repo. `POST /people/{id}/devops-identity` conserva su forma (`{ identityId }`) pero el id pasa a ser el del usuario de Azure DevOps.
- **Frontend**: `features/people` — `PersonDetailStatsCards` (acción del indicador), `PersonDetailContainer` (estado y refresco), `personDetailService` (búsqueda; `devOpsCandidates` desaparece del DTO), `usePersonDetailMutations` (o un hook propio de búsqueda), el `LinkDevOpsIdentityModal` se reemplaza por un `LinkDevOpsIdentityDrawer`; `mocks/handlers/personDetail.handlers.ts` y sus semillas (usuarios de DevOps buscables, sin `CANDIDATE_IDENTITIES`); pruebas de handler, de componentes y de hooks.
- **Mock del backlog**: resuelve la persona de cada historia por el `userName` de la identidad vinculada (`getDevOpsIdentitiesSnapshot`). La identidad vinculada por correo tiene que seguir exponiendo ese `userName` para que las historias de una persona recién vinculada entren a la cola en la misma sesión, como exige `api-mocking`.
- **Lo que cambia de significado**: "identidad candidata" desaparece del vocabulario; la identidad es el usuario de Azure DevOps que responde a un correo. Las semillas de personas sin identidad (Camila) pasan de tener candidatas a tener un usuario de DevOps buscable por su correo.
- **Diseño**: el drawer y sus estados están en el lienzo *Vincular con Azure DevOps* (artifact `43790ac9`, página "Vincular con DevOps"). Anatomía de `Drawer` de tuip en tamaño `sm`, como los demás paneles del detalle.
