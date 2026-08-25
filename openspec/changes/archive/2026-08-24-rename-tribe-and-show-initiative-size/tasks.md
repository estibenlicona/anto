## 1. El contrato

- [x] 1.1 Renombrar `tribe` a `team` en la célula: DTO del servicio, adapter (lectura, alta y edición), formulario, validación y sus mensajes, y el handler de mock con sus semillas. El filtro `search` pasa a buscar contra `team`.
- [x] 1.2 Comprobar que no queda ningún `tribe` en el módulo de Células. Buscar `tribu` con `grep` no alcanza y es la trampa conocida acá: **`distribución` y `toHaveAttribute` contienen la palabra**, y ya inflaron el conteo dos veces en este mismo trabajo. Buscar `tribe`, que es el identificador, y filtrar `distribu` y `ttribu` al buscar el texto en español.
- [x] 1.4 Sacar el otro sentido de `team` del mismo contrato: `teamAvailableFte` pasa a `peopleAvailableFte` y `withoutTeamCount` a `withoutPeopleCount`, y `tribeCount` a `teamCount`. Sin esto el DTO queda con `team` (la agrupación) y `teamAvailableFte` (las personas) uno al lado del otro, que es el defecto que este change existe para sacar. Queda dentro del módulo: `control-tower` y `people` declaran ese campo en DTOs propios (`OverviewSquadDto`, `SuggestedSquadDto`) y no se tocan.
- [x] 1.3 Pruebas: alta y edición persisten y devuelven `team`; un cuerpo que mande `tribe` falla la validación de campo obligatorio en vez de guardar la célula sin agrupación; la búsqueda encuentra por agrupación.

## 2. El vocabulario que se lee

- [x] 2.1 Renombrar en el **orden del diseño**: primero lo que hoy se llama "Equipo" y significa las personas —columna del listado, indicador y sección del detalle, y la sección de asignaciones—, y **después** Tribu a Equipo. Al revés no hay forma de distinguir cuál era cuál.
- [x] 2.2 Arrastrar las lecturas derivadas, que es donde esto se olvida: "Sin equipo" pasa a "Sin personas" en la fila **y** en la leyenda del resumen; "todavía no hay equipo" pasa a "todavía no hay personas"; y el plural del resumen pasa de "en 4 tribus" a "en 4 equipos", con su campo `tribeCount`.
- [x] 2.3 Pruebas: actualizar las que afirmen esos textos, y agregar una que compruebe que **ninguna columna del listado repite el rótulo de otra**. Es la única que falla si alguien vuelve a introducir la colisión.

## 3. Las iniciativas de cada célula

- [x] 3.1 Que el handler de células derive, para cada célula, sus iniciativas **vigentes** —activas o en evaluación, nunca cerradas— con id, nombre, estado y talla, tomándolas del mock de iniciativas igual que ya toma las cifras de capacidad del de asignaciones. La talla viaja `null` cuando no hay evaluación guardada; la lista viaja vacía, nunca `null`.
- [x] 3.2 Pruebas: una célula con una activa evaluada, una en evaluación sin evaluar y una cerrada devuelve dos iniciativas y omite la cerrada; una célula sin ninguna devuelve lista vacía; y evaluar o cerrar una iniciativa se refleja en el listado de Células sin reiniciar el mock.

## 4. La columna

- [x] 4.1 Agregar la columna al listado, contigua a la de capacidad, con la talla como dato principal y el nombre debajo como enlace neutro a su evaluación — el mismo patrón de la primera columna, y sin el rojo de marca.
- [x] 4.2 Importar `tallaColor` de `features/initiatives` en lugar de copiar el mapa. Copiarlo da dos mapas que divergen en silencio la primera vez que se toque uno.
- [x] 4.3 Resolver los cuatro estados: una iniciativa, varias (las tallas hasta tres y "N iniciativas" debajo, en lugar del nombre), vigente sin evaluar ("Sin evaluar"), y ninguna ("Sin iniciativa"). Las semillas ya cubren los cuatro sin tocarlas.
- [x] 4.4 Pruebas: los cuatro estados; que la altura de las filas no cambie con varias iniciativas; y que la talla resuelva al mismo color que en el módulo de Iniciativas.

## 5. Cierre

- [x] 5.1 Typecheck, lint y suite completa sin regresiones frente al baseline conocido (`App.test.tsx` y `httpClient.test.ts` fallan de antes y no cuentan).

## 6. Verificación

- [x] 6.1 Con `pnpm dev:auth`, en `/app/lead/celulas`: comprobar que se ven **Equipo** (la agrupación) y **Personas** (quiénes la integran) como columnas distintas, y que la columna de iniciativas muestra los cuatro estados con las cinco células sembradas.
- [x] 6.2 Abrir el detalle de una célula y comprobar que el encabezado muestra el equipo y que la sección se llama Personas — que es donde la colisión sobrevive si el paso 2 se hizo a medias.
- [x] 6.3 Dar de alta y editar una célula, comprobando que el campo se llama Equipo y que sus mensajes de validación lo nombran igual.
