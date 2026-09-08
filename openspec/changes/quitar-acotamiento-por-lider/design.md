## Context

Ver `proposal.md` — Why. Lo relevante para el cómo:

- **El acotamiento vive entero en los mocks.** `frontend/src/mocks/handlers/chapters.ts` expone `holderChapterId(request)`: lee el `Authorization`, saca el `oid` (acepta tanto `simulated.<oid>.token` como un JWT real leyendo `payload.oid`) y busca el chapter cuyo `leadEntraObjectId` coincide; si no encuentra ninguno devuelve `null`, que significa "sin acotar". `people.handlers.ts` lo aplica en `peopleFor(request)`, y `scope.ts` envuelve eso en `vistaDe(request)` para los handlers que cruzan personas con algo indexado por persona.
- **La regla de las dos puntas.** `scope.ts` documenta por qué la vista trae personas *y* asignaciones ya acotadas: acotar sólo las personas convierte a la gente ajena en personas de 0 FTE disponible, y entonces la célula aparece al tope, el FTE libre da negativo y los porcentajes pasan de 100. Al quitar el acotamiento esa trampa desaparece por completo — no hay dos puntas que sincronizar cuando no se filtra nada—, y con ella desaparece la razón de ser de `scope.ts`.
- **El backend no acota ni autentica.** `backend/ARCHITECTURE.md` (línea 97): *"Authentication and authorization are intentionally external to this template. The service does not configure token authentication, authorization policies, controller authorization attributes, or Swagger security schemes."* No hay `RequireAuthorization`, ni `ClaimsPrincipal`, ni lectura de `oid` en ningún caso de uso. `GetChapterCapacityOverviewUseCase` ya calcula sobre `GetAllAsync()`. Existe `IPersonRepository.GetByChapterAsync` con su implementación, pero **sin un solo llamador**: es código muerto.
- **"Chapter" y "línea de expertise" son cosas distintas en este sistema.** No son dos nombres de lo mismo: `Person.chapterId` apunta a los chapters de `chapters.ts` ("Core y Datos", "Canales Digitales", "Datos Avanzados") con sus leads, y `Person.expertiseLineId` apunta a las líneas de `expertise-lines.seeds.ts` ("Backend", "QA", "Frontend") con los suyos y con pantalla propia. La prueba `chapters.scope.test.ts` fija la distinción a propósito: en la ficha de una misma persona conviven `expertiseLineName`, `expertiseLineLeadName` y `chapterLeadName`, y son valores diferentes.
- **La equivalencia del doc de roles no es utilizable.** `context/docs/Roles_y_Permisos_Plataforma.md` §11 registra que "el código dice `chapter` y la UI dice «línea de expertise»". A nivel de datos eso es falso, según el punto anterior. Traducir "chapter" por "línea de expertise" en pantalla haría que una frase nombre la agrupación equivocada.
- **Los estados vacíos del acotamiento.** `chapters.ts` siembra "Datos Avanzados" **sin ninguna persona**, precisamente para que el estado vacío de los listados sea alcanzable entrando como su lead. Sin acotamiento, ese camino desaparece.

## Goals / Non-Goals

**Goals:**
- Que toda pantalla del módulo muestre el conjunto completo, sin recortar por quién mira.
- Que los totales, promedios y porcentajes se calculen sobre ese mismo conjunto completo, sin quedar a medio camino entre dos denominadores.
- Que ningún texto visible use la palabra "chapter", sin sustituirla por otra.
- Que la regla de idioma quede escrita y verificada automáticamente, para que no haya que descubrir el próximo anglicismo leyendo la pantalla.

**Non-Goals:**
- **Construir la vista personal.** "Mi Espacio de Trabajo" / "Mi Línea" es un módulo propio y posterior; este change sólo deja de acotar y conserva el dato que ese módulo necesitará.
- **Renombrar `chapter` en el código.** Identificadores, campos de los contratos, rutas y endpoints se quedan como están. Es la decisión R-17 del doc de roles, que ya estaba diferida y sigue estándolo: un renombre sin valor observable es un change propio o no se hace.
- **Retirar `IPersonRepository.GetByChapterAsync` del backend.** Es código muerto, pero borrarlo no es parte de quitar el acotamiento del front; va en su propio change para que el diff de éste no mezcle dos cosas.
- **Cambiar el modelo de permisos de sección.** Qué secciones ve cada rol no se toca acá: eso es `Capacidad.*`, y es otra dimensión que la de qué datos trae cada sección.

## Decisions

1. **`holderChapterId` deja de existir como regla de alcance.** La función se retira de `chapters.ts` junto con `peopleFor(request)` y `vistaDe(request)`. No se reemplazan por una versión que "siempre devuelve todo": una función que ya no decide nada es una indirección que el próximo lector tiene que abrir para descubrir que no hace nada. Los handlers pasan a leer directamente el snapshot completo de personas y asignaciones, que es lo que hacían antes de que existiera el acotamiento.
2. **`scope.ts` se elimina.** Su única razón de ser era sincronizar las dos puntas del acotamiento; sin acotamiento no queda nada que sincronizar. La advertencia sobre filtrar las dos puntas se conserva como comentario en el módulo que quede a cargo de cruzar personas con asignaciones, porque vuelve a hacer falta el día que exista la vista personal.
3. **`Person.chapterId` se conserva como dato.** No se borra del contrato ni de las semillas: la vista personal lo va a necesitar para acotar, y quitarlo ahora obligaría a reponerlo después con una migración de datos de por medio. Lo que se retira es su papel como filtro; el campo sigue viajando y sigue mostrándose en la ficha de la persona.
4. **El alta de persona ya no hereda el chapter de quien la crea.** Hoy `people.handlers.ts` le pone al alta el chapter del titular, con el argumento de que "sin esto, un lead crearía personas que su propio listado no muestra" — argumento que muere con el acotamiento. La persona nueva nace **sin chapter** (`null`), que es lo honesto: nadie declaró a cuál pertenece. Asignarle uno por el azar de quién apretó el botón sería inventar un dato que después la vista personal leería como verdad.
5. **Los textos pierden el complemento, no lo cambian.** "41% del chapter" queda "41%"; "Registra una nueva célula del chapter." queda "Registra una nueva célula."; "FTE DEL CHAPTER" queda "FTE". Es la decisión del usuario y además la correcta: con el acotamiento fuera, el complemento no aporta nada — la cifra es de todo lo registrado, que es lo que uno supone por defecto cuando nadie dice lo contrario. Donde la frase quede coja al quitar el complemento, se reescribe entera en vez de encajar un sustantivo.
6. **La regla de idioma se escribe en `ui-writing` y se verifica en el mismo lugar que el registro neutro.** `frontend/src/shared/__test__/uiWriting.test.ts` ya barre el código buscando formas prohibidas con una lista de excepciones; sumar "chapter" ahí cuesta poco y cierra la puerta a la reincidencia. La verificación tiene que distinguir texto visible de identificadores: `chapterId` y `chapterFte` no pueden hacerla fallar.
7. **El estado vacío se cubre con un filtro, no con un chapter.** Sin acotamiento no hay forma de llegar a "no hay ninguna persona" por la vía de entrar como el lead de un chapter vacío. El caso se sigue cubriendo desde las pruebas, que ya saben vaciar el snapshot del mock, y desde la interfaz con el estado de "sin resultados" de la búsqueda y los filtros, que es un camino real y que el usuario sí recorre. El chapter "Datos Avanzados" se conserva en las semillas como dato — sirve para que haya más de un chapter y la ficha de persona muestre valores distintos— pero deja de tener el papel de fixture del estado vacío.

### Limitación de la herramienta

8. **Los títulos de los escenarios no se pueden renombrar.** `openspec validate` compara los títulos de escenario de un bloque MODIFIED contra los del spec principal y rechaza el delta si falta alguno ("MODIFIED omits scenario(s) the current spec still has"). Se probaron las tres alternativas y ninguna funciona: REMOVED + ADDED del mismo requisito da "present in both ADDED and REMOVED", y RENAMED a nivel de requisito tampoco ayuda, porque la comparación de escenarios se hace igual contra los del nombre viejo. Es la misma limitación que documentó `add-teams-module`.

   Consecuencia: dos escenarios quedan con un título que describe la regla anterior y un cuerpo que describe la vigente —"Los indicadores cuentan sólo lo que el lead tiene a cargo" y "El listado sólo contiene lo que el lead tiene a cargo", los dos en `people`—. En ambos el THEN dice explícitamente que el título describe la regla anterior y no la vigente, para que nadie lo lea como una contradicción sin explicar. **Los títulos de los requisitos sí se pueden cambiar** con `## RENAMED Requirements`, y por ahí se resuelven los que llevaban "chapter" en el nombre: "Pantalla de ausencias del chapter", "Habilidades que concentran la brecha del chapter", "Pendientes de gestión del chapter", "Handler de mock para el resumen de capacidad del chapter" y "Resumen de capacidad del chapter".

## Risks / Trade-offs

- [Dos escenarios de `people` quedan con el título desalineado del cuerpo] → se explica dentro del propio THEN y en la Decisión 8; corregirlos requiere que OpenSpec permita renombrar escenarios, o un change dedicado que reescriba el requisito entero con otro nombre.
- [Las pantallas pasan a mostrar datos de gente que antes no se veía] → es exactamente lo pedido, y no es un problema de confidencialidad nuevo: el backend nunca acotó nada, así que los datos ya viajaban completos a cualquiera que llamara la API directamente. El acotamiento del mock daba una impresión de restricción que el sistema real no tenía.
- [Se pierde el camino de interfaz para ver el estado vacío de los listados] → cubierto por las pruebas y por el estado de "sin resultados" (Decisión 7); lo que se pierde es un atajo de demostración, no una garantía.
- [Las cifras cambian de valor en todas las pantallas] → es el objetivo, pero conviene saberlo al revisar: capturas y números de pruebas previas dejan de coincidir, y toda comparación con lo anterior es esperable que difiera.
- [La verificación de anglicismos puede dar falsos positivos sobre identificadores] → la Decisión 6 lo acota: la regla es sobre texto visible; si el verificador no sabe distinguirlo, hay que enseñarle antes de sumar la palabra, no relajar la regla.

## Migration Plan

1. **Mocks — quitar el acotamiento**: retirar `holderChapterId`, `peopleFor(request)` y `scope.ts`; pasar los handlers consumidores a los snapshots completos. Es el paso que cambia el comportamiento; todo lo demás lo acompaña.
2. **Mocks — alta de persona**: la persona nueva nace sin chapter (Decisión 4).
3. **Tests de mocks**: eliminar `chapters.scope.test.ts` (14 pruebas dedicadas al acotamiento) y ajustar las que montan sesión y esperaban un conjunto recortado.
4. **Textos visibles**: los 16 textos con "chapter", quitando el complemento (Decisión 5).
5. **Verificación de escritura**: sumar la palabra al verificador, distinguiendo texto de identificadores.
6. **Tests de interfaz**: ajustar los que fijan cifras que ahora se calculan sobre el conjunto completo.
7. **Suites completas** del front en verde, y verificación visual de que las cifras cierran y ningún texto quedó cojo tras perder su complemento.

Rollback: `git revert`. No hay migración de datos ni cambio de contrato, así que revertir devuelve el comportamiento anterior sin más.

## Open Questions

- Ninguna bloqueante. Queda anotado para la vista personal: cuando exista "Mi Espacio de Trabajo" / "Mi Línea", habrá que decidir si acota por `chapterId`, por `expertiseLineId` o por ambos, porque son dos relaciones distintas y hoy sólo la primera decidía alcance.
