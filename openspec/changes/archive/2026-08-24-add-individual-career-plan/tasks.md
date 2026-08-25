## 1. Datos

- [x] 1.1 Verificado: `add-span-skill-matrix` aplicado (15/15) con su capacidad `career-plan`, y la app ya tiene la fila con detalle desplegable de tuip (`TableRowProps` con `detail`, `expanded` y `onExpandedChange`). **Al archivar: add-skills-catalog → add-skill-assessment → add-span-skill-matrix → add-individual-career-plan.**
- [x] 1.2 Handler y modelo de acciones del plan: brecha de origen obligatoria, nivel objetivo, compromiso, estado; 400 si la acción no referencia una brecha registrada o si la brecha no existe para esa persona.
- [x] 1.3 Semillas: una persona con varias brechas, alguna con dos acciones, alguna sin ninguna, y una acción ya cumplida cuya brecha sigue abierta.
- [x] 1.4 Ampliar el adapter de `career-plan` con el perfil individual: por habilidad, nivel alcanzado, nivel exigido por su rol, estado, y los criterios cumplidos y faltantes tomados de la evaluación cerrada; más las brechas con y sin acción.
- [x] 1.5 Pruebas: acción sin brecha rechazada, acción cumplida que no cierra la brecha, brecha que se cierra cuando una evaluación posterior alcanza el nivel, y habilidad cuyo rol no declara nivel.

## 2. Perfil individual

- [x] 2.1 Encabezado de la persona con rol, fecha de última evaluación y brechas abiertas; estado alternativo cuando no tiene ninguna evaluación cerrada.
- [x] 2.2 Perfil por habilidad, agrupado en técnicas y humanas: medidor con el nivel alcanzado, marca del nivel que su rol pide, y estado (al nivel o cuántos faltan); sin marca cuando el rol no declara nivel.
- [x] 2.3 Fila desplegable con el detalle de criterios en dos columnas —lo que cumple en su nivel, lo que le falta del exigido— con el contador de cada bloque y varias filas abiertas a la vez.
- [x] 2.4 Pruebas del perfil y del detalle (habilidad con y sin brecha, rol sin nivel declarado, dos filas abiertas).

## 3. Plan de acciones

- [x] 3.1 Tabla de acciones con su brecha de origen, objetivo de nivel, compromiso y estado; señalar las brechas que no tienen ninguna acción.
- [x] 3.2 Alta de acción desde una brecha, con la validación de que siempre nace de una; marcar una acción como cumplida sin cerrar la brecha.
- [x] 3.3 Dejar explícita en la pantalla la regla de que la brecha se cierra reevaluando.
- [x] 3.4 Pruebas de la tabla y del alta.

## 4. Ruta y enlaces

- [x] 4.1 Registrar `/app/lead/plan-carrera/:personId` con su breadcrumb, y los enlaces desde la matriz del span y desde el detalle de persona; ajustar las pruebas de rutas.
- [x] 4.2 Typecheck, lint y suite completa sin regresiones frente al baseline conocido.

## 5. Verificación

- [x] 5.1 Con `pnpm dev:auth`: abrir el plan de una persona con brechas, desplegar una habilidad y comprobar que los criterios cumplidos y faltantes son los mismos de su evaluación, registrar una acción sobre una brecha, marcarla cumplida y verificar que la brecha sigue abierta; después reevaluar esa habilidad alcanzando el nivel y confirmar que la brecha se cierra y que el total del span baja.
