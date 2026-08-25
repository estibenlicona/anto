## 1. Mock del backend

- [x] 1.1 Crear `frontend/src/mocks/handlers/people.handlers.ts`: array en memoria sembrado con personas de ejemplo (María González, Laura Ruiz, Carlos López), `resetPeopleMock()` exportado, `GET/POST/PUT/DELETE /people` + asignación de proveedor reflejando `PersonDto`/`CreatePersonRequest`, validación server-side equivalente a `CreatePersonValidator.cs` (mismo patrón que `isValidCreateRequest` en `squads.handlers.ts`).
- [x] 1.2 Agregar `GET /catalogs/seniorities`, `GET /catalogs/modalities`, `GET /catalogs/sfia-levels` (este último como `{value, label}[]`, escala Tuya 1-4) al mismo archivo.
- [x] 1.3 Agregar `GET /companies` de solo lectura, sembrado con GFT, TATA Consultancy Services, QVision, Indra, Softtek, Stefanini.
- [x] 1.4 Registrar `peopleHandlers` en `frontend/src/mocks/handlers/index.ts`.

## 2. Servicio y adaptador

- [x] 2.1 Crear `frontend/src/features/people/services/personService.ts`: `PersonDto`, `CreatePersonRequest`, `UpdatePersonRequest`, `Seniority`, `Modality` (tipos), `list`/`create`/`update`/`remove` contra `httpClient`, más `getSeniorities`/`getModalities`/`getSfiaLevels`/`getCompanies`/`assignProvider(id, providerId)` — este último refleja `PUT /people/{id}/provider/{providerId}` (`AssignToProviderAsync`), una llamada aparte del alta/edición porque `CreatePersonRequest`/`UpdatePersonRequest` reales no tienen `providerId`.
- [x] 2.2 Crear `frontend/src/features/people/adapters/PersonAdapter.ts`: mapeo DTO ↔ forma de formulario, incluyendo la derivación de `isExternal` a partir de `providerId` presente/ausente al precargar edición.

## 3. Hooks

- [x] 3.1 Crear `frontend/src/features/people/hooks/usePeople.ts`: carga de listado con estado de loading/error, mismo patrón que `useSquads.ts`.
- [x] 3.2 Crear `frontend/src/features/people/hooks/usePersonMutations.ts`: create/update/remove con manejo de error del servidor, mismo patrón que `useSquadMutations.ts`. `create`/`update` encadenan `personService.assignProvider` cuando `isExternal` es verdadero y hay compañía seleccionada, sólo si el alta/edición de la persona tuvo éxito primero.
- [x] 3.3 Crear `frontend/src/features/people/hooks/useCatalogs.ts`: carga combinada de seniorities, modalities, sfia-levels y companies.

## 4. Componentes

- [x] 4.1 Crear `frontend/src/features/people/components/personFormValidation.ts`: límites de `CreatePersonValidator.cs` (nombre ≤200, documento ≤50, usuario principal ≤250, cargo ≤100, rol ≤100, seniority/modalidad del catálogo, SFIA 1-4, FTE 0.0-1.0, costo ≥0), sin validar `providerId` cuando `isExternal` es falso.
- [x] 4.2 Crear `frontend/src/features/people/components/PersonFormDrawer.tsx`: formulario de alta/edición con los campos reales, selector de nivel SFIA mostrando `"{value} · {label}"`, toggle "¿Es externo?" que revela el selector de compañía y controla si `providerId` se envía. Ajuste descubierto al verificar en el navegador: con `Modal` los campos por debajo del scroll quedaban inalcanzables (bug real de `Modal`/`ModalBody` en tuip con contenido alto, nunca disparado antes). Se cambió a `Drawer` (`size="lg"`), que sí escala y scrollea bien — ver design.md.
- [x] 4.3 Crear `frontend/src/features/people/components/PeopleList.tsx`: tabla con nombre, cargo, rol, seniority, nivel SFIA y modalidad; estado vacío; error de carga con reintento.
- [x] 4.4 Crear `frontend/src/features/people/components/DeletePersonConfirmDialog.tsx`: mismo patrón que `DeleteSquadConfirmDialog.tsx`.
- [x] 4.5 Crear `frontend/src/features/people/PeopleContainer.tsx`: compone listado, alta, edición y baja, mismo patrón que `SquadsContainer.tsx`.

## 5. Página, ruta y navegación

- [x] 5.1 Crear `frontend/src/pages/LeadPeoplePage/LeadPeoplePage.tsx`: `h1` `sr-only` "Gestionar Personas" + `<PeopleContainer />`, mismo shape que `LeadSquadsPage.tsx`.
- [x] 5.2 Agregar la ruta `personas` bajo `/app/lead` en `frontend/src/app/router/routes.tsx` (`lazy`, sin `AuthGuard`).
- [x] 5.3 Agregar la entrada "Personas" al grupo "Capacidad" en `leadNavGroups`, y su título "Gestionar Personas" en `leadRouteTitles`, en `frontend/src/features/chapter-lead-shell/navigation.ts`.

## 6. Pruebas

- [x] 6.1 Tests de `personService.ts` (mismo patrón que `squadService.test.ts`).
- [x] 6.2 Tests de `PersonAdapter.ts`, incluyendo la derivación de `isExternal`.
- [x] 6.3 Tests de `usePeople.ts`, `usePersonMutations.ts`, `useCatalogs.ts`.
- [x] 6.4 Tests de `personFormValidation.ts`: cada límite y la condicionalidad de `providerId`.
- [x] 6.5 Tests de `PeopleList.tsx` y `PeopleContainer.tsx` (listado vía el mock real). Ajuste de alcance descubierto al implementar: `PersonFormDrawer.tsx` envuelve `Drawer` (mismo primitivo `@radix-ui/react-dialog` → `react-remove-scroll` que `Modal`), ya documentado como no montable en jsdom en este repo (ver `SquadFormModal.validate.test.ts`) — el mismo motivo por el que Squads nunca probó su `SquadFormModal.tsx` por render. El toggle de externo/interno y la validación quedan cubiertos como funciones puras (`personFormValidation.test.ts`, `PersonAdapter.test.ts`); el flujo completo del drawer se verifica manualmente en el navegador (7.3).
- [x] 6.6 Test de la nueva entrada de navegación y del breadcrumb en `ChapterLeadLayout`/`navigation.ts`.
- [x] 6.7 Test de ruteo: `/app/lead/personas` renderiza `LeadPeoplePage` sin `AuthGuard`.

## 7. Verificación

- [x] 7.1 Correr la suite completa de tests del frontend y confirmar que no hay regresiones fuera de las fallas preexistentes ya conocidas. 260/261 tests OK; las 2 fallas restantes son `App.test.tsx` y `httpClient.test.ts`, preexistentes y fuera de alcance.
- [x] 7.2 Correr `tsc --noEmit` en `frontend`. Limpio salvo el error preexistente y fuera de alcance de `App.test.tsx` (import `./App` en vez de `../App`).
- [x] 7.3 Levantar `pnpm dev:mock` y verificar manualmente en el navegador. Verificado: listado con las 3 personas de ejemplo, navegación y breadcrumb ("Personas" / "Gestionar Personas"), `PersonFormDrawer` abre desde la derecha con todos los selectores de catálogo poblados (Seniority, SFIA con formato "N · Etiqueta", Modalidad Remote/Hybrid/OnSite), el toggle "¿Es externo?" revela el selector de Proveedor y el scroll normal del mouse llega a todos los campos y al footer fijo (Cancelar/Guardar) — el bug de `Modal` no se repite con `Drawer`. Confirmado antes (con la versión en `Modal`, misma lógica interna) que el submit crea la persona y encadena `assignProvider` cuando corresponde.
