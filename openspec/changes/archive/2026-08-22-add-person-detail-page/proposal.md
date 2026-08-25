## Why

El nombre de cada persona en el listado de Personas ya es un enlace a `/app/lead/personas/:id`, pero esa ruta no existe: hoy cae en la página "no encontrada". El Chapter Lead no tiene ningún lugar donde ver a una persona completa —qué le asignó, cuánto trabaja de verdad, si le debe la validación de horas del sprint, si sus work items cuentan, qué capacidades cubre— ni donde actuar sobre ella sin pasar por el detalle de la célula o por la Torre de control. El diseño "Detalle de Persona" (canvas aprobado, dos estados: con célula y sin célula) resuelve eso con el criterio de que cada dato aparece una sola vez.

El usuario eligió el alcance completo, mock-first: lo que no existe en el dominio (reporte de horas, identidad DevOps y curación, capacidades que cubre, FTE real) entra como endpoints de mock nuevos, siguiendo el patrón del resto de la app.

## What Changes

- **Nueva página `/app/lead/personas/:id`** (capacidad `people`, requirement nuevo "Detalle de persona"), con la entrada "Gestionar Personas" activa en la navegación y el breadcrumb `Plataforma / Gestionar Personas / <nombre>`. Misma anatomía que el detalle de célula: enlace de vuelta, encabezado, 3 cards, dos columnas 7/5.
- **Encabezado**: avatar grande, nombre, seniority con el medidor de nivel del sistema de diseño y su SFIA, vinculación (Interna / Externa · proveedor), badge "Sin célula" cuando aplica, cargo · rol, modalidad en español, correo, estado de identidad DevOps. Acciones: *Editar persona* (el drawer existente), *Reasignar* / *Asignar a una célula* (el drawer de la Torre de control), menú con *Eliminar*.
- **Tres cards**: *Asignado vs real* (FTE asignado sobre FTE disponible, FTE real del último sprint validado y la diferencia), *Reporte de horas del sprint actual* (horas reportadas sobre las del sprint, reparto BAU / Iniciativa / Libre, estado y botón **Validar** cuando está por validar) y *Trabajo en DevOps* (items activos por tipo, pendientes de curación, o "Sin vincular · sus items no cuentan" con acción *Vincular identidad*).
- **Panel Asignación**: célula (enlace al detalle), criticidad, tribu, compañeros, desde cuándo, dedicación con la barra BAU / Transformación y lo libre, dos señales (SFIA frente al requerido por la célula; reporta más de lo asignado) y las acciones *Subir dedicación*, *Mover a otra célula* y *Quitar de la célula*. Sin célula: estado vacío y la lista de células que piden su capacidad con *Asignar acá*.
- **Panel Horas por sprint**: barras apiladas BAU / Iniciativa de los últimos 6 sprints contra la línea de lo asignado.
- **Panel Capacidades que cubre**: lista de capacidades con nivel SFIA (medidor), cuál es la principal, cuántas personas más del chapter la cubren y la marca **Bus factor 1** cuando nadie más.
- **Panel Ficha**: chapter y su lead, ingreso con antigüedad, FTE disponible declarado, costo mensual con la lectura de concordancia con el seniority, proveedor y vigencia del contrato (externas), documento, identidad DevOps. Nada del encabezado se repite acá.
- **Mock nuevos** (capacidad `api-mocking`): `GET /people/:id/detail` con todo lo anterior agregado (derivado de los mocks de personas, asignaciones y células más datos de ejemplo propios para horas, DevOps y capacidades), `POST /people/:id/hours/:sprint/validate` y `POST /people/:id/devops-identity` (vincular).
- **Asignar / reasignar / quitar desde el detalle** reutilizan el drawer y las mutaciones de la Torre de control; tras cada cambio el detalle se refresca (capacidad `control-tower`: el drawer SHALL poder montarse fuera de la Torre).

### Fuera de alcance

- Backend real de horas, DevOps y capacidades: quedan sólo en el mock.
- Editar las capacidades que cubre (el enlace *Editar* del panel no hace nada todavía) y la bandeja de curación (el enlace lleva a un placeholder).
- Cambios en el listado de Personas: el enlace ya existe.

## Capabilities

### New Capabilities
(ninguna: el detalle es un requirement nuevo dentro de `people`)

### Modified Capabilities
- `people`: nuevo requirement "Detalle de persona" (página, encabezado, cards, paneles, acciones y sus dos estados) y nuevo requirement "Validar el reporte de horas de una persona"; la entrada "Gestionar Personas" sigue activa en el detalle.
- `api-mocking`: nuevo requirement "Handler de mock para el detalle de una persona" (detalle agregado, validación de horas, vinculación de identidad DevOps).

Sin delta para `chapter-lead-shell` (la regla "entrada activa en rutas hijas + breadcrumb con el nombre del elemento" ya cubre `personas/:id`) ni para `control-tower` (aún no está en los specs principales — change `add-control-tower-reassignment` pendiente de archivar — y reutilizar su drawer no cambia su comportamiento observable; va en design.md).

## Impact

- Frontend: `src/pages/LeadPersonDetailPage/`, `src/features/people/{services,adapters,hooks,components}` (detalle), `src/features/control-tower/components/ReassignPersonDrawer.tsx` (reutilizado), `src/app/router/routes.tsx`, `src/features/chapter-lead-shell/navigation.ts` (breadcrumb del detalle, mismo mecanismo que `celulas/:id`).
- Mocks: `src/mocks/handlers/personDetail.handlers.ts` (nuevo) registrado en `index.ts`; datos de ejemplo de sprints, horas, identidades DevOps y capacidades.
- Sin cambios en `tuip`. Brechas detectadas al implementar, para un change posterior en tuip (resueltas en la app con tokens y clases del sistema, sin componentes locales):
  - `Progress` / `CapacityBar` no admiten un marcador de referencia (el "real" sobre el asignado): la marca se dibuja encima con `bg-neutral-default`.
  - No hay gráfico de barras verticales apiladas (horas por sprint): se dibuja con divs teñidos con `segmentFillClass`, la misma clase que `SegmentedBar`.
  - `Avatar` no tiene tamaño mayor que `large` (40 px) para un encabezado de detalle.
