## Why

Hoy cada pantalla del módulo le muestra al Líder de Expertise sólo su gente: el servidor resuelve, a partir del titular del token, cuál es su chapter y acota personas, células, ausencias, dedicación, competencias y facturación a ese conjunto. Eso convierte cifras que deberían ser de la organización en cifras de una porción, y obliga a explicarlo en pantalla con una palabra que además está en inglés: la card de Células dice "41% del chapter" sin que se entienda de qué chapter habla, porque hay varios.

La gestión de capacidad se quiere leer completa: quién existe, cómo está repartido y dónde falta gente, sin que el rol de quien mira recorte los datos. La vista personal —"lo mío"— no desaparece del plan: se resuelve más adelante con un módulo propio ("Mi Espacio de Trabajo" / "Mi Línea"), que es donde el acotamiento por titular vuelve a tener sentido. Este change libera esa vista general y deja el camino despejado para aquel módulo.

## What Changes

- **BREAKING: se elimina el acotamiento por titular del token.** Toda pantalla que enumere, cuente o resuma —Personas, Células, Equipos, Iniciativas, Ausencias, Dedicación, Competencias, Facturación y la Torre de control— pasa a considerar el conjunto completo registrado, sin filtrar por el chapter de quien mira. El servidor deja de resolver un ámbito a partir del `oid`.
- **Los totales, promedios y porcentajes se calculan sobre ese conjunto completo.** Es el mismo cambio visto desde las cifras: el denominador deja de ser "la gente de este lead" y pasa a ser toda la gente registrada.
- **Se elimina la palabra "chapter" de todo texto visible**, sin reemplazarla por otra: donde era un complemento se quita ("41% del chapter" → "41%"; "Registra una nueva célula del chapter." → "Registra una nueva célula."). La palabra sigue viva en el código, los DTO, los endpoints y las rutas, que no son texto de cara al usuario.
- **La regla de idioma se hace explícita y verificable**: el texto de interfaz se escribe en español, y el verificador de escritura que ya existe pasa a fallar si "chapter" reaparece en una cadena visible.
- El alta de persona deja de heredar el chapter de quien la crea; `Person.chapterId` se conserva como dato, porque es lo que el futuro módulo "Mi Línea" necesitará para acotar.

## Capabilities

### New Capabilities
<!-- Ninguna: este change quita comportamiento y reescribe requisitos existentes. -->

### Modified Capabilities
- `chapter-lead-shell`: se elimina el requisito "El Chapter Lead sólo ve las personas a su cargo" — con el acotamiento fuera, no queda nada que ese requisito describa.
- `people`: el resumen y el listado dejan de ser "las personas a cargo del Chapter Lead" y pasan a ser todas las registradas.
- `absences`: el calendario, la cola por aprobar y el impacto en FTE dejan de acotarse al chapter.
- `real-dedication`: el listado de balance de carga deja de ser "los colaboradores del chapter" y pasa a ser todos.
- `career-plan`: la matriz del span y su resumen se calculan sobre todas las personas evaluadas.
- `api-mocking`: los mocks dejan de resolver un ámbito por titular; se retira esa obligación del contrato simulado.
- `control-tower`: se confirma sobre el conjunto completo y se quita el rótulo "del chapter" de sus indicadores.
- `skills-catalog`: el nivel esperado por cargo deja de describirse como "del chapter".
- `ui-writing`: se suma la regla de que el texto visible va en español, sin anglicismos como "chapter".

## Impact

- **`frontend/src/mocks/handlers/`**: `chapters.ts` (deja de resolver el titular), `scope.ts` (se retira o se reduce a la vista completa) y los handlers que hoy lo consumen — `people`, `chapter`, `squads`, `absences`, `dedication`, `allocations`, `billing`, `career-plan`, `personDetail`.
- **`frontend/src/features/`**: 16 textos visibles con "chapter" en Células, Torre de control, Ausencias, Competencias, Dedicación, Personas, Líneas y Equipos.
- **`frontend/src/shared/__test__/uiWriting.test.ts`**: suma "chapter" a las formas que el verificador rechaza.
- **Tests**: `mocks/handlers/__test__/chapters.scope.test.ts` (14 pruebas dedicadas al acotamiento) se elimina; se revisan los de `dedication`, `personDetail`, `SpanMatrixContainer` y `DedicationContainer`, que montan sesión y pueden depender del conjunto acotado.
- **Backend .NET**: no se toca. Hoy no autentica ni acota (`ARCHITECTURE.md`: la autenticación es externa), y `IPersonRepository.GetByChapterAsync` no tiene llamadores — queda como código muerto a retirar en su propio change.
- **Estados vacíos**: el chapter sembrado sin gente ("Datos Avanzados") deja de ser alcanzable como estado vacío del listado; hay que decidir cómo se sigue cubriendo ese caso en los mocks.
