## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **El diseño está aprobado**: artboard "Catálogo de habilidades (Admin)" del canvas — índice a la izquierda con los conteos, detalle a la derecha con los cuatro niveles y su lista de criterios, y abajo la tabla de nivel esperado por rol.
- **La escala de 4 niveles ya existe en la app**: `STACK_LEVEL_LABELS` y `seniorityLevels` de tuip usan los mismos nombres y colores. El catálogo no define una escala nueva, la referencia.
- **Los roles ya existen** en `Person.role`; no hay entidad Rol.
- **Mock-first**, como el resto del módulo de Capacidad; el backend .NET no participa de este change.

## Goals / Non-Goals

**Goals:**

- Sacar el catálogo del documento y ponerlo donde se evalúa.
- Que la cantidad de criterios sea libre por nivel y por habilidad, sin que ninguna pantalla la asuma.
- Dejar el nivel esperado por rol como dato de primera clase: es lo que hace computable la brecha.

**Non-Goals:**

- Evaluar, registrar brechas o planear: changes siguientes.
- Un editor de escala: los cuatro niveles son fijos.
- Historial navegable de versiones; se guarda la versión y se resuelve por número, sin pantalla para recorrerlas.

## Decisions

- **La habilidad es el agregado y los criterios viven dentro.** Un criterio no tiene vida propia fuera de su nivel: se guarda como lista ordenada dentro del nivel, y el `PUT` reemplaza la lista completa. Alternativa considerada: criterio como recurso con id y endpoints propios. Se descarta para este alcance: obliga a resolver orden y reordenamiento por separado, para un dato que siempre se edita en bloque.
- **El nivel esperado se declara por rol, no por persona.** Es lo que el diseño asume y lo que hace que la brecha se pueda sumar por span. Queda anotado como el supuesto a confirmar: si en Tuya la exigencia varía por persona, cambia esta tabla y nada de las pantallas.
- **Versionar es un contador, no un historial navegable.** Cada publicación sube la versión y guarda una copia del catálogo; la evaluación guarda el número. Alcanza para cumplir "una evaluación cerrada no se recalcula" sin construir una pantalla de historial que nadie pidió.
- **Retirar una habilidad en uso se resuelve desactivando.** Borrar dejaría evaluaciones apuntando a algo inexistente; desactivar mantiene la historia legible y saca la habilidad de las evaluaciones nuevas.
- **Los roles salen del snapshot de personas.** Inventar un catálogo de roles duplicaría un dato que ya existe y se desincronizaría con el primer alta de persona.
- **La pantalla es de Admin, no del Chapter Lead.** El catálogo es el instrumento de medición: si cada líder lo edita, dos chapters dejan de ser comparables.

## Risks / Trade-offs

- **[Reemplazar la lista completa de criterios pisa ediciones simultáneas]** → Aceptable: es una pantalla de Admin con un editor a la vez. Si alguna vez importa, el contador de versión ya es el punto donde enganchar un control de concurrencia.
- **[Un rol sin nivel definido esconde brechas reales]** → Por eso se muestra explícitamente como "sin definir" en el detalle, y no como un cero.
- **[La escala fija de cuatro niveles no cubre una habilidad que quiera tres]** → Es una decisión del sistema, no una limitación técnica: la comparación entre habilidades y con el seniority depende de que la escala sea una sola.

## Migration Plan

1. Mock: modelo, semillas de las nueve habilidades y sus criterios, versión y snapshots.
2. Service y adapter (agrupación, conteos, habilidad incompleta, roles desde personas) con sus pruebas.
3. Pantalla: índice, detalle con los cuatro niveles y el editor de criterios, tabla de nivel esperado por rol.
4. Ruta, entrada de navegación y breadcrumb; ajuste de las pruebas del shell de Admin.
5. Verificación en pantalla con `pnpm dev:auth`.

Rollback: retirar la ruta y la entrada del menú; nada existente depende del catálogo todavía.
