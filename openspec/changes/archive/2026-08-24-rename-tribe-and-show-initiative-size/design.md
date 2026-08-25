## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **La relación existe en un solo sentido.** La iniciativa conoce su célula (`InitiativeDto.squadId`); la célula no sabe nada de sus iniciativas. `features/squads` y `features/allocations` no tienen **ninguna** referencia a iniciativas.
- **La talla no siempre existe.** Vive en `evaluation.talla`, y una iniciativa en evaluación puede no tener evaluación guardada. El listado de Iniciativas ya trata ese caso: donde iría la talla, pone un enlace a evaluar.
- **Los datos no son uno a uno.** 5 células sembradas; tres tienen **dos** iniciativas vigentes cada una. Un diseño que asuma "la iniciativa de la célula" es falso ya en las semillas.
- **La palabra "Equipo" está ocupada.** En el listado es la columna de avatares; en el detalle es un indicador, una sección y una pestaña; en `allocations` es el nombre de la sección donde se gestionan las asignaciones. Y "equipo" aparece además dentro de frases de cálculo — "el FTE disponible de su equipo" — donde significa *las personas asignadas*.
- **Cuatro requisitos tienen deltas sin archivar** que hay que unir: *Listar células*, *Resumen del módulo de Células* y *Handler de mock para células* (`compact-squads-summary`), y *Detalle de célula* (`fuse-capacity-cards-in-cell-detail`).

## Goals / Non-Goals

**Goals:**

- Que quien mira la capacidad de una célula vea, sin salir de la pantalla, de qué tamaño es el trabajo que la ocupa.
- Que cada palabra del módulo signifique una sola cosa.

**Non-Goals:**

- Gestionar la iniciativa de una célula desde el listado.
- Cambiar el módulo de Iniciativas, que ya muestra la talla y del que este change toma el mapa de colores.
- Trabajo en tuip: `Tag`, `TagColor` y el mapa `tallaColor` ya existen.

## Decisions

- **Un solo change para los dos puntos, y no dos.** Ambos modifican *Listar células*. Con dos changes, el segundo tendría que unir su delta contra el primero sin archivar — el mismo mecanismo que ya falló acá. Un change, una unión.
- **La unión se arma desde el texto pendiente *y* desde el principal, no desde uno de los dos.** Al armar este delta, `compact-squads-summary` parecía el texto más completo de *Listar células*. No lo era: la spec principal había ganado después dos escenarios que ese delta no tiene (*Los controles siguen ahí mientras recarga*, *Elegir varios criterios sin reabrir el filtro*). Lo detectó `openspec validate`, no la lectura. La regla operativa que queda: **unir contra los dos y validar**, porque "el delta pendiente es el más nuevo" es falso en cuanto se archiva algo entremedio.
- **Renombrar primero el sentido "personas" y después `tribu → equipo`.** Al revés, el segundo paso produce "equipo" donde el primero todavía tiene que distinguir, y ya no hay forma de saber cuál era cuál. El orden no es preferencia: es lo que hace el cambio reversible de leer.
- **"Vigente" significa activa o en evaluación.** Una iniciativa cerrada no compromete capacidad, y mostrarla al lado de la barra de ocupación sugeriría que sí. Alternativa considerada: mostrarlas todas y distinguirlas por estado — se descartó porque la columna existe para explicar la capacidad ocupada, no para ser un historial.
- **Con varias iniciativas, las tallas y el conteo; nunca la primera sola.** Mostrar sólo una afirmaría que la célula sostiene un único trabajo, que es falso en tres de las cinco células sembradas. Las tallas caben —son etiquetas de una o dos letras— y el nombre se reemplaza por "N iniciativas". Alternativa considerada: una fila por iniciativa, descartada porque rompe la altura uniforme que el propio requisito protege.
- **El mapa de talla → color se comparte, no se copia.** `tallaColor` vive en `features/initiatives`; Células lo importa, como `people` ya importa `MIX_COLORS` de `features/squads`. Copiarlo daría dos mapas que empiezan iguales y divergen en silencio la primera vez que se toque uno — por eso hay un escenario que afirma que la talla se ve igual en las dos pantallas.
- **El handler deriva las iniciativas, no las persiste en la célula.** Es el mismo patrón con el que ya deriva las cifras de capacidad desde el mock de asignaciones. Guardarlas en la célula obligaría a mantener las dos puntas en sincronía y haría que una iniciativa evaluada no se reflejara hasta reiniciar el mock.
- **La lista de iniciativas viaja vacía, nunca `null`.** Dos formas del mismo caso obligan a cada consumidor a acordarse de las dos.

## Risks / Trade-offs

- **[El contrato rompe: `tribe` → `team`]** → Es lo que se pidió explícitamente y está marcado BREAKING en la propuesta. Un cliente que siga mandando `tribe` no falla silenciosamente: el campo queda vacío y la validación de obligatorio lo rechaza, que es la forma ruidosa del error.
- **[Seis nombres de escenario siguen diciendo "equipo" con el sentido viejo]** — *Célula con equipo*, *Célula sin equipo*, *Ver el equipo de una célula*, *Resumen del equipo*, *El resumen se actualiza tras gestionar el equipo*, *Buscar en el equipo*, y el requisito *Gestión del equipo desde el detalle de la célula* → El validador rechaza renombrar un escenario dentro de un bloque MODIFIED, así que los nombres quedan y **los cuerpos se escribieron sin ambigüedad**: dicen "personas" donde antes decían "equipo". Es deuda de vocabulario visible sólo en las specs, no en la aplicación.
- **[El módulo de Personas sigue diciendo "tribu"]** → Declarado fuera de alcance en la propuesta, con el motivo: los dos requisitos que lo describen tienen deltas pendientes que divergen entre sí. Por eso el atributo `squadTribe` **no** se renombra: si se renombrara, esas specs describirían un dato que ya no se llama así, y nada fallaría al respecto.
- **[Una columna más en un listado ya denso]** → El listado pasa de 5 a 6 columnas. La nueva usa el mismo patrón de dato principal + subtítulo que la primera, así que no agrega una forma nueva de leer; y la descripción de la célula sigue sin columna propia. Si aprieta, lo que sobra es la descripción, no la talla.
- **[La columna hace que el listado dependa del mock de iniciativas]** → Ya depende del de asignaciones por las mismas razones. Lo que hay que cuidar es que una iniciativa sin evaluación no rompa el listado entero: por eso la talla es `null` y no una ausencia de campo.

## Migration Plan

1. El contrato: `tribe` → `team` en DTO, handler, semillas, adapter, formulario y validación, con sus pruebas.
2. El vocabulario visible: columna, buscador, formulario, mensajes, resumen, detalle y sección de asignaciones.
3. El handler deriva las iniciativas vigentes de cada célula con su talla.
4. La columna en el listado, con los cuatro estados (una, varias, sin evaluar, ninguna).
5. Verificación en pantalla con las semillas, que ya cubren los cuatro estados sin tocarlas.

Rollback: los pasos 3 y 4 se revierten solos (una columna y un campo derivado). El paso 1 no, porque es el contrato: revertirlo es otro cambio de contrato.

## Open Questions

- Si el orden de las tallas cuando hay varias debe ser por tamaño o por fecha de la iniciativa. Se puede responder al implementar sin cambiar el requisito, que sólo exige mostrarlas todas hasta tres.
