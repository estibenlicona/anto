## Why

La matriz del span (`add-span-skill-matrix`) dice dónde están las brechas, pero el plan de carrera se hace con una persona a la vez: hay que ver su perfil completo contra lo que su rol pide, entender qué criterio exactamente le falta, y acordar acciones con objetivo y fecha. Hoy esa conversación termina en un documento que nadie vuelve a abrir.

Este es el último change del módulo (canvas "Plan de Carrera del Chapter", artboards "Plan de carrera de una persona" y el detalle de criterios): cierra el círculo entre evaluar y hacer algo con lo evaluado.

## What Changes

- Nueva pantalla **Plan de carrera de una persona** en `/app/lead/plan-carrera/:personId`, accesible desde la matriz del span y desde el detalle de la persona.
- **Perfil evaluado**: una fila por habilidad con el nivel alcanzado, la marca de lo que su rol pide sobre el mismo medidor, y el estado (al nivel o cuántos niveles le faltan). Acá sí vale la marca de umbral: dentro de una persona el rol es uno solo.
- **Detalle criterio por criterio**: abrir una habilidad muestra lo que ya cumple en su nivel y lo que le falta del nivel que su rol pide, con la misma lista con la que se la evaluó — no una interpretación escrita después.
- **Plan de acciones**: cada acción declara de qué brecha nace, a qué nivel apunta y para cuándo, con su estado. Una acción SHALL nacer de una brecha registrada.
- **Cerrar una brecha es reevaluar**: marcar una acción como cumplida no cierra la brecha; la brecha se cierra cuando una evaluación nueva alcanza el nivel que el rol pide.

### Fuera de alcance

- Cambiar la evaluación o el catálogo.
- Notificaciones y recordatorios de vencimiento de acciones.
- Que la persona vea o edite su propio plan: no existe el shell de Colaborador.

## Capabilities

### Modified Capabilities

- `career-plan`: se agregan el perfil individual con su detalle de criterios y el plan de acciones por brecha.

## Impact

- Frontend: se amplía `src/features/career-plan` con el contenedor del plan individual, el perfil con filas desplegables y el drawer de acción; ruta nueva y enlace desde la matriz y desde el detalle de persona.
- Datos: consume el snapshot de evaluaciones cerradas (nivel, criterios marcados, brecha) y el catálogo; agrega el handler de acciones del plan.
- **tuip**: usa la fila con detalle desplegable de `add-matrix-table-primitives`; sin cambios nuevos en el sistema de diseño.
- **Orden**: después de `add-span-skill-matrix`, cuya capacidad `career-plan` este change modifica.
