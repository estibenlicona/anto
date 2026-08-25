## 1. Datos

- [x] 1.1 Verificado: `add-skills-catalog` está aplicado (14/14) con su handler, su snapshot por versión y el seam `setSkillUsageLookup` que este change toma. Sin archivar todavía: **al archivar el orden es add-skills-catalog → add-skill-assessment.**
- [x] 1.2 Modelar la evaluación en el mock: persona, ciclo, estado, y por habilidad el nivel elegido, los criterios marcados y la nota; más la versión del catálogo estampada al cerrar.
- [x] 1.3 Handlers: `GET` (en curso o última cerrada), `POST` de apertura (400 si ya hay una en curso), `PUT` de una habilidad (400 con brecha y sin nota, o nivel fuera de escala), `PUT` de cierre (400 con habilidades sin nivel). Derivar nivel esperado, brecha y criterios faltantes del catálogo; nunca aceptarlos digitados.
- [x] 1.4 Semillas: evaluaciones cerradas de varias personas con roles distintos, una en curso a medio recorrer y una persona sin evaluar. Snapshot de sólo lectura de las cerradas.
- [x] 1.5 Pruebas del handler: brecha derivada y no digitada, nota obligatoria sólo con brecha, cierre incompleto rechazado, y una evaluación cerrada que no se mueve cuando el catálogo cambia de versión.
- [x] 1.6 `assessmentService` + `AssessmentAdapter` (avance, agrupación, contadores de criterios por nivel, etiquetas y estado de brecha) con pruebas del adapter.

## 2. Pantalla de evaluación

- [x] 2.1 Índice de habilidades con avance, agrupación humanas/técnicas y marca de evaluada, en curso o pendiente.
- [x] 2.2 Los cuatro niveles con su lista de criterios marcables y su contador ("cumple 5 de 6"), sin asumir cantidad, según el artboard aprobado.
- [x] 2.3 Bloque de brecha: estado (con brecha, sin brecha, rol sin nivel definido), los criterios sin marcar del nivel exigido, y la nota obligatoria sólo cuando hay brecha.
- [x] 2.4 Navegación entre habilidades, guardar y retomar, y cierre con la validación de completitud.
- [x] 2.5 Pruebas de componentes y contenedor (marcar criterios y elegir nivel, brecha derivada visible, nota exigida, cierre incompleto rechazado, retomar lo guardado).

## 3. Entrada y ruta

- [x] 3.1 Ruta `/app/lead/personas/:id/evaluacion` con su breadcrumb, y la acción para abrir la evaluación desde el detalle de persona; ajustar las pruebas de rutas.
- [x] 3.2 Typecheck, lint y suite completa sin regresiones frente al baseline conocido.

## 4. Verificación

- [x] 4.1 Con `pnpm dev:auth`: evaluar una habilidad marcando criterios, comprobar que la brecha se arma sola con los que quedaron sin marcar, intentar cerrar incompleta, completar y cerrar; después publicar un cambio en el catálogo y verificar que la evaluación cerrada no se movió.
