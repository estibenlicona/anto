## Why

El Chapter Lead ya puede administrar Células (`add-chapter-lead-squads-screen`), pero no tiene ninguna pantalla para las personas de su chapter. El backend ya modela `Person` como agregado maduro — nombre, documento, seniority, nivel SFIA (escala Tuya 1-4), modalidad, FTE disponible, costo mensual, fecha de inicio — con CRUD completo expuesto (`PeopleEndpoints.cs`) y catálogos propios (seniorities, modalities, sfia-levels), el mismo nivel de madurez que tenía `Squad` antes de construir su pantalla. Es, además, un prerrequisito real y no solo el "siguiente" en la lista: el propio mockup de referencia dice que la capacidad disponible de un chapter "se deriva de las personas registradas: no se mantiene en dos lugares" — sin esta pantalla, la futura pantalla de Capacidades (asignación a células, utilización, rebalanceo) no tiene de dónde leer.

## What Changes

- Se agrega la pantalla **"Gestionar Personas"** bajo `/app/lead/personas`: listado, alta, edición y baja de personas del chapter, contra un endpoint mockeado que refleja el contrato real (`PersonDto`/`CreatePersonRequest`/`UpdatePersonRequest`), mismo patrón que `squads.handlers.ts`.
- Nueva entrada de navegación **"Personas"** en `ChapterLeadLayout`, agrupada bajo "Capacidad" junto a "Células" (mismo grupo, ya existente).
- Formulario de alta/edición con los campos reales del backend: nombre (≤200), documento (≤50), usuario principal/UPN (≤250), cargo (≤100), rol (≤100), seniority (catálogo: Junior, MidLevel, Senior, StaffEngineer, Principal), nivel SFIA (catálogo 1-4, escala Tuya), modalidad (catálogo real: Remote, Hybrid, OnSite), FTE disponible (0.0-1.0), costo mensual (≥0) y fecha de inicio.
- **Desambiguación del mockup**: el mockup (`v-capacidades`) muestra un selector "Modalidad: Interno/Externo" que en realidad controla si se despliega el selector de Proveedor — un concepto distinto del campo real `Modality` del backend (Remote/Hybrid/OnSite, sobre lugar de trabajo). Esta pantalla separa ambos: el selector real de Modalidad, más un toggle "¿Es externo?" independiente que revela el selector de Proveedor cuando aplica. Se sigue el orden y comportamiento del mockup, no su redacción — mismo criterio que ya aplicó `chapter-lead-shell` para la navegación.
- **El proveedor no viaja en el alta/edición de la persona**: `CreatePersonRequest`/`UpdatePersonRequest` reales no tienen `providerId` — el backend lo asigna con un endpoint aparte (`PUT /people/{id}/provider/{providerId}`). El formulario sigue capturando el toggle "¿Es externo?" y el proveedor en un solo paso; al confirmar, la pantalla crea o edita la persona primero y, sólo si corresponde, encadena la asignación de proveedor — mismo patrón de asignación-separada que ya excluye a Chapter de esta change, con la diferencia de que Provider sí está en alcance.
- El selector de Proveedor consume un catálogo mockeado de solo lectura. El mockup anota este selector como `GET /api/providers`, pero el backend real no tiene ese endpoint — sí tiene `CompaniesEndpoints.cs` en `api/v{version}/companies`, que es el mismo concepto (`Company` es la entidad real detrás de "Proveedor/Tercero"). Se sigue el backend real: el mock expone `GET /companies`, sembrado con los proveedores de ejemplo del mockup (GFT, TATA Consultancy Services, QVision, Indra, Softtek, Stefanini) — administrar Compañías como su propia pantalla queda fuera de alcance (ver abajo).
- Nuevo handler de mock (`people.handlers.ts`): CRUD de personas + catálogos de seniorities, modalities, sfia-levels + catálogo de solo lectura de proveedores — mismo patrón que `squads.handlers.ts`.

**Fuera de alcance de este change:**
- Asignación de una persona a una célula, utilización transversal, alerta de sobreasignación y rebalanceo sugerido (`Allocation`, panel "Rebalanceo sugerido" del mockup) — depende del agregado `Allocation`, que es su propia capacidad, más grande, y no existe todavía en el frontend. Esto es, literalmente, el resto de la pantalla "Gestionar Capacidades" del mockup; esta change construye solo el maestro de personas del que esa pantalla depende.
- Vincular usuario de Azure DevOps a una persona (`AssignPersonToProvider`/identidad DevOps del mockup) — pertenece al módulo "Integraciones" (README de los MVPs lo lista aparte: "Estado de vínculos e identidades"), no a esta pantalla.
- Asignación de Chapter (`ChapterId`, `AssignPersonToChapterUseCase`/`RemovePersonFromChapterUseCase`) — el dominio no tiene todavía un agregado `Chapter` propio (`ChapterId` es un `Guid?` suelto sin repositorio), y la plataforma no tiene autenticación real para derivar "el chapter del Chapter Lead actual". Las personas se crean sin chapter asignado; asignarlo es un change posterior una vez exista el concepto.
- CRUD de Proveedores/Companies (`CompaniesEndpoints.cs`) — se consume como catálogo de solo lectura en esta change; su propia pantalla de administración es un change aparte, probablemente de alcance Admin (proveedores son transversales a chapters).
- Campo `EntraObjectId` (identidad Entra) — no se valida en el backend y está ligado al flujo de vinculación de identidad, fuera de alcance por el punto anterior.
- Integración contra el backend real (`PeopleEndpoints.cs`) — el mock refleja su contrato para que ese reemplazo sea, después, un change acotado, igual que quedó pendiente para Squads.

## Capabilities

### New Capabilities
- `people`: pantalla de gestión de personas (listar, crear, editar, eliminar) para el rol Chapter Lead, contra un endpoint mockeado, con catálogos de seniority/modalidad/SFIA y un catálogo de solo lectura de compañías (proveedores).

### Modified Capabilities
- `chapter-lead-shell`: se agrega la entrada de navegación "Personas" al grupo "Capacidad", y su título correspondiente en el breadcrumb.
- `api-mocking`: se agrega un handler nuevo (CRUD de personas + catálogos de seniorities/modalities/sfia-levels + catálogo de solo lectura de compañías), como `ADDED Requirements` sobre la spec principal ya existente.

## Impact

- **Frontend**: nueva feature `frontend/src/features/people/` (adapters, servicio, hook, componentes — mismo patrón que `features/squads/`), nueva página `frontend/src/pages/LeadPeoplePage/`, nueva ruta `personas` bajo `/app/lead` en `routes.tsx` (`lazy`, sin `AuthGuard`, mismo motivo que el resto de `/app/lead`), nuevo `frontend/src/mocks/handlers/people.handlers.ts`, actualización de `frontend/src/features/chapter-lead-shell/navigation.ts`.
- **Backend**: ningún cambio — `PeopleEndpoints.cs` sigue sin consumirse desde el frontend en este change.
- **Sin cambios de contrato de API real** — el contrato de datos lo define este change únicamente para el mock, reflejando `PersonDto`/`CreatePersonRequest`/`UpdatePersonRequest` reales.
