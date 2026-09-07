# Rediseñar el detalle de persona como perfil profesional

## Why

El detalle de persona mezcla responsabilidades de tres módulos: reproduce la gestión de asignación (indicador Asignado, panel Asignación, panel de personas sin célula, acción Reasignar) que pertenece a la Torre de control y a Células, y duplica la lectura del sprint (SP, barras, capacidad en horas) que pertenece a Capacidad. El boceto aprobado — artefacto "Ficha del colaborador", https://claude.ai/code/artifact/cd59f380-f879-495a-963e-f05eb4b5e058, en su última versión guardada — convierte la página en el **perfil profesional** de la persona: la ficha administrativa y los stacks protagonizan, las competencias la complementan, y Capacidad y Competencias aparecen sólo como punteros compactos con el resumen que cada módulo sirve.

## What Changes

- **Encabezado mínimo**: avatar, nombre, y debajo sólo el cargo y el chip del stack principal. Se retiran del encabezado el seniority/SFIA, la vinculación, la modalidad, el correo, el estado DevOps, la marca "Sin célula" y el enlace de vuelta (el breadcrumb ya navega). Acciones: **Editar** (primaria) y **Competencias** (sutil). **BREAKING**: se retiran del detalle *Reasignar / Asignar a una célula*, *Evaluar habilidades* y el menú con *Eliminar* — la asignación se gestiona en la Torre de control y en Células; eliminar sigue en el listado.
- **Sin nada de asignación**: desaparecen el indicador Asignado, el panel Asignación y el panel de persona sin célula (incluida la lista de células que piden la capacidad). La página no muestra célula, dedicación, mix ni FTE declarado.
- **Columna protagonista (2/3)**: panel **Perfil** ("lo administrativo") con las filas Nivel (la escala de 4 niveles: Principiante, Competente, Avanzado, Experto — sin número SFIA), Modalidad, Vinculación, Correo, Identidad DevOps, Chapter, Línea de expertise, Ingreso y Costo mensual (la cifra sola, sin lectura de concordancia); y debajo el panel **Stacks** (nombre + medidor de nivel, sin texto del nivel). Se retira el panel "Capacidades que cubre".
- **Barra lateral (1/3)**: dos punteros compactos — **Competencias** (badge de brechas abiertas + fecha de evaluación + *Ver*) y **Capacidad en el sprint** (badge de la señal de balance + "N de 6 señales · sprint · estado" + *Ver*; sin identidad, el estado "Sus items no cuentan" con *Vincular con Azure DevOps*) — seguidos de **Perfil evaluado** (habilidades con medidor, marca de lo requerido y badge Brecha/Cumple) y **Plan de desarrollo** (acciones con estado), ambos de sólo lectura: *Ver evaluación* y *Agregar acción* navegan al módulo Competencias.
- La ficha no calcula nada de otros módulos: la señal del sprint llega resuelta de Capacidad y el resumen de brechas de Competencias.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `people`: el requirement **Detalle de persona** se reescribe con la nueva anatomía (encabezado mínimo, columna Perfil+Stacks, barra lateral de punteros y competencias, sin asignación).

## Impact

- `frontend/src/features/people/PersonDetailContainer.tsx` y `components/detail/*`: se reescriben el encabezado, los indicadores y los paneles; se eliminan `PersonAssignmentPanel`, `PersonUnassignedPanel` y las tarjetas actuales; `EditStacksDrawer` y `LinkDevOpsIdentityDrawer` se conservan.
- Consume datos ya servidos: el resumen del sprint del handler de detalle de persona (capability `real-dedication`, sin cambios) y el plan por persona de `/career-plan/people/:id` (capability `career-plan`, sin cambios). Sin endpoints ni mocks nuevos.
- Tests del detalle de persona y del router; `context/docs/Roles_y_Permisos_Plataforma.md` si nombra acciones del detalle.
- Supuestos anotados: para externas la fila Vinculación dice "Externa · <proveedor>" (el boceto muestra una interna); *Eliminar* y la reasignación quedan cubiertos por el listado y la Torre de control, ya especificados.
