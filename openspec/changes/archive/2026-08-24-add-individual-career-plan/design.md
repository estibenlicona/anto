## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **El diseño está aprobado**: artboard "Plan de carrera de una persona" — perfil con el medidor y la marca del rol, la fila abierta con los criterios cumplidos y faltantes en dos columnas, y la tabla de acciones.
- **La evaluación ya guarda los criterios marcados** (`add-skill-assessment`): el detalle no interpreta nada, muestra lo que quedó registrado.
- **La fila desplegable la habilita tuip** (`add-matrix-table-primitives`), con el detalle como fila propia y apertura controlada.
- La capacidad `career-plan` ya existe desde `add-span-skill-matrix`; este change la amplía.

## Goals / Non-Goals

**Goals:**

- Que la conversación de carrera se apoye en evidencia: el criterio exacto que falta, no una impresión.
- Que el plan sea una consecuencia de las brechas y no una lista de cursos sueltos.

**Non-Goals:**

- Notificaciones, recordatorios o vencimientos automáticos.
- Que la persona evaluada vea o edite su plan.
- Reabrir o editar una evaluación cerrada desde acá.

## Decisions

- **Acá sí va la marca de umbral sobre el medidor.** Dentro de una persona el rol es uno solo, así que la marca dice la verdad — al revés de la matriz del span, donde una línea por habilidad sería falsa con roles mezclados. Es la misma pieza visual con significados compatibles, y conviene que se lea igual en las dos pantallas.
- **El detalle muestra dos bloques, no los cuatro niveles.** Lo que importa en la conversación es qué cumple hoy y qué le falta para lo que su rol pide; mostrar los cuatro niveles completos sería repetir el catálogo dentro del plan.
- **Varias filas abiertas a la vez.** El uso real es comparar dos habilidades; cerrar una al abrir otra obligaría a ir y volver.
- **Una acción sin brecha no existe.** Es lo que evita que el plan se convierta en una lista de cursos; si alguien quiere registrar algo que no cierra ninguna brecha, primero hay que registrar la brecha.
- **Cumplir la acción no cierra la brecha.** Separar "hice lo acordado" de "ya llegué al nivel" es lo que impide que el plan se declare exitoso sin que nada haya cambiado. La brecha se cierra sola cuando una evaluación posterior alcanza el nivel, y eso se refleja también en los totales del span.
- **El plan vive bajo `career-plan/:personId` y no dentro del detalle de persona.** El detalle de persona es la ficha —datos, asignaciones, stacks—; el plan es una conversación con su propio contexto, y se llega desde ahí con un enlace.

## Risks / Trade-offs

- **[La misma marca vertical significa cosas distintas en las dos pantallas]** → En rigor significa lo mismo (lo que pide el rol); lo que cambia es que en el span no hay un único rol y por eso allá no se dibuja. Queda dicho en ambas pantallas.
- **[Una brecha con muchas acciones puede volverse ruidosa]** → Se agrupan por brecha y la pantalla señala primero las brechas sin plan, que es la información accionable.
- **[Depende de los cuatro changes anteriores]** → Anotado como primera tarea del apply.

## Migration Plan

1. Handler y modelo de acciones del plan (siempre asociadas a una brecha) con sus pruebas.
2. Adapter del plan individual: perfil por habilidad con nivel, exigido y estado; criterios cumplidos y faltantes desde la evaluación; brechas con y sin acción.
3. Perfil con filas desplegables y el detalle de criterios en dos columnas.
4. Tabla de acciones y su alta, con la regla de cierre explícita.
5. Ruta y enlaces desde la matriz y desde el detalle de persona.
6. Verificación en pantalla, incluida la reevaluación que cierra una brecha.

Rollback: retirar la ruta y los enlaces; la matriz del span sigue funcionando sola.
