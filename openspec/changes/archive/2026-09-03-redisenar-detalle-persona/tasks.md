# Tasks — Rediseñar el detalle de persona

## 1. Datos y adaptadores

- [x] 1.1 Extender `PersonDetailAdapter` con lo que el boceto pide del detalle: `primaryStackName` (el stack principal o `null`), y un resumen del sprint para el puntero (señal, conteo "N de 6", nombre y estado del sprint) derivado de `devOpsIdentity.currentSprint` sin formateos de SP. Verificar con tests del adapter.
- [x] 1.2 Agregar al contenedor la carga del plan (`careerPlanService.getPersonPlan`) en paralelo al detalle, con estado propio (cargando / sin evaluación / error degradado a vacío). Verificar con test del contenedor: la ficha renderiza aunque el plan falle.

## 2. Encabezado y acciones

- [x] 2.1 Reescribir `PersonDetailHeader`: avatar + nombre + línea "cargo · chip stack principal"; acciones sólo "Competencias" (subtle, navega al plan) y "Editar" (primaria). Retirar back link, seniority, vinculación, modalidad, correo, estado DevOps, "Sin célula", Reasignar/Asignar, Evaluar y el menú Eliminar. Verificar con tests: el encabezado no contiene correo ni "Reasignar".

## 3. Columna protagonista

- [x] 3.1 Reordenar `PersonProfilePanel` a las filas del boceto: Nivel (escala de 4, `seniorityLabel`, sin número SFIA), Modalidad, Vinculación ("Externa · <proveedor>" para externas), Correo (mono), Identidad DevOps ("Vinculada" / "Sin vincular" en peligro), Chapter, Línea de expertise, Ingreso, Costo mensual (cifra sola). Acción Editar. Verificar con tests de componentes.
- [x] 3.2 Ajustar `PersonStacksPanel`: nombre + `LevelMeter` por stack, sin texto del nivel; conservar Editar → `EditStacksDrawer` y el estado vacío. Retirar bus factor y cobertura del chapter. Verificar con tests.
- [x] 3.3 Eliminar `PersonDetailStatsCards`, `PersonAssignmentPanel` y `PersonUnassignedPanel` (componentes, imports y tests). Verificar: `grep` sin referencias y suite verde.

## 4. Barra lateral

- [x] 4.1 Crear los punteros compactos (`PersonPointerCards` o equivalente): Competencias (badge "N brechas abiertas"/"Sin brechas" + "evaluado el <fecha>" + Ver → plan) y Capacidad en el sprint (badge de la señal + "N de 6 señales · <sprint> · <estado>" + Ver → `/app/lead/dedicacion/<id>`; estados "Sin sprint en curso" y "Sus items no cuentan" con *Vincular con Azure DevOps* → drawer existente). Sin SP, barras ni horas. Verificar con tests de los tres estados.
- [x] 4.2 Crear `PersonSkillProfilePanel` (habilidades: nombre, "<nivel> · su cargo pide <requerido>", `LevelMeter` con `expected`, badge Brecha/Cumple; *Ver evaluación* navega) y `PersonPlanPanel` (acciones: título, "habilidad · objetivo · compromiso", badge En curso/Cumplida; *Agregar acción* navega; nota final del módulo), ambos de sólo lectura, con estados vacíos que invitan a evaluar en Competencias. Verificar con tests.

## 5. Composición y limpieza

- [x] 5.1 Recomponer `PersonDetailContainer` con el grid `minmax(0,2fr) minmax(0,1fr)`: izquierda Perfil + Stacks, derecha punteros + Perfil evaluado + Plan de desarrollo; conservar refresco tras editar/vincular/editar stacks y los estados de carga y error de la página. Verificar con el test del contenedor.
- [x] 5.2 Actualizar los tests existentes del detalle (`PersonDetailComponents.test.tsx`, contenedor, router si aplica) al nuevo contrato: sin "Asignado", sin "Dedicación real" como tarjeta, sin "Reasignar"; con punteros y paneles nuevos. Verificar: `npx vitest run src/features/people`.
- [x] 5.3 Actualizar `context/docs/Roles_y_Permisos_Plataforma.md` donde nombre acciones del detalle de persona (reasignar/eliminar desde el detalle → Torre de control / listado). Verificar con `grep`.
- [x] 5.4 Puerta completa: `npx prettier --check`, `npx eslint src`, `npx vitest run`, y verificación visual contra el boceto con los mocks (`VITE_USE_MOCKS=true VITE_AUTH_SIMULATOR=true`). Verificar: sin regresiones nuevas.
