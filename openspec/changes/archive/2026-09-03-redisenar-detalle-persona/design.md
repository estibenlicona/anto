# Diseño — Rediseñar el detalle de persona

## Context

Ver proposal.md — Why. El boceto aprobado es el artefacto "Ficha del colaborador" (https://claude.ai/code/artifact/cd59f380-f879-495a-963e-f05eb4b5e058) en su **última versión guardada**, que incluye ediciones hechas por el usuario en el lienzo: fila "Nivel" (sin la palabra SFIA y sin pips), Stacks sin el nombre del nivel en texto, costo sin lectura de concordancia, acciones sólo "Competencias" + "Editar", sin enlace de vuelta ni menú de más acciones. El tablero "Estados de la tarjeta Capacidad" define los tres estados del puntero.

Estado actual: `PersonDetailContainer` compone `PersonDetailHeader`, `PersonDetailStatsCards` (Asignado + Dedicación real, que importa componentes de `@features/dedication`), `PersonAssignmentPanel`, `PersonUnassignedPanel`, `PersonStacksPanel` y `PersonProfilePanel`. El plan por persona ya se sirve en `/career-plan/people/:id` (usado por `PersonPlanContainer`) y el resumen del sprint viaja en el DTO del detalle (`devOpsIdentity.currentSprint`).

## Goals / Non-Goals

**Goals**
- Implementar el boceto tal cual con tuip: columna 2fr (Perfil, Stacks) + barra 1fr (punteros, Perfil evaluado, Plan de desarrollo).
- Reusar datos ya servidos: cero endpoints y cero mocks nuevos.
- Que la ficha no importe cálculo de otros módulos: sólo presenta resúmenes ya resueltos.

**Non-Goals**
- No cambia el módulo Competencias (evaluar, agregar/cumplir acciones siguen allá), ni Capacidad, ni la Torre de control.
- No cambia el listado de Personas (Eliminar y sus acciones de fila quedan como están).
- No se tocan los DTOs del backend/mocks: los campos de asignación que la vista deja de usar siguen viajando.

## Decisions

1. **El plan se carga con el servicio existente de career-plan.** El contenedor pide en paralelo el detalle de persona y `careerPlanService.getPersonPlan(id)`; los paneles Perfil evaluado / Plan de desarrollo y el puntero Competencias derivan de esa respuesta (brechas abiertas = habilidades con `gap`). Alternativa descartada: agregar un resumen del plan al DTO del detalle — duplicaría la fuente y exige mock nuevo.
2. **El puntero de Capacidad deriva del DTO del detalle** (`devOpsIdentity.currentSprint`: señal, conteo de evidencias, sprint, estado), reusando `BalanceSignalBadge`-equivalente sólo como badge + texto. No se importan barras (`CapacityFteBar`, `DemandBar`) ni formateos de SP en esta vista.
3. **Sin plan cargado la barra lateral degrada por partes**: si el plan falla o no existe, los punteros y paneles de competencias muestran su estado vacío ("Sin evaluación · Evaluar en Competencias") sin tumbar la página; el detalle de persona sigue siendo la fuente crítica.
4. **"Nivel" muestra `seniorityLabel`** (la escala de 4). `sfiaLevel` numérico deja de renderizarse en esta vista; no se elimina del modelo. Alternativa descartada: renombrar el campo en el contrato — fuera de alcance.
5. **Stack principal en el encabezado** = el stack marcado como principal en los datos de la persona; sin stacks, el chip se omite (sólo queda el cargo).
6. **Componentes**: se eliminan `PersonDetailStatsCards`, `PersonAssignmentPanel`, `PersonUnassignedPanel`; nacen `PersonPointerCards` (los dos punteros), `PersonSkillProfilePanel` y `PersonPlanPanel` (lectura), y `PersonDetailHeader` se reescribe. `DetailPanel`, `PersonProfilePanel` (reordenado a las 9 filas) y `PersonStacksPanel` (medidor sin texto) se ajustan. `EditStacksDrawer` y `LinkDevOpsIdentityDrawer` quedan intactos.
7. **Grid `minmax(0,2fr) minmax(0,1fr)` con `gap` de grupo**, como el boceto; densidades y tipografías de tuip ya publicadas (label 12/16, body-sm 14/22, medidor `LevelMeter` con `expected`).

## Risks / Trade-offs

- **Pérdida deliberada de flujos en el detalle** (reasignar, eliminar, bus factor, células que piden capacidad): decisión del usuario; queda cubierta por Torre de control, Células y el listado. Si duele en uso real, se repone como cambio aparte.
- El puntero Competencias necesita el plan aun cuando el Chapter Lead nunca abra esa pestaña — una petición extra por detalle; aceptable (payload pequeño, ya mockeado).
- Tests existentes del detalle cubren la anatomía vieja: se reescriben, cuidando no perder cobertura de vinculación DevOps y edición.

## Migration Plan

Un solo cambio de frontend; sin migración de datos. Actualizar `context/docs/Roles_y_Permisos_Plataforma.md` donde nombre acciones del detalle de persona.

## Open Questions

(ninguna — el boceto y las decisiones del usuario en el lienzo resuelven las dudas de alcance)
