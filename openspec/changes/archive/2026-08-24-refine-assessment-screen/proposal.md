## Why

La pantalla de evaluación funciona, pero cuatro detalles le restan claridad: el aviso de que cerrar no se deshace ocupa lugar fijo debajo de los botones y aun así **cerrar no pide confirmación**, así que la advertencia está donde no frena nada; el estado de cada habilidad en el índice se dice en minúscula y en gris, con el mismo peso que el nombre de la habilidad; la frase que dice qué exige el rol está escrita en tono telegráfico; y "Guardar y seguir después" es un botón sin borde, que se lee como texto.

Ninguno cambia lo que la evaluación hace. Cambian dónde se para el ojo y qué se entiende antes de apretar.

## What Changes

- **Confirmación antes de cerrar.** El aviso "Cerrar fija los niveles y abre el plan" deja de estar permanente en pantalla y pasa a un diálogo que aparece al pulsar "Cerrar evaluación", diciendo qué se fija y que no se deshace. Es el único punto que agrega comportamiento: hoy el cierre —que es irreversible— ocurre de un solo clic.
- **Estados con marca propia en el índice.** "Evaluando" y "Pendiente" pasan de texto gris a badge. La habilidad ya evaluada conserva su ícono de verificación: es la señal que ya funcionaba y la que menos hace falta buscar.
- **Redacción del nivel exigido.** "El rol de X pide Avanzado en esta habilidad" → "El rol de X requiere un nivel Avanzado en esta habilidad", y su variante cuando el rol no declara ninguno. El nombre del rol sale del dato y no se toca: renombrar los roles del catálogo se descartó explícitamente, porque el rol se muestra en media docena de pantallas más.
- **"Guardar y seguir después" con borde.** Pasa de `subtle` a `secondary`: el mismo componente, la variante que sí dibuja el límite del área clicable y la distingue de la acción primaria.

### Fuera de alcance

- Renombrar los roles en el dato ("Backend Dev" → "Backend Developer"): afecta a Personas, Células, Plan de carrera y al detalle del mapa de calor, y es una decisión sobre el catálogo, no sobre esta pantalla.
- La lógica de la evaluación: qué se puede cerrar, cómo se calcula la brecha, qué se congela.
- Componentes nuevos en tuip: `Modal`, `Badge` y `Button variant="secondary"` ya existen y alcanzan.

## Capabilities

### Modified Capabilities

- `skill-assessment`: el índice pasa a distinguir los tres estados de una habilidad con una marca legible propia, y cerrar una evaluación pasa a requerir una confirmación explícita que diga qué se fija y que no se deshace.

## Impact

- Frontend: `src/features/assessments` — `AssessmentHeader` (confirmación y variante del botón), `AssessmentIndex` (badges), `AssessmentContainer` (redacción del nivel exigido).
- Datos: ninguno. Nada de esto cambia lo que se pide ni lo que se guarda.
- **tuip**: sin cambios. Es la primera vez en varias iteraciones que la pantalla no necesita nada del design system, y conviene que siga así: si aparece la tentación de un componente nuevo, se propone en tuip antes.
- **Orden**: `skill-assessment` todavía no existe en `openspec/specs/` — vive en el change `add-skill-assessment`, sin archivar. Los bloques MODIFIED de este change se escriben sobre ese texto pendiente, y `add-skill-assessment` debe archivarse antes que éste.
