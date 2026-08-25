## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- El backend real ya modela `Person` (`backend/src/GestionCapacidad.Domain/Entities/Person.cs`) y lo expone completo en `PeopleEndpoints.cs` (`api/v{version}/people`): CRUD + `chapter`/`provider` assignment + catálogos `seniorities`, `modalities`, `sfia-levels` (`api/v{version}/catalogs/*`). `PersonDto`, `CreatePersonRequest` y `CreatePersonValidator` (`GestionCapacidad.Application`) fijan el contrato de campos y límites que este change refleja en el mock.
- `Company` (`CompaniesEndpoints.cs`, `api/v{version}/companies`) es la entidad real detrás de "Proveedor/Tercero" del mockup — no hay un endpoint `providers` real pese a que el mockup lo anota así.
- `features/squads/` es el precedente directo y completo: adapters, service, hooks, componentes, mock handler, todos construidos en `add-chapter-lead-squads-screen`. Esta change replica esa misma estructura para `people`, campo por campo distinto solo donde el dominio lo exige.
- El mockup (`context/mvps/plataforma_dimensionamiento_v7_unificado.html`, sección `v-capacidades`, línea ~595) es la única referencia visual para el formulario de alta. Su selector "Modalidad: Interno/Externo" no es el campo real `Modality` (Remote/Hybrid/OnSite) — controla, en el mockup, la visibilidad del selector de proveedor. Ver proposal.md para la resolución.
- No existe agregado `Chapter` en el dominio (`ChapterId` es un `Guid?` suelto en `Person`, sin repositorio) y la plataforma no tiene autenticación real — asignar chapter queda fuera de alcance, ver proposal.md.

## Goals / Non-Goals

**Goals:**
- Pantalla de Personas con paridad estructural exacta a la de Células: mismos patrones de listar/crear/editar/eliminar, mismo manejo de error y de carga.
- El mock refleja el contrato real (`PersonDto`/`CreatePersonRequest`/`UpdatePersonRequest`/catálogos) para que integrar contra el backend real después sea acotado, igual que quedó pendiente para Squads.

**Non-Goals:**
- Asignación a célula, utilización, rebalanceo, vínculo DevOps, asignación de chapter, CRUD de compañías — todos fuera de alcance, ver proposal.md.
- Tocar `features/squads/` o su spec — esta change sólo agrega `people`, no modifica el patrón que copia.

## Decisions

- **Estructura de `features/people/` idéntica a `features/squads/`, sin variaciones de patrón.** Mismos siete archivos con el mismo rol:
  - `services/personService.ts` — `PersonDto`/`CreatePersonRequest`/`UpdatePersonRequest`, mismos nombres de campo que el DTO real (camelCase, sin traducción — igual que `squadService.ts` con `SquadDto`), `list`/`create`/`update`/`remove` contra `httpClient`, más `getSeniorities`/`getModalities`/`getSfiaLevels`/`getCompanies` (equivalente a `getCriticalities`).
  - `adapters/PersonAdapter.ts` — mapeo DTO ↔ forma de UI, mismo rol que `SquadAdapter.ts`.
  - `hooks/usePeople.ts` — carga de listado + estado de error/loading, igual que `useSquads.ts`.
  - `hooks/usePersonMutations.ts` — create/update/remove con manejo de error del servidor, igual que `useSquadMutations.ts`.
  - `hooks/useCatalogs.ts` — un solo hook para los tres catálogos de selección (seniorities, modalities, sfia-levels) más compañías, en vez de cuatro hooks separados: los cuatro se piden juntos al abrir el formulario y no hay ningún caso en que se necesiten por separado — la separación de `useCriticalities.ts` en Squads tenía sentido con un solo catálogo, no con cuatro.
  - `components/PeopleList.tsx`, `components/PersonFormDrawer.tsx`, `components/personFormValidation.ts`, `components/DeletePersonConfirmDialog.tsx`, `PeopleContainer.tsx` — mismo rol que sus pares en Squads, salvo `PersonFormDrawer` (ver decisión de Drawer abajo).
- **`personFormValidation.ts` reimplementa los límites de `CreatePersonValidator.cs` en el cliente**, mismo criterio que `squadFormValidation.ts`: nombre ≤200, documento ≤50, usuario principal ≤250, cargo ≤100, rol ≤100, seniority/modalidad del catálogo, SFIA 1-4, FTE 0.0-1.0, costo ≥0 — para bloquear el envío antes de llamar al backend, no para duplicar la única fuente de verdad (que sigue siendo el validador real).
- **"¿Es externo?" es estado de UI, y asignar proveedor es una segunda llamada, no un campo del alta.** `CreatePersonRequest`/`UpdatePersonRequest` reales no tienen `providerId` — el backend lo asigna aparte (`PUT /people/{id}/provider/{providerId}`, `AssignToProviderAsync`), el mismo patrón de asignación-separada que ya excluye a `ChapterId` de esta change. A diferencia de Chapter (sin agregado propio todavía), Provider sí está en alcance porque el catálogo de compañías ya existe. El formulario mantiene `isExternal: boolean` local que controla la visibilidad del selector de compañía; al confirmar, `PeopleContainer` hace `POST/PUT /people` primero y, sólo si `isExternal` es verdadero y hay una compañía seleccionada, encadena `PUT /people/{id}/provider/{providerId}`. Si el alta o edición de la persona falla, no se intenta la asignación de proveedor.
- **Nivel SFIA se muestra como `"{value} · {label}"`** (`"2 · Competente"`), igual que el mockup y que `GetSfiaLevelsAsync` ya devuelve (`{value, label}`) — el mock lo replica tal cual en vez de derivar la etiqueta en el cliente.
- **El alta/edición usa `Drawer`, no `Modal` como Squads.** Con 13 campos, el formulario es más alto que cualquier `Modal` del catálogo. Se probó primero con `Modal` y apareció un bug real: `Dialog.Content` de `Modal` se limita con `max-h-[85vh]` pero queda en `overflow: visible`, así que nunca encoge a `ModalBody` para que su `overflow-y-auto` entre en juego — el contenido que excede la pantalla queda inalcanzable, sin scroll posible (confirmado en el navegador: `ModalBody` medía 1030px de alto contra un `Modal` de 632px, sin scrollbar). Es un bug latente de `Modal`/`ModalBody` en tuip, nunca disparado hasta ahora porque ningún modal existente tenía tanto contenido — queda fuera de alcance arreglarlo en tuip desde este change. `Drawer` no tiene el problema: su panel usa `h-full` (altura real, no un tope) y `DrawerBody` es `flex-1 overflow-y-auto`, así que escala y scrollea correctamente sin workarounds. Se usa `size="lg"` (720px) en vez del `sm` por defecto, más cómodo para el volumen de campos. `DeletePersonConfirmDialog` se queda con `Modal`: sólo tiene confirmar/cancelar, no le aplica el problema.
- **El catálogo de compañías se consume, no se administra.** `getCompanies()` sólo lista; no hay alta/edición/baja de compañías en esta change (ver proposal.md, fuera de alcance).
- **Página y ruta siguen el patrón de Squads sin variación**: `pages/LeadPeoplePage/LeadPeoplePage.tsx` (mismo shape que `LeadSquadsPage.tsx`: `h1 sr-only` + contenedor), ruta `personas` bajo `/app/lead` en `routes.tsx` (`lazy`, sin `AuthGuard`, mismo motivo que el resto de `/app/lead`).
- **Navegación**: nueva entrada en `leadNavGroups` (grupo "Capacidad", junto a "Células") y en `leadRouteTitles` en `features/chapter-lead-shell/navigation.ts` — mismo archivo, no uno nuevo.
- **Mock handler `people.handlers.ts` mirror de `squads.handlers.ts`**: array en memoria, `resetPeopleMock()` exportado, `GET/POST/PUT/DELETE /people`, más `GET /catalogs/seniorities`, `GET /catalogs/modalities`, `GET /catalogs/sfia-levels`, `GET /companies`. Datos de ejemplo sembrados con nombres del propio mockup (María González, Laura Ruiz, Carlos López, Andrea Salazar, Sofía Torres) y compañías (GFT, TATA Consultancy Services, QVision, Indra, Softtek, Stefanini) para que la pantalla se sienta consistente con el resto del prototipo.

## Risks / Trade-offs

- [El selector de compañía apunta a `/companies`, no a `/providers` como anota el mockup] → Es una desambiguación deliberada, documentada en proposal.md: se sigue el backend real (`CompaniesEndpoints.cs`), no la anotación del mockup, mismo criterio que ya aplicó `chapter-lead-shell` para la redacción del menú.
- [Cuatro catálogos combinados en un solo hook, distinto del precedente de un catálogo por hook en Squads] → Es una desviación intencional del patrón, justificada arriba; si en el futuro alguno de los catálogos se necesita de forma aislada (por ejemplo, seniority reutilizado en otra pantalla), separar ese hook puntual es un cambio acotado, no una reestructuración.
- [El formulario tiene más campos que el de Squads (10 contra 4), mayor superficie de validación y de prueba] → Mismo patrón de validación cliente-espeja-servidor que Squads, sólo con más reglas; no introduce un mecanismo nuevo.
